from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from root
root_dir = Path(__file__).parent.parent.parent
env_path = root_dir / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Environment loaded from: {env_path}")

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv('AI_WORKER_PORT', 5000))

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "ai-worker",
        "version": "1.0.0"
    })

@app.route('/api/process', methods=['POST'])
def process_content():
    return jsonify({
        "success": True,
        "message": "Processing endpoint - implementation coming soon"
    })

if __name__ == '__main__':
    print(f"�� AI Worker starting on port {PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=True)
