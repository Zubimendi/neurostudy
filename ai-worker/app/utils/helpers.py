import re
from typing import List

def chunk_text(text: str, max_chunk_size: int = 2000) -> List[str]:
    """Split text into chunks for processing"""
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0
    
    for word in words:
        word_size = len(word) + 1  # +1 for space
        if current_size + word_size > max_chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = [word]
            current_size = word_size
        else:
            current_chunk.append(word)
            current_size += word_size
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

def clean_text(text: str) -> str:
    """Clean extracted text"""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep punctuation
    text = re.sub(r'[^\w\s.,!?;:\-\'\"()]', '', text)
    return text.strip()

def estimate_reading_time(text: str) -> int:
    """Estimate reading time in minutes (avg 200 words/min)"""
    word_count = len(text.split())
    return max(1, word_count // 200)

