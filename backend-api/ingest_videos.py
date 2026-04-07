import csv
import logging
import mimetypes
import os
import time
from hashlib import sha256
from importlib import metadata
from pathlib import Path
from typing import Iterable
from urllib.parse import quote

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams
from twelvelabs import TwelveLabs

logger = logging.getLogger(__name__)

VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".wmv"}
EMBEDDING_MODEL_NAME = "marengo3.0"
VECTOR_SIZE = 512
MIN_TWELVELABS_VERSION = "1.2.1"
DEFAULT_COLLECTION_NAME = "content_collection"
DEFAULT_S3_PREFIX = "videos-embed/"
DEFAULT_POLL_INTERVAL_SECONDS = 5
DEFAULT_EMBEDDING_URL_EXPIRATION_SECONDS = 60 * 60 * 24 * 7
DEFAULT_LOG_PATH = "logs/ingest_videos.log"
SUCCESS_MARK = "✅"
FAILURE_MARK = "❌"


def configure_logging() -> Path:
    log_path = Path(os.getenv("INGEST_LOG_PATH", DEFAULT_LOG_PATH)).expanduser()
    if not log_path.is_absolute():
        log_path = Path.cwd() / log_path

    log_path.parent.mkdir(parents=True, exist_ok=True)

    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)

    file_handler = logging.FileHandler(log_path, mode="a", encoding="utf-8")
    file_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers.clear()
    root_logger.addHandler(stream_handler)
    root_logger.addHandler(file_handler)

    logger.info("Writing ingestion logs to %s", log_path)
    return log_path


def configure_results_path(log_path: Path) -> Path:
    configured_path = os.getenv("INGEST_RESULTS_PATH")
    if configured_path:
        results_path = Path(configured_path).expanduser()
        if not results_path.is_absolute():
            results_path = Path.cwd() / results_path
    else:
        results_path = log_path.with_name(f"{log_path.stem}-results.csv")

    results_path.parent.mkdir(parents=True, exist_ok=True)
    return results_path


def mark_status(success: bool) -> str:
    return SUCCESS_MARK if success else FAILURE_MARK


def get_env_int(name: str) -> int | None:
    value = os.getenv(name)
    if value is None or value == "":
        return None

    return int(value)


def write_results_csv(results_path: Path, results: list[dict]) -> None:
    fieldnames = [
        "video_name",
        "source_path",
        "s3_uploaded",
        "indexing_done",
        "qdrant_inserted",
        "overall_status",
        "s3_key",
        "video_url",
        "error_message",
    ]

    with results_path.open("w", newline="", encoding="utf-8-sig") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)

    logger.info("Wrote ingestion summary CSV to %s", results_path)


def get_env(*names: str) -> str | None:
    for name in names:
        value = os.getenv(name)
        if value:
            return value

    return None


def require_env(*names: str) -> str:
    value = get_env(*names)
    if not value:
        joined_names = ", ".join(names)
        raise ValueError(f"One of these environment variables is required: {joined_names}")

    return value


