from flask import Flask, request, jsonify, send_file
import boto3
from twelvelabs import TwelveLabs
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
import os
from importlib import metadata

import requests
from dotenv import load_dotenv
import uuid
import logging
from werkzeug.utils import secure_filename
import json
from flask_cors import CORS
from urllib.parse import quote


from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import atexit

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

load_dotenv()

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load API keys from environment variables
API_KEY = os.getenv('API_KEY')
QDRANT_HOST = os.getenv('QDRANT_HOST') or os.getenv('QDRANT_URL')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')
AWS_BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
AWS_REGION = os.getenv('AWS_REGION')
AWS_S3_PUBLIC_READ = os.getenv('AWS_S3_PUBLIC_READ', 'false').lower() == 'true'
S3_PUBLIC_BASE_URL = os.getenv('S3_PUBLIC_BASE_URL')
PRESIGN_S3_PLAYBACK_URLS = os.getenv(
    'PRESIGN_S3_PLAYBACK_URLS', 'false'
).lower() == 'true'
S3_PLAYBACK_URL_EXPIRATION_SECONDS = int(
    os.getenv('S3_PLAYBACK_URL_EXPIRATION_SECONDS', '3600')
)
RECREATE_COLLECTION_ON_VECTOR_MISMATCH = os.getenv(
    'RECREATE_COLLECTION_ON_VECTOR_MISMATCH', 'false'
).lower() == 'true'

if not API_KEY:
    raise ValueError("API_KEY environment variable is not set")
if not QDRANT_HOST or not QDRANT_API_KEY:
    raise ValueError("Qdrant credentials are not set")

# Configure file upload settings
app.config.update(
    UPLOAD_FOLDER=os.path.join(os.getcwd(), 'uploads'),
    MAX_CONTENT_LENGTH=16 * 1024 * 1024, 
    ALLOWED_EXTENSIONS={'mp4', 'avi', 'mov', 'wmv'}
)

# Qdrant Configuration
COLLECTION_NAME = os.getenv('QDRANT_COLLECTION_NAME', 'content_collection')
EMBEDDING_MODEL_NAME = "marengo3.0"
VECTOR_SIZE = 512  # Marengo 3.0 text and video embeddings are 512-dimensional.
MIN_TWELVELABS_VERSION = "1.2.1"


def build_qdrant_url(host_or_url):
    if host_or_url.startswith(("http://", "https://")):
        return host_or_url

    return f"https://{host_or_url}"


def build_s3_client():
    if not PRESIGN_S3_PLAYBACK_URLS or not AWS_REGION:
        return None

    profile = os.getenv("AWS_PROFILE")
    session_kwargs = {"region_name": AWS_REGION}

    if profile:
        session_kwargs["profile_name"] = profile
    else:
        access_key_id = os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("AWS_ACCESS_KEY")
        secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY") or os.getenv("AWS_SECRET_KEY")
        session_token = os.getenv("AWS_SESSION_TOKEN")

        if access_key_id and secret_access_key:
            session_kwargs["aws_access_key_id"] = access_key_id
            session_kwargs["aws_secret_access_key"] = secret_access_key
            if session_token:
                session_kwargs["aws_session_token"] = session_token

    return boto3.Session(**session_kwargs).client("s3")


def build_public_object_url(bucket_name, region, key):
    encoded_key = quote(key, safe="/")
    return f"https://{bucket_name}.s3.{region}.amazonaws.com/{encoded_key}"


def is_http_url(value):
    return isinstance(value, str) and value.startswith(("http://", "https://"))


def get_public_video_url(s3_key, stored_video_url):
    if is_http_url(stored_video_url):
        return stored_video_url

    if S3_PUBLIC_BASE_URL:
        encoded_key = quote(s3_key, safe="/")
        return f"{S3_PUBLIC_BASE_URL.rstrip('/')}/{encoded_key}"

    if AWS_BUCKET_NAME and AWS_REGION:
        return build_public_object_url(AWS_BUCKET_NAME, AWS_REGION, s3_key)

    return stored_video_url


