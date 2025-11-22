from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "ai-worker"})

@app.route('/api/ocr', methods=['POST'])
def process_ocr():
    """Extract text from image using OCR"""
    # Implementation coming
    return jsonify({"message": "OCR endpoint"})

@app.route('/api/process', methods=['POST'])
def process_content():
    """
    Full AI pipeline:
    - OCR extraction
    - Summarization
    - Flashcard generation
    - Quiz generation
    """
    # Implementation coming
    return jsonify({"message": "Process endpoint"})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