def env_flag(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default

    return value.lower() in {"1", "true", "yes", "on"}


def build_qdrant_url(host_or_url: str) -> str:
    if host_or_url.startswith(("http://", "https://")):
        return host_or_url

    return f"https://{host_or_url}"


def get_twelvelabs_version() -> str:
    try:
        return metadata.version("twelvelabs")
    except metadata.PackageNotFoundError:
        return "unknown"


def ensure_twelvelabs_sdk_supports_marengo3(client: TwelveLabs) -> None:
    if hasattr(client.embed, "v_2"):
        return

    installed_version = get_twelvelabs_version()
    raise RuntimeError(
        "This ingestion flow requires Twelve Labs Embed API v2 for Marengo 3.0, "
        f"but your installed twelvelabs SDK is {installed_version}. "
        f"Upgrade to twelvelabs>={MIN_TWELVELABS_VERSION}."
    )


def get_collection_vector_size(collection_info) -> int | None:
    vectors_config = collection_info.config.params.vectors

    if hasattr(vectors_config, "size"):
        return vectors_config.size

    if isinstance(vectors_config, dict) and vectors_config:
        first_vector = next(iter(vectors_config.values()))
        return getattr(first_vector, "size", None)

    return None


def ensure_qdrant_collection(
    qdrant_client: QdrantClient,
    collection_name: str,
    recreate_on_mismatch: bool,
) -> None:
    collections = qdrant_client.get_collections().collections
    collection_exists = any(col.name == collection_name for col in collections)

    if not collection_exists:
        qdrant_client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )
        logger.info("Created Qdrant collection '%s'", collection_name)
        return

    collection_info = qdrant_client.get_collection(collection_name)
    current_vector_size = get_collection_vector_size(collection_info)

    if current_vector_size == VECTOR_SIZE:
        logger.info(
            "Qdrant collection '%s' already matches %s embeddings (%s dimensions)",
            collection_name,
            EMBEDDING_MODEL_NAME,
            VECTOR_SIZE,
        )
        return

    mismatch_message = (
        f"Collection '{collection_name}' uses vector size {current_vector_size}, "
        f"but {EMBEDDING_MODEL_NAME} returns {VECTOR_SIZE}-dimensional embeddings."
    )

    if recreate_on_mismatch:
        logger.warning("%s Recreating the collection.", mismatch_message)
        qdrant_client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )
        logger.info("Recreated Qdrant collection '%s'", collection_name)
        return

    raise RuntimeError(
        f"{mismatch_message} Set RECREATE_COLLECTION_ON_VECTOR_MISMATCH=true to "
        "recreate the collection automatically."
    )


def build_s3_client():
    profile = get_env("AWS_PROFILE")
    region = require_env("AWS_REGION")

    session_kwargs = {"region_name": region}
    if profile:
        session_kwargs["profile_name"] = profile
    else:
        access_key_id = get_env("AWS_ACCESS_KEY_ID", "AWS_ACCESS_KEY")
        secret_access_key = get_env("AWS_SECRET_ACCESS_KEY", "AWS_SECRET_KEY")
        session_token = get_env("AWS_SESSION_TOKEN")

        if access_key_id and secret_access_key:
            session_kwargs["aws_access_key_id"] = access_key_id
            session_kwargs["aws_secret_access_key"] = secret_access_key
            if session_token:
                session_kwargs["aws_session_token"] = session_token

    session = boto3.Session(**session_kwargs)
    return session.client("s3")


def iter_video_files(source_dir: Path) -> Iterable[Path]:
    for path in sorted(source_dir.rglob("*")):
        if path.is_file() and path.suffix.lower() in VIDEO_EXTENSIONS:
            yield path


def build_s3_key(source_dir: Path, video_path: Path, prefix: str) -> str:
    relative_path = video_path.relative_to(source_dir).as_posix()
    cleaned_prefix = prefix.strip("/")
    if cleaned_prefix:
        return f"{cleaned_prefix}/{relative_path}"

    return relative_path


def build_public_object_url(bucket_name: str, region: str, key: str) -> str:
    encoded_key = quote(key, safe="/")
    return f"https://{bucket_name}.s3.{region}.amazonaws.com/{encoded_key}"


def build_metadata_video_url(
    bucket_name: str,
    region: str,
    key: str,
) -> str:
    public_base_url = os.getenv("S3_PUBLIC_BASE_URL")
    encoded_key = quote(key, safe="/")

    if public_base_url:
        return f"{public_base_url.rstrip('/')}/{encoded_key}"

    if env_flag("AWS_S3_PUBLIC_READ", default=False):
        return build_public_object_url(bucket_name, region, key)

    return f"s3://{bucket_name}/{key}"


def build_embedding_source_url(
    s3_client,
    bucket_name: str,
    region: str,
    key: str,
) -> str:
    if env_flag("AWS_S3_PUBLIC_READ", default=False) or os.getenv("S3_PUBLIC_BASE_URL"):
        return build_metadata_video_url(bucket_name, region, key)

    expiration_seconds = int(
        os.getenv(
            "S3_EMBED_URL_EXPIRATION_SECONDS",
            str(DEFAULT_EMBEDDING_URL_EXPIRATION_SECONDS),
        )
    )
    return s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket_name, "Key": key},
        ExpiresIn=expiration_seconds,
    )


