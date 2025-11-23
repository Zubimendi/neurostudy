from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add parent directory to path so we can import from app
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load .env from root
root_dir = Path(__file__).parent.parent.parent
env_path = root_dir / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Environment loaded from: {env_path}")
else:
    print("⚠️  No .env file found, using environment variables")

from services.ocr_service import OCRService
from services.ai_service import AIService
from services.content_processor import ContentProcessor

app = Flask(__name__)
CORS(app)

# Get configuration
PORT = int(os.getenv('AI_WORKER_PORT', 5000))
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

if not OPENAI_API_KEY:
    print("⚠️  WARNING: OPENAI_API_KEY not set!")
    print("   Set it in .env file or the AI processing won't work")
else:
    print("✅ OpenAI API key loaded")

# Initialize services
print("🔧 Initializing OCR service (this may take a minute on first run)...")
ocr_service = OCRService()
print("✅ OCR service ready")

print("🔧 Initializing AI service...")
ai_service = AIService(api_key=OPENAI_API_KEY)
print("✅ AI service ready")

content_processor = ContentProcessor(ocr_service, ai_service)
print("✅ Content processor ready")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "ai-worker",
        "version": "1.0.0",
        "openai_configured": bool(OPENAI_API_KEY),
        "ocr_ready": ocr_service is not None
    })

@app.route('/api/ocr', methods=['POST'])
def extract_text():
    """Extract text from image using OCR"""
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({"error": "image_url is required"}), 400
        
        print(f"📸 Processing OCR for: {image_url}")
        extracted_text = ocr_service.extract_from_url(image_url)
        print(f"✅ Extracted {len(extracted_text)} characters")
        
        return jsonify({
            "success": True,
            "extracted_text": extracted_text,
            "word_count": len(extracted_text.split())
        })
    
    except Exception as e:
        print(f"❌ OCR error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/process', methods=['POST'])
def process_content():
    """Full AI pipeline"""
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        session_id = data.get('session_id')
        
        if not image_url or not session_id:
            return jsonify({"error": "image_url and session_id are required"}), 400
        
        print(f"🚀 Starting full AI pipeline for session: {session_id}")
        result = content_processor.process_full_pipeline(image_url, session_id)
        print(f"✅ Processing complete for session: {session_id}")
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "data": result
        })
    
    except Exception as e:
        print(f"❌ Processing error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-flashcards', methods=['POST'])
def generate_flashcards():
    """Generate flashcards from text"""
    try:
        data = request.get_json()
        text = data.get('text')
        count = data.get('count', 10)
        
        print(f"🎴 Generating {count} flashcards...")
        flashcards = ai_service.generate_flashcards(text, count)
        print(f"✅ Generated {len(flashcards)} flashcards")
        
        return jsonify({
            "success": True,
            "flashcards": flashcards
        })
    
    except Exception as e:
        print(f"❌ Flashcard generation error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    """Generate quiz questions from text"""
    try:
        data = request.get_json()
        text = data.get('text')
        count = data.get('count', 5)
        
        print(f"📝 Generating {count} quiz questions...")
        questions = ai_service.generate_quiz(text, count)
        print(f"✅ Generated {len(questions)} questions")
        
        return jsonify({
            "success": True,
            "questions": questions
        })
    
    except Exception as e:
        print(f"❌ Quiz generation error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 AI Worker starting on port", PORT)
    print(f"   OpenAI: {'✅ Configured' if OPENAI_API_KEY else '❌ Not configured'}")
    print("=" * 60)
    app.run(host='0.0.0.0', port=PORT, debug=True)
