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
        logger.info(f"Generating embedding using model: Marengo-retrieval-2.7")
        embedding_response = client.embed.create(
            model_name="Marengo-retrieval-2.7",
            text=formatted_query
        )
        
        # Get the embedding vector
        vector = embedding_response.text_embedding.segments[0].embeddings_float
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
            video_url = payload.get('video_url')
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