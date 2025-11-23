import openai
import json
from typing import List, Dict

class AIService:
    def __init__(self, api_key: str):
        if not api_key:
            print("⚠️  WARNING: No OpenAI API key provided!")
        self.client = openai.OpenAI(api_key=api_key) if api_key else None
    
    def generate_summary(self, text: str) -> Dict:
        """Generate short and detailed summaries"""
        if not self.client:
            raise Exception("OpenAI API key not configured")
        
        try:
            print("   📝 Generating summaries...")
            prompt = f"""
You are an expert educational content summarizer.

Given the following text extracted from a textbook, create:
1. A SHORT SUMMARY (2-3 sentences)
2. A DETAILED SUMMARY (5-7 sentences with more context)

Text:
{text}

Respond ONLY with valid JSON (no markdown, no backticks):
{{
    "short_summary": "...",
    "detailed_summary": "..."
}}
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            # Remove markdown code blocks if present
            content = content.replace('```json', '').replace('```', '').strip()
            result = json.loads(content)
            print("   ✅ Summaries generated")
            return result
        
        except Exception as e:
            raise Exception(f"Summary generation failed: {str(e)}")
    
    def generate_simplified_explanation(self, text: str) -> str:
        """Generate simplified explanation"""
        if not self.client:
            raise Exception("OpenAI API key not configured")
        
        try:
            print("   💡 Generating simplified explanation...")
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
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            print("   ✅ Explanation generated")
            return response.choices[0].message.content
        
        except Exception as e:
            raise Exception(f"Explanation generation failed: {str(e)}")
    
    def extract_key_concepts(self, text: str) -> List[str]:
        """Extract key concepts from text"""
        if not self.client:
            raise Exception("OpenAI API key not configured")
        
        try:
            print("   🔑 Extracting key concepts...")
            prompt = f"""
Extract 5-8 key concepts from this text.
Return ONLY a JSON array of strings (no markdown, no backticks).

Text:
{text}

Format: ["concept1", "concept2", "concept3"]
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5
            )
            
            content = response.choices[0].message.content
            content = content.replace('```json', '').replace('```', '').strip()
            concepts = json.loads(content)
            print(f"   ✅ Extracted {len(concepts)} key concepts")
            return concepts
        
        except Exception as e:
            raise Exception(f"Key concepts extraction failed: {str(e)}")
    
    def generate_flashcards(self, text: str, count: int = 10) -> List[Dict]:
        """Generate flashcards from text"""
        if not self.client:
            raise Exception("OpenAI API key not configured")
        
        try:
            print(f"   🎴 Generating {count} flashcards...")
            prompt = f"""
Create {count} flashcards from this text for effective learning.
Each flashcard should have a clear question (front) and concise answer (back).

Text:
{text}

Respond ONLY with valid JSON (no markdown, no backticks):
[
    {{"front": "Question or term", "back": "Answer or definition"}},
    ...
]
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            content = content.replace('```json', '').replace('```', '').strip()
            flashcards = json.loads(content)
            print(f"   ✅ Generated {len(flashcards)} flashcards")
            return flashcards
        
        except Exception as e:
            raise Exception(f"Flashcard generation failed: {str(e)}")
    
    def generate_quiz(self, text: str, count: int = 5) -> List[Dict]:
        """Generate multiple choice quiz questions"""
        if not self.client:
            raise Exception("OpenAI API key not configured")
        
        try:
            print(f"   📝 Generating {count} quiz questions...")
            prompt = f"""
Create {count} multiple choice questions from this text.
Each question should have 4 options (A, B, C, D) with one correct answer.
Include an explanation for the correct answer.

Text:
{text}

Respond ONLY with valid JSON (no markdown, no backticks):
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
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            content = content.replace('```json', '').replace('```', '').strip()
            questions = json.loads(content)
            print(f"   ✅ Generated {len(questions)} quiz questions")
            return questions
        
        except Exception as e:
            raise Exception(f"Quiz generation failed: {str(e)}")
    
    def detect_topic(self, text: str) -> str:
        """Detect the main topic/subject of the text"""
        if not self.client:
            return "General Topic"
        
        try:
            print("   🎯 Detecting topic...")
            prompt = f"""
Identify the main academic subject or topic of this text in 2-4 words.
Examples: "Biology - Cell Division", "Physics - Newton's Laws", "History - World War II"

Text:
{text[:500]}

Topic:
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=20
            )
            
            topic = response.choices[0].message.content.strip()
            print(f"   ✅ Topic detected: {topic}")
            return topic
        
        except Exception as e:
            return "General Topic"
