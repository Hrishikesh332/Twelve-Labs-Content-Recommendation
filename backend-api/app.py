from flask import Flask, request, jsonify, send_file
from twelvelabs import TwelveLabs
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
import os
from dotenv import load_dotenv
import uuid
import logging
from werkzeug.utils import secure_filename
import json
from flask_cors import CORS


from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import atexit

app = Flask(__name__)
CORS(app)

load_dotenv()

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

API_KEY = os.getenv('API_KEY')
QDRANT_HOST = os.getenv('QDRANT_HOST')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')

if not API_KEY:
    raise ValueError("API_KEY environment variable is not set")
if not QDRANT_HOST or not QDRANT_API_KEY:
    raise ValueError("Qdrant credentials are not set")

app.config.update(
    UPLOAD_FOLDER=os.path.join(os.getcwd(), 'uploads'),
    MAX_CONTENT_LENGTH=16 * 1024 * 1024, 
    ALLOWED_EXTENSIONS={'mp4', 'avi', 'mov', 'wmv'}
)

# Qdrant Configuration
COLLECTION_NAME = "content_collection"
VECTOR_SIZE = 1024

# Initialize clients
try:
    client = TwelveLabs(api_key=API_KEY)
    qdrant_client = QdrantClient(
        url=f"https://{QDRANT_HOST}",
        api_key=QDRANT_API_KEY,
        timeout=20
    )
    logger.info("Successfully initialized API clients")
except Exception as e:
    logger.error(f"Failed to initialize clients: {str(e)}")
    raise


os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


# Initialize Qdrant collection for video embeddings
def init_qdrant():
    try:
        collections = qdrant_client.get_collections().collections
        collection_exists = any(col.name == COLLECTION_NAME for col in collections)
        if not collection_exists:
            qdrant_client.recreate_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=VECTOR_SIZE,
                    distance=Distance.COSINE
                )
            )
            logger.info(f"Created collection: {COLLECTION_NAME}")
    except Exception as e:
        logger.error(f"Qdrant initialization error: {str(e)}")
        raise

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


# Stream video file to client
@app.route('/video/<video_id>')
def serve_video(video_id):

    try:
        logger.info(f"Request to serve video: {video_id}")

        search_result = qdrant_client.search(
            collection_name=COLLECTION_NAME,
            query_vector=[0] * VECTOR_SIZE, 
            limit=1,
            filter={
                "must": [
                    {"key": "video_id", "match": {"value": video_id}}
                ]
            }
        )
        if not search_result:
            logger.error(f"Video not found: {video_id}")
            return jsonify({'error': 'Video not found'}), 404
            
        file_path = search_result[0].payload.get('file_path')
        if not file_path or not os.path.exists(file_path):
            logger.error(f"Video file not found at path: {file_path}")
            return jsonify({'error': 'Video file not found'}), 404
            
        return send_file(
            file_path,
            mimetype='video/mp4',
            as_attachment=False,
            conditional=True
        )
    except Exception as e:
        logger.exception(f"Error serving video {video_id}:")
        return jsonify({
            'error': 'Failed to serve video',
            'details': str(e)
        }), 500


# API health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'api_version': '1.0'
    })


# Handle video upload and embedding generation
#------------------Not Using-----------------
# @app.route('/upload_video', methods=['POST'])
# def upload_video():
#     if 'video' not in request.files:
#         return jsonify({'error': 'No video file provided'}), 400
    
#     video_file = request.files['video']
#     if not video_file or not allowed_file(video_file.filename):
#         return jsonify({'error': 'Invalid video file'}), 400
#     try:
#         filename = secure_filename(video_file.filename)
#         temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#         video_file.save(temp_path)
        
#         # Generate embeddings using TwelveLabs
#         logger.info("Generating video embeddings...")
#         task = client.embed.task.create(
#             model_name="Marengo-retrieval-2.7",
#             video_file=temp_path
#         )
        
#         task.wait_for_done(sleep_interval=3)
#         task_result = client.embed.task.retrieve(task.id)

#         video_id = str(uuid.uuid4())
#         permanent_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{video_id}.mp4")
#         os.rename(temp_path, permanent_path)
        
