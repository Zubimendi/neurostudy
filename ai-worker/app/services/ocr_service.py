import easyocr
import requests
from PIL import Image
from io import BytesIO
import numpy as np

class OCRService:
    def __init__(self):
        # Initialize EasyOCR with English language
        # For first run, this will download the model
        self.reader = easyocr.Reader(['en'], gpu=False)
    
    def extract_from_url(self, image_url):
        """Download image from URL and extract text"""
        try:
            # Download image
            response = requests.get(image_url)
            image = Image.open(BytesIO(response.content))
            
            # Convert to numpy array
            image_np = np.array(image)
            
            # Extract text
            result = self.reader.readtext(image_np)
            
            # Combine all detected text
            extracted_text = ' '.join([text[1] for text in result])
            
            return extracted_text
        
        except Exception as e:
            raise Exception(f"OCR extraction failed: {str(e)}")
    
    def extract_from_file(self, file_path):
        """Extract text from local image file"""
        try:
            result = self.reader.readtext(file_path)
            extracted_text = ' '.join([text[1] for text in result])
            return extracted_text
        
        except Exception as e:
            raise Exception(f"OCR extraction failed: {str(e)}")