def get_video_delivery_url(payload):
    stored_video_url = payload.get('video_url')
    s3_key = payload.get('s3_key')

    if not s3_key:
        return stored_video_url

    public_video_url = get_public_video_url(s3_key, stored_video_url)
    if is_http_url(public_video_url):
        return public_video_url

    if PRESIGN_S3_PLAYBACK_URLS and s3_client and AWS_BUCKET_NAME:
        try:
            return s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': AWS_BUCKET_NAME, 'Key': s3_key},
                ExpiresIn=S3_PLAYBACK_URL_EXPIRATION_SECONDS
            )
        except Exception as exc:
            logger.warning("Failed to generate presigned playback URL for %s: %s", s3_key, exc)

    return public_video_url or stored_video_url


def get_twelvelabs_version():
    try:
        return metadata.version("twelvelabs")
    except metadata.PackageNotFoundError:
        return "unknown"


def ensure_twelvelabs_sdk_supports_marengo3(client):
    if hasattr(client.embed, "v_2"):
        return

    installed_version = get_twelvelabs_version()
    raise RuntimeError(
        "This backend now uses Twelve Labs Marengo 3.0 through the Embed API v2, "
        f"but your installed twelvelabs SDK is {installed_version}. "
        f"Upgrade to twelvelabs>={MIN_TWELVELABS_VERSION} by running "
        "'pip install -r requirements.txt' in backend-api."
    )


# Initialize clients for TwelveLabs API and Qdrant database
try:
    client = TwelveLabs(api_key=API_KEY)
    ensure_twelvelabs_sdk_supports_marengo3(client)
    qdrant_client = QdrantClient(
        url=build_qdrant_url(QDRANT_HOST),
        api_key=QDRANT_API_KEY,
        timeout=20
    )
    s3_client = build_s3_client()
    logger.info("Successfully initialized API clients")
except Exception as e:
    logger.error(f"Failed to initialize clients: {str(e)}")
    raise


os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


# Server Notification
@app.route('/')
def home():
    return "Server is running! Current time: " + str(datetime.now())


# Initialize Qdrant collection for storing video embeddings
def recreate_qdrant_collection():
    qdrant_client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=VECTOR_SIZE,
            distance=Distance.COSINE  # Distance metric as cosine for similarity search
        )
    )


def get_collection_vector_size(collection_info):
    vectors_config = collection_info.config.params.vectors

    if hasattr(vectors_config, "size"):
        return vectors_config.size

    if isinstance(vectors_config, dict) and vectors_config:
        first_vector = next(iter(vectors_config.values()))
        return getattr(first_vector, "size", None)

    return None


def init_qdrant():
    try:
        collections = qdrant_client.get_collections().collections
        collection_exists = any(col.name == COLLECTION_NAME for col in collections)
        if not collection_exists:
            recreate_qdrant_collection()
            logger.info(f"Created collection: {COLLECTION_NAME}")
            return

        collection_info = qdrant_client.get_collection(COLLECTION_NAME)
        current_vector_size = get_collection_vector_size(collection_info)

        if current_vector_size == VECTOR_SIZE:
            logger.info(
                "Collection '%s' already matches %s embeddings (%s dimensions)",
                COLLECTION_NAME,
                EMBEDDING_MODEL_NAME,
                VECTOR_SIZE
            )
            return

        mismatch_message = (
            f"Collection '{COLLECTION_NAME}' uses vector size {current_vector_size}, "
            f"but {EMBEDDING_MODEL_NAME} returns {VECTOR_SIZE}-dimensional embeddings. "
            "Marengo 2.7 and Marengo 3.0 embeddings are not compatible, so you must "
            "recreate the collection and re-embed your videos."
        )

        if RECREATE_COLLECTION_ON_VECTOR_MISMATCH:
            logger.warning(
                "%s Recreating the collection because RECREATE_COLLECTION_ON_VECTOR_MISMATCH=true.",
                mismatch_message
            )
            recreate_qdrant_collection()
            logger.info(f"Recreated collection: {COLLECTION_NAME}")
            return

        raise RuntimeError(
            f"{mismatch_message} Set RECREATE_COLLECTION_ON_VECTOR_MISMATCH=true "
            "to recreate the collection automatically on startup."
        )
    except Exception as e:
        logger.error(f"Qdrant initialization error: {str(e)}")
        raise


