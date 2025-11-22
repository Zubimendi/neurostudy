from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from app.services.ocr_service import OCRService
from app.services.ai_service import AIService
from app.services.content_processor import ContentProcessor

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize services
ocr_service = OCRService()
ai_service = AIService(api_key=os.getenv('OPENAI_API_KEY'))
content_processor = ContentProcessor(ocr_service, ai_service)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "ai-worker",
        "version": "1.0.0"
    })

@app.route('/api/ocr', methods=['POST'])
def extract_text():
    """Extract text from image using OCR"""
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({"error": "image_url is required"}), 400
        
        extracted_text = ocr_service.extract_from_url(image_url)
        
        return jsonify({
            "success": True,
            "extracted_text": extracted_text,
            "word_count": len(extracted_text.split())
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/process', methods=['POST'])
def process_content():
    """
    Full AI pipeline:
    - OCR extraction
    - Summarization (short + detailed)
    - Simplified explanation
    - Flashcard generation
    - Quiz generation
    - Key concepts extraction
    """
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        session_id = data.get('session_id')
        
        if not image_url or not session_id:
            return jsonify({"error": "image_url and session_id are required"}), 400
        
        # Process content through pipeline
        result = content_processor.process_full_pipeline(image_url, session_id)
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "data": result
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-flashcards', methods=['POST'])
def generate_flashcards():
    """Generate flashcards from text"""
    try:
        data = request.get_json()
        text = data.get('text')
        count = data.get('count', 10)
        
        flashcards = ai_service.generate_flashcards(text, count)
        
        return jsonify({
            "success": True,
            "flashcards": flashcards
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    """Generate quiz questions from text"""
    try:
        data = request.get_json()
        text = data.get('text')
        count = data.get('count', 5)
        
        questions = ai_service.generate_quiz(text, count)
        
        return jsonify({
            "success": True,
            "questions": questions
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)