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
        
        print(f"\n{'='*60}")
        print(f"🚀 Processing Session: {session_id}")
        print(f"{'='*60}\n")
        
        # Step 1: Extract text using OCR
        print("Step 1: OCR Text Extraction")
        extracted_text = self.ocr_service.extract_from_url(image_url)
        
        if not extracted_text or len(extracted_text) < 50:
            raise Exception("Insufficient text extracted from image (less than 50 characters)")
        
        print(f"✅ Extracted {len(extracted_text)} characters, {len(extracted_text.split())} words\n")
        
        # Step 2: Detect topic
        print("Step 2: Topic Detection")
        topic = self.ai_service.detect_topic(extracted_text)
        print()
        
        # Step 3: Generate summaries
        print("Step 3: Summary Generation")
        summaries = self.ai_service.generate_summary(extracted_text)
        print()
        
        # Step 4: Generate simplified explanation
        print("Step 4: Simplified Explanation")
        explanation = self.ai_service.generate_simplified_explanation(extracted_text)
        print()
        
        # Step 5: Extract key concepts
        print("Step 5: Key Concepts Extraction")
        key_concepts = self.ai_service.extract_key_concepts(extracted_text)
        print()
        
        # Step 6: Generate flashcards
        print("Step 6: Flashcard Generation")
        flashcards = self.ai_service.generate_flashcards(extracted_text, count=10)
        print()
        
        # Step 7: Generate quiz
        print("Step 7: Quiz Generation")
        quiz_questions = self.ai_service.generate_quiz(extracted_text, count=5)
        print()
        
        print(f"{'='*60}")
        print(f"✅ Processing Complete!")
        print(f"{'='*60}\n")
        
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