#         # Store embeddings in Qdrant
#         points = [
#             PointStruct(
#                 id=f"{video_id}_{idx}",
#                 vector=segment.embeddings_float,
#                 payload={
#                     'video_id': video_id,
#                     'filename': filename,
#                     'start_time': segment.start_offset_sec,
#                     'end_time': segment.end_offset_sec,
#                     'file_path': permanent_path
#                 }
#             )
#             for idx, segment in enumerate(task_result.video_embedding.segments)
#         ]
#         qdrant_client.upsert(
#             collection_name=COLLECTION_NAME,
#             points=points
#         )
#         return jsonify({
#             'message': 'Video processed successfully',
#             'video_id': video_id,
#             'segments': len(points)
#         })
#     except Exception as e:
#         logger.error(f"Upload error: {str(e)}")
#         if 'temp_path' in locals() and os.path.exists(temp_path):
#             os.remove(temp_path)
#         return jsonify({'error': str(e)}), 500


# Handle text based search for video segments
@app.route('/search', methods=['POST'])
def search():

    try:
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
            
        logger.info(f"Processing search query: {query}")
        
        # Generate embedding for the search query
        embedding_response = None
        logger.info(f"Processing search query: {query}")
        try:
            logger.debug(f"Generating embedding for query: {query}")
            embedding_response = client.embed.create(
                model_name="Marengo-retrieval-2.7",
                text=query
            )
            logger.info("Successfully generated query embedding")
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            return jsonify({
                'error': 'Failed to process search query',
                'details': str(e)
            }), 500
            
        if not embedding_response or not hasattr(embedding_response, 'text_embedding'):
            logger.error("No embedding was generated for the query")
            return jsonify({
                'error': 'Failed to generate embedding',
                'details': 'No embedding was generated for the query'
            }), 500
            
        # Get the embedding vector
        vector = embedding_response.text_embedding.segments[0].embeddings_float
        logger.debug(f"Generated vector with {len(vector)} dimensions")
        
        # Search in Qdrant
        logger.info("Searching Qdrant for similar vectors")
        try:
            search_results = qdrant_client.search(
                collection_name=COLLECTION_NAME,
                query_vector=vector,
                limit=10
            )
            logger.debug(f"Qdrant search returned {len(search_results)} results")
            
            for i, result in enumerate(search_results):
                logger.debug(f"Result {i+1}: ID={result.id}, Score={result.score}")
                logger.debug(f"Payload: {json.dumps(result.payload, default=str)}")
                
        except Exception as e:
            logger.error(f"Qdrant search error: {str(e)}")
            # Fall back to mock data if search fails
            logger.info("Using mock data due to search error")
            mock_results = [
                {
                    'video_id': 'ratatouille',
                    'filename': 'ratatouille.mp4',
                    'start_time': 0,
                    'end_time': 30,
                    'score': 0.95,
                    'confidence': 'high',
                    'url': 'https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/08ff403a-63e7-4188-9eed-3858f4457173_078_🧑‍🍳 Experimenting With Flavors! ｜ Ratatouille ｜ Disney Kids_pwpRSNCdr6w.mp4'
                },
                {
                    'video_id': 'dory',
                    'filename': 'dory.mp4',
                    'start_time': 0,
                    'end_time': 30,
                    'score': 0.92,
                    'confidence': 'high',
                    'url': 'https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/06c17740-1b34-4af3-b1fc-c8ab586915f7_054_🚤 Dory\'s Next Stop! ｜ Finding Dory ｜ Disney Kids_HaL1PU3hpvY.mp4'
                },
                {
                    'video_id': 'buzz',
                    'filename': 'buzz.mp4',
                    'start_time': 0,
                    'end_time': 30,
                    'score': 0.9,
                    'confidence': 'high',
                    'url': 'https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1ba5cedc-9abe-4b2d-b4be-1a9e65bfcd17_001_👨‍🚀 Just Buzz being Buzz_xuWRqYuK5k0.mp4'
                },
                {
                    'video_id': 'bugs-life',
                    'filename': 'bugs-life.mp4',
                    'start_time': 0,
                    'end_time': 30,
                    'score': 0.88,
                    'confidence': 'high',
                    'url': 'https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/761322bf-fcd4-4041-bce0-aa42319ce0f9_062_🔥 The Show Everyone\'s Excited About! ｜ A Bug\'s Life ｜ Disney Kids_ok3z52oMv8A.mp4'
                },
                {
                    'video_id': 'frozen',
                    'filename': 'frozen.mp4',
                    'start_time': 0,
                    'end_time': 30,
                    'score': 0.86,
                    'confidence': 'high',
                    'url': 'https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1203fb1a-ef99-4cc0-a212-8bf1589216ea_044_🗻 Frozen Quest： Can Anna Stop Winter？ ｜ Frozen ｜ Disney Kids_UrrHl9p2XDM.mp4'
                }
            ]
            return jsonify(mock_results)
            
        if not search_results:
            logger.info("No matching results found")
            
            # Try to get any videos from the collection as fallback
            try:
                logger.debug("Attempting to get fallback results using scroll")
                fallback_results = qdrant_client.scroll(
                    collection_name=COLLECTION_NAME,
                    limit=10,
                    with_payload=True,
                    with_vectors=False
                )[0]
                
                logger.debug(f"Scroll returned {len(fallback_results)} fallback results")
            except Exception as e:
                logger.error(f"Error getting fallback results: {str(e)}")
                fallback_results = []
            
            if fallback_results:
                logger.info(f"Using {len(fallback_results)} fallback results")
                formatted_results = []
                for point in fallback_results:
                    try:
                        if not point.payload:
                            logger.warning(f"Skipping result with no payload: {point.id}")
                            continue
                            

                        result = {
                            'video_id': point.payload.get('video_id', f"video_{point.id}"),
                            'filename': point.payload.get('filename', 'unknown.mp4'),
                            'start_time': float(point.payload.get('start_time', 0)),
                            'end_time': float(point.payload.get('end_time', 30)),
                            'score': 0.5, 
                            'confidence': 'medium'
                        }
                        # formatted_results.append(result)
                        # logger.info(f"Added fallback result: {result['video_id']}")
                    except Exception as e:
                        logger.warning(f"Skipping malformed result: {str(e)}")
                        continue
                
                formatted_results.append({
                    'video_id': 'fallback-10',
                    'filename': 'fallback10.mp4',
                    'start_time': 0,
                    'end_time': 30,
                    'score': 0.75,
                    'confidence': 'medium',
                    'url': 'https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/tiny.mp4'
                })
                logger.info("Added special fallback-10 video")
                
                if formatted_results:
                    return jsonify(formatted_results)
            
            logger.info("No valid results found, returning mock data")
            mock_results = [
                {
                    'video_id': 'ratatouille',
                    'filename': 'ratatouille.mp4',
                    'start_time': 0,
                    'end_time': 30,
                    'score': 0.95,
                    'confidence': 'high',
                    'url': 'https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/08ff403a-63e7-4188-9eed-3858f4457173_078_🧑‍🍳 Experimenting With Flavors! ｜ Ratatouille ｜ Disney Kids_pwpRSNCdr6w.mp4'
                }
            ]
            return jsonify(mock_results)
            
        formatted_results = []
        for match in search_results:
            try:
                # Extract video_url from payload if it exists
                video_url = None
                if 'video_url' in match.payload:
                    video_url = match.payload.get('video_url')
                
                filename = 'unknown.mp4'
                if 'original_filename' in match.payload:
                    original_filename = match.payload.get('original_filename')
                    if original_filename:
                        # Extract just the base name without special characters
                        import re
                        clean_name = re.sub(r'[^\w\s.-]', '', original_filename.split('_')[-1])
                        filename = clean_name if clean_name else 'disney-video.mp4'
                
                # Create the result object with the URL
                result = {
                    'video_id': match.payload.get('video_id', f"video_{match.id}"),
                    'filename': filename,
                    'start_time': float(match.payload.get('start_time', 0)),
                    'end_time': float(match.payload.get('end_time', 30)),
                    'score': float(match.score),
                    'confidence': 'high' if float(match.score) > 0.7 else 'medium',
                    'url': video_url 
                }
                formatted_results.append(result)
                logger.debug(f"Added result: {result['filename']} with score {result['score']} and URL: {video_url}")
            except Exception as e:
                logger.warning(f"Skipping malformed result: {str(e)}")
                continue
                
        formatted_results.append({
            'video_id': 'fallback-10',
            'filename': 'fallback10.mp4',
            'start_time': 0,
            'end_time': 30,
            'score': 0.75,
            'confidence': 'medium',
            'url': 'https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/tiny.mp4'
        })
        logger.info("Added special fallback-10 video to results")
        logger.info(f"Returning {len(formatted_results)} results")
        return jsonify(formatted_results)
    except Exception as e:
        logger.exception("Unexpected error during search:")
        mock_results = [
            {
                'video_id': 'ratatouille',
                'filename': 'ratatouille.mp4',
                'start_time': 0,
                'end_time': 30,
                'score': 0.95,
                'confidence': 'high',
                'url': 'https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/08ff403a-63e7-4188-9eed-3858f4457173_078_🧑‍🍳 Experimenting With Flavors! ｜ Ratatouille ｜ Disney Kids_pwpRSNCdr6w.mp4'
            }
        ]
        logger.info("Returning mock data due to error")
        return jsonify(mock_results)

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