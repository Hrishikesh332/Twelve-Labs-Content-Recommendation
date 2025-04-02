from flask import Flask, request, jsonify, send_file
from twelvelabs import TwelveLabs
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
import os

import requests
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
CORS(app, resources={r"/*": {"origins": "*"}})

load_dotenv()

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load API keys from environment variables
API_KEY = os.getenv('API_KEY')
QDRANT_HOST = os.getenv('QDRANT_HOST')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')

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
COLLECTION_NAME = "content_collection"
VECTOR_SIZE = 1024 # Size of vector embeddings

# Initialize clients for TwelveLabs API and Qdrant database
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


# Server Notification
@app.route('/')
def home():
    return "Server is running! Current time: " + str(datetime.now())


# Initialize Qdrant collection for storing video embeddings
def init_qdrant():
    try:
        collections = qdrant_client.get_collections().collections
        collection_exists = any(col.name == COLLECTION_NAME for col in collections)
        if not collection_exists:
            qdrant_client.recreate_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=VECTOR_SIZE,
                    distance=Distance.COSINE # Distance metric as cosine for similarity search
                )
            )
            logger.info(f"Created collection: {COLLECTION_NAME}")
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
    try:
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
            
        # Log the original query
        logger.info(f"Original search query: {query}")
        
        # Format the query for embedding
        formatted_query = f"Provide the relevant content of the genre and the mood of - {query}"
        logger.info(f"Formatted query for embedding: {formatted_query}")
        
        # Generate embedding for the search query
        try:
            logger.info(f"Generating embedding using model: Marengo-retrieval-2.7")
            embedding_response = client.embed.create(
                model_name="Marengo-retrieval-2.7",
                text=formatted_query
            )
            logger.info("Successfully generated query embedding")
            
            # Log embedding details if available
            if hasattr(embedding_response, 'text_embedding'):
                vector = embedding_response.text_embedding.segments[0].embeddings_float
                logger.info(f"Embedding generated with {len(vector)} dimensions")
            else:
                logger.warning("Embedding response doesn't have expected structure")
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            return jsonify({
                'error': 'Failed to process search query',
                'details': str(e)
            }), 500
            
        # Validate embedding response
        if not embedding_response or not hasattr(embedding_response, 'text_embedding'):
            logger.error("No embedding was generated for the query")
            return jsonify({
                'error': 'Failed to generate embedding',
                'details': 'No embedding was generated for the query'
            }), 500
            
        # Get the embedding vector
        vector = embedding_response.text_embedding.segments[0].embeddings_float
        
        # Primary search strategy: vector search in Qdrant
        logger.info(f"Searching Qdrant collection '{COLLECTION_NAME}' for similar vectors (limit: 10)")
        try:
            search_results = qdrant_client.search(
                collection_name=COLLECTION_NAME,
                query_vector=vector,
                limit=10
            )
            logger.info(f"Qdrant search returned {len(search_results)} results")
            
            # Log detailed information about each result
            for i, result in enumerate(search_results):
                logger.debug(f"Result {i+1}: ID={result.id}, Score={result.score}")
                logger.debug(f"Payload: {json.dumps(result.payload, default=str)}")
            
        except Exception as e:
            logger.error(f"Qdrant search error: {str(e)}")
            return jsonify({
                'error': 'Search engine error',
                'details': str(e)
            }), 500
            
        # If no results found, use scroll as fallback strategy
        if not search_results:
            logger.info("No matching results found, using scroll fallback strategy")
            try:
                logger.info(f"Executing scroll on collection '{COLLECTION_NAME}' (limit: 10)")
                fallback_results = qdrant_client.scroll(
                    collection_name=COLLECTION_NAME,
                    limit=10,
                    with_payload=True,
                    with_vectors=False
                )[0]
                search_results = fallback_results
                logger.info(f"Scroll returned {len(fallback_results)} fallback results")
                
                # Log fallback results
                for i, result in enumerate(fallback_results):
                    logger.debug(f"Fallback result {i+1}: ID={result.id}")
                    logger.debug(f"Fallback payload: {json.dumps(result.payload, default=str)}")
                
            except Exception as e:
                logger.error(f"Error getting fallback results: {str(e)}")
                return jsonify({
                    'error': 'Failed to retrieve fallback results',
                    'details': str(e)
                }), 500
        
        # If still no results, return empty list
        if not search_results:
            logger.info("No results found after fallback strategy, returning empty list")
            return jsonify([])
            
        # Format and return the results
        formatted_results = []
        for match in search_results:
            try:
                # Get filename directly from payload
                filename = match.payload.get('filename', 'video.mp4')
                
                # Extract video_url from payload
                video_url = match.payload.get('video_url')
                
                # Get match score (if from search) or default to 0.5 (if from scroll)
                score = float(getattr(match, 'score', 0.5))
                confidence = 'high' if score > 0.7 else 'medium'
                
                # Create the result object
                result = {
                    'video_id': match.payload.get('video_id', f"video_{match.id}"),
                    'filename': filename,
                    'start_time': float(match.payload.get('start_time', 0)),
                    'end_time': float(match.payload.get('end_time', 30)),
                    'score': score,
                    'confidence': confidence,
                    'url': video_url
                }
                formatted_results.append(result)
                
                # Log each formatted result
                logger.info(f"Formatted result: video_id={result['video_id']}, "
                           f"filename={result['filename']}, score={result['score']}, "
                           f"confidence={result['confidence']}")
                
            except Exception as e:
                logger.warning(f"Skipping malformed result: {str(e)}")
                continue

        # Log the final list of results
        logger.info(f"Returning {len(formatted_results)} results to client")
        logger.debug(f"Complete result set: {json.dumps(formatted_results, default=str)}")
        
        return jsonify(formatted_results)
        
    except Exception as e:
        logger.exception("Unexpected error during search:")
        return jsonify({
            'error': 'Internal server error',
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