def upload_to_s3(
    s3_client,
    bucket_name: str,
    region: str,
    source_dir: Path,
    video_path: Path,
    prefix: str,
):
    s3_key = build_s3_key(source_dir, video_path, prefix)
    content_type = mimetypes.guess_type(video_path.name)[0] or "application/octet-stream"
    extra_args = {"ContentType": content_type}

    if env_flag("AWS_S3_PUBLIC_READ", default=False):
        extra_args["ACL"] = "public-read"

    s3_client.upload_file(
        str(video_path),
        bucket_name,
        s3_key,
        ExtraArgs=extra_args,
    )

    metadata_video_url = build_metadata_video_url(bucket_name, region, s3_key)
    embedding_source_url = build_embedding_source_url(
        s3_client,
        bucket_name,
        region,
        s3_key,
    )

    return s3_key, metadata_video_url, embedding_source_url


def create_video_embedding(client: TwelveLabs, video_url: str):
    poll_interval_seconds = int(
        os.getenv("EMBED_POLL_INTERVAL_SECONDS", str(DEFAULT_POLL_INTERVAL_SECONDS))
    )

    task = client.embed.v_2.tasks.create(
        input_type="video",
        model_name=EMBEDDING_MODEL_NAME,
        video={
            "media_source": {"url": video_url},
            "embedding_option": ["visual", "audio", "transcription"],
            "embedding_scope": ["asset"],
            "embedding_type": ["fused_embedding"],
        },
    )

    logger.info("Created Twelve Labs embedding task %s", task.id)

    while True:
        task_result = client.embed.v_2.tasks.retrieve(task.id)

        if task_result.status == "ready":
            return task_result

        if task_result.status == "failed":
            raise RuntimeError(f"Twelve Labs embedding task {task.id} failed")

        logger.info("Task %s still processing", task.id)
        time.sleep(poll_interval_seconds)


def extract_asset_embedding(task_result):
    if not task_result.data:
        raise ValueError("No embeddings found in the Twelve Labs task result")

    asset_embeddings = [
        item
        for item in task_result.data
        if getattr(item, "embedding_scope", None) == "asset"
    ]
    fused_asset_embeddings = [
        item
        for item in asset_embeddings
        if getattr(item, "embedding_option", None) == "fused"
    ]

    if fused_asset_embeddings:
        return fused_asset_embeddings[0].embedding

    if asset_embeddings:
        return asset_embeddings[0].embedding

    return task_result.data[0].embedding


def stable_point_id(seed: str) -> int:
    digest = sha256(seed.encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big", signed=False)


def build_video_id(video_path: Path, source_dir: Path) -> str:
    relative_path = video_path.relative_to(source_dir).as_posix()
    short_hash = sha256(relative_path.encode("utf-8")).hexdigest()[:12]
    stem = video_path.stem.replace(" ", "-")
    return f"{stem}-{short_hash}"


def upsert_embedding(
    qdrant_client: QdrantClient,
    collection_name: str,
    embedding_vector: list[float],
    video_id: str,
    video_url: str,
    s3_key: str,
    original_filename: str,
    source_path: str,
):
    point = PointStruct(
        id=stable_point_id(s3_key),
        vector=embedding_vector,
        payload={
            "video_id": video_id,
            "video_url": video_url,
            "s3_key": s3_key,
            "is_url": True,
            "original_filename": original_filename,
            "source_path": source_path,
            "confidence": "high",
        },
    )

    qdrant_client.upsert(collection_name=collection_name, points=[point])


def main():
    load_dotenv()
    log_path = configure_logging()
    results_path = configure_results_path(log_path)

    source_dir = Path(
        require_env(
            "VIDEO_SOURCE_DIR",
            "VIDEO_DIR",
            "VIDEO_DIRECTORY",
            "VIDEO_FOLDER",
            "SOURCE_DIR",
            "SOURCE_DIRECTORY",
            "DIRECTORY_PATH",
            "FOLDER_PATH",
        )
    ).expanduser()
    bucket_name = require_env("AWS_BUCKET_NAME")
    region = require_env("AWS_REGION")
    api_key = require_env("API_KEY", "TWELVE_LABS_API_KEY")
    qdrant_host = require_env("QDRANT_HOST", "QDRANT_URL")
    qdrant_api_key = require_env("QDRANT_API_KEY")
    collection_name = os.getenv("QDRANT_COLLECTION_NAME", DEFAULT_COLLECTION_NAME)
    s3_prefix = os.getenv("AWS_S3_PREFIX", DEFAULT_S3_PREFIX)
    recreate_on_mismatch = env_flag("RECREATE_COLLECTION_ON_VECTOR_MISMATCH", default=False)

    if not source_dir.exists() or not source_dir.is_dir():
        raise FileNotFoundError(f"VIDEO_SOURCE_DIR does not exist or is not a directory: {source_dir}")

    video_files = list(iter_video_files(source_dir))
    if not video_files:
        raise FileNotFoundError(f"No supported video files were found under {source_dir}")

    ingest_limit = get_env_int("INGEST_LIMIT")
    if ingest_limit is not None:
        video_files = video_files[:ingest_limit]

    logger.info("Starting ingestion run")
    logger.info("Source directory: %s", source_dir)
    logger.info("S3 bucket: %s", bucket_name)
    logger.info("Qdrant collection: %s", collection_name)
    logger.info("Log path: %s", log_path)
    logger.info("Results CSV path: %s", results_path)
    if ingest_limit is not None:
        logger.info("Ingest limit: %s", ingest_limit)
    logger.info("Found %s video files to ingest", len(video_files))

    s3_client = build_s3_client()
    twelvelabs_client = TwelveLabs(api_key=api_key)
    ensure_twelvelabs_sdk_supports_marengo3(twelvelabs_client)
    qdrant_client = QdrantClient(
        url=build_qdrant_url(qdrant_host),
        api_key=qdrant_api_key,
        timeout=20,
    )

    ensure_qdrant_collection(
        qdrant_client=qdrant_client,
        collection_name=collection_name,
        recreate_on_mismatch=recreate_on_mismatch,
    )

    success_count = 0
    failure_count = 0
    results: list[dict] = []

    for video_path in video_files:
        video_id = build_video_id(video_path, source_dir)
        logger.info("Processing %s", video_path.name)
        result_row = {
            "video_name": video_path.name,
            "source_path": str(video_path),
            "s3_uploaded": FAILURE_MARK,
            "indexing_done": FAILURE_MARK,
            "qdrant_inserted": FAILURE_MARK,
            "overall_status": FAILURE_MARK,
            "s3_key": "",
            "video_url": "",
            "error_message": "",
        }

        try:
            s3_key, metadata_video_url, embedding_source_url = upload_to_s3(
                s3_client=s3_client,
                bucket_name=bucket_name,
                region=region,
                source_dir=source_dir,
                video_path=video_path,
                prefix=s3_prefix,
            )
            result_row["s3_uploaded"] = SUCCESS_MARK
            result_row["s3_key"] = s3_key
            result_row["video_url"] = metadata_video_url
            logger.info("Uploaded to s3://%s/%s", bucket_name, s3_key)

            task_result = create_video_embedding(
                client=twelvelabs_client,
                video_url=embedding_source_url,
            )
            embedding_vector = extract_asset_embedding(task_result)
            result_row["indexing_done"] = SUCCESS_MARK

            upsert_embedding(
                qdrant_client=qdrant_client,
                collection_name=collection_name,
                embedding_vector=embedding_vector,
                video_id=video_id,
                video_url=metadata_video_url,
                s3_key=s3_key,
                original_filename=video_path.name,
                source_path=str(video_path),
            )

            result_row["qdrant_inserted"] = SUCCESS_MARK
            result_row["overall_status"] = SUCCESS_MARK
            logger.info("Stored embedding for %s in '%s'", video_path.name, collection_name)
            success_count += 1
        except (ClientError, BotoCoreError, RuntimeError, ValueError) as exc:
            result_row["error_message"] = str(exc)
            logger.exception("Failed to ingest %s: %s", video_path, exc)
            failure_count += 1
        finally:
            results.append(result_row)

    logger.info(
        "Ingestion finished. Succeeded: %s, Failed: %s, Total: %s",
        success_count,
        failure_count,
        len(video_files),
    )
    write_results_csv(results_path, results)

    if failure_count:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
