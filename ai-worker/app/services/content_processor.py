import requests
from typing import Dict

class ContentProcessor:
    def __init__(self, ocr_service, ai_service):
        self.ocr_service = ocr_service
        self.ai_service = ai_service
    
    def process_full_pipeline(self, image_url: str, session_id: str) -> Dict:
        """
        Complete AI processing pipeline:
        1. OCR text extraction
        2. Topic detection
        3. Summary generation
        4. Simplified explanation
        5. Key concepts extraction
        6. Flashcard generation
        7. Quiz generation
        """
        
        # Step 1: Extract text using OCR
        print(f"[{session_id}] Starting OCR extraction...")
        extracted_text = self.ocr_service.extract_from_url(image_url)
        
        if not extracted_text or len(extracted_text) < 50:
            raise Exception("Insufficient text extracted from image")
        
        print(f"[{session_id}] Extracted {len(extracted_text)} characters")
        
        # Step 2: Detect topic
        print(f"[{session_id}] Detecting topic...")
        topic = self.ai_service.detect_topic(extracted_text)
        
        # Step 3: Generate summaries
        print(f"[{session_id}] Generating summaries...")
        summaries = self.ai_service.generate_summary(extracted_text)
        
        # Step 4: Generate simplified explanation
        print(f"[{session_id}] Generating simplified explanation...")
        explanation = self.ai_service.generate_simplified_explanation(extracted_text)
        
        # Step 5: Extract key concepts
        print(f"[{session_id}] Extracting key concepts...")
        key_concepts = self.ai_service.extract_key_concepts(extracted_text)
        
        # Step 6: Generate flashcards
        print(f"[{session_id}] Generating flashcards...")
        flashcards = self.ai_service.generate_flashcards(extracted_text, count=10)
        
        # Step 7: Generate quiz
        print(f"[{session_id}] Generating quiz questions...")
        quiz_questions = self.ai_service.generate_quiz(extracted_text, count=5)
        
        print(f"[{session_id}] Processing complete!")
        
        # Return complete result
        return {
            "extracted_text": extracted_text,
            "topic": topic,
            "short_summary": summaries["short_summary"],
            "detailed_summary": summaries["detailed_summary"],
            "simplified_explanation": explanation,
            "key_concepts": key_concepts,
            "flashcards": flashcards,
            "quiz_questions": quiz_questions,
            "word_count": len(extracted_text.split())
        }