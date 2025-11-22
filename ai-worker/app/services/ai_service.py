import openai
import json
from typing import List, Dict

class AIService:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
    
    def generate_summary(self, text: str) -> Dict:
        """Generate short and detailed summaries"""
        try:
            prompt = f"""
You are an expert educational content summarizer.

Given the following text extracted from a textbook, create:
1. A SHORT SUMMARY (2-3 sentences)
2. A DETAILED SUMMARY (5-7 sentences with more context)

Text:
{text}

Respond in JSON format:
{{
    "short_summary": "...",
    "detailed_summary": "..."
}}
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
        
        except Exception as e:
            raise Exception(f"Summary generation failed: {str(e)}")
    
    def generate_simplified_explanation(self, text: str) -> str:
        """Generate simplified explanation for better understanding"""
        try:
            prompt = f"""
You are an expert teacher who explains complex topics simply.

Explain the following textbook content in simple, easy-to-understand language.
Use analogies, examples, and break down complex concepts.
Target audience: students who want to understand quickly.

Text:
{text}

Provide a clear, simplified explanation:
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            raise Exception(f"Explanation generation failed: {str(e)}")
    
    def extract_key_concepts(self, text: str) -> List[str]:
        """Extract key concepts from text"""
        try:
            prompt = f"""
Extract 5-8 key concepts from this text.
Return only a JSON array of strings.

Text:
{text}

Example format: ["concept1", "concept2", "concept3"]
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5
            )
            
            concepts = json.loads(response.choices[0].message.content)
            return concepts
        
        except Exception as e:
            raise Exception(f"Key concepts extraction failed: {str(e)}")
    
    def generate_flashcards(self, text: str, count: int = 10) -> List[Dict]:
        """Generate flashcards from text"""
        try:
            prompt = f"""
Create {count} flashcards from this text for effective learning.
Each flashcard should have a clear question (front) and concise answer (back).

Text:
{text}

Respond in JSON format:
[
    {{"front": "Question or term", "back": "Answer or definition"}},
    ...
]
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            flashcards = json.loads(response.choices[0].message.content)
            return flashcards
        
        except Exception as e:
            raise Exception(f"Flashcard generation failed: {str(e)}")
    
    def generate_quiz(self, text: str, count: int = 5) -> List[Dict]:
        """Generate multiple choice quiz questions"""
        try:
            prompt = f"""
Create {count} multiple choice questions from this text.
Each question should have 4 options (A, B, C, D) with one correct answer.
Include an explanation for the correct answer.

Text:
{text}

Respond in JSON format:
[
    {{
        "question": "Question text?",
        "options": {{"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"}},
        "correct_answer": "A",
        "explanation": "Why this is correct..."
    }},
    ...
]
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            questions = json.loads(response.choices[0].message.content)
            return questions
        
        except Exception as e:
            raise Exception(f"Quiz generation failed: {str(e)}")
    
    def detect_topic(self, text: str) -> str:
        """Detect the main topic/subject of the text"""
        try:
            prompt = f"""
Identify the main academic subject or topic of this text in 2-4 words.
Examples: "Biology - Cell Division", "Physics - Newton's Laws", "History - World War II"

Text:
{text}

Topic:
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=20
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            return "General Topic"