# API health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'api_version': '1.0'
    })


# Endpoint for searching video segments based on pereferenc/mood - text query
@app.route('/search', methods=['POST'])
def search():
    # Ensure the request contains JSON data
    if not request.is_json:
        logger.warning("Request is not JSON format")
        return jsonify({
            'error': 'Request must be JSON format',
            'details': 'Please provide a JSON body with a query parameter'
        }), 400
        
    data = request.get_json()
    query = data.get('query')
    if not query:
        logger.warning("Missing query parameter")
        return jsonify({
            'error': 'Missing query parameter',
            'details': 'Please provide a search query'
        }), 400
        
    # Logging Original query
    logger.info(f"Original search query: {query}")
    
    # Format the query for embedding
    formatted_query = f"Recommend: {query}"
    logger.info(f"Formatted query for embedding: {formatted_query}")
    
    try:
        # Generate embedding for the search query
        logger.info(f"Generating embedding using model: {EMBEDDING_MODEL_NAME}")
        embedding_response = client.embed.v_2.create(
            input_type="text",
            model_name=EMBEDDING_MODEL_NAME,
            text={"input_text": formatted_query}
        )

        if not embedding_response.data:
            raise ValueError("No query embeddings were returned by Twelve Labs")

        # Get the embedding vector
        vector = embedding_response.data[0].embedding
        logger.info(f"Successfully generated embedding with {len(vector)} dimensions")
        
        # Execute vector search
        logger.info(f"Executing search in collection '{COLLECTION_NAME}'")
        query_response = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=vector,
            limit=10,
            with_payload=True
        )
        
        # Extract search results
        if hasattr(query_response, 'points'):
            search_results = query_response.points
            logger.info(f"Found {len(search_results)} matching results")
        else:
            logger.warning("Unexpected response format from Qdrant")
            return jsonify([])
        
        # If no results, return empty list
        if not search_results:
            logger.info("No matching content found")
            return jsonify([])
        
        # Format the results
        formatted_results = []
        
        for i, result in enumerate(search_results):
            # Get basic result data
            point_id = result.id
            score = float(result.score)
            payload = result.payload
            
            logger.debug(f"Result {i+1}: ID={point_id}, Score={score:.4f}")
            
            # Extract result fields
            video_id = payload.get('video_id', f"video_{point_id}")
            filename = payload.get('original_filename', payload.get('filename', 'video.mp4'))
            video_url = get_video_delivery_url(payload)
            start_time = float(payload.get('start_time', 0))
            end_time = float(payload.get('end_time', 30))
            
            # Determine confidence level
            confidence = 'high' if score > 0.7 else 'medium'
            
            # Build result object
            result_item = {
                'video_id': video_id,
                'filename': filename,
                'start_time': start_time,
                'end_time': end_time,
                'score': score,
                'confidence': confidence,
                'url': video_url
            }
            
            formatted_results.append(result_item)
            logger.info(f"Added result {i+1}: {video_id} (score: {score:.4f})")
        
        # Log summary
        logger.info(f"Returning {len(formatted_results)} results")
        return jsonify(formatted_results)
        
    except Exception as e:
        logger.exception(f"Error during search: {str(e)}")
        return jsonify({
            'error': 'Search failed',
            'details': str(e)
        }), 500
    


try:
    init_qdrant()
except Exception as e:
    logger.error(f"Failed to initialize Qdrant: {str(e)}")
    raise



def wake_up_app():
    try:
        app_url = os.getenv('APP_URL')
        if app_url:
            response = requests.get(app_url)
            if response.status_code == 200:
                print(f"Successfully pinged {app_url} at {datetime.now()}")
            else:
                print(f"Failed to ping {app_url} (status code: {response.status_code}) at {datetime.now()}")
        else:
            print("APP_URL environment variable not set.")
    except Exception as e:
        print(f"Error occurred while pinging app: {e}")

scheduler = BackgroundScheduler()
scheduler.add_job(wake_up_app, 'interval', minutes=9)
scheduler.start()

atexit.register(lambda: scheduler.shutdown())


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
