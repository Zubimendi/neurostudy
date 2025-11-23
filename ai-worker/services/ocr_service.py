import pytesseract
import requests
from PIL import Image
from io import BytesIO

class OCRService:
    def __init__(self):
        # Test if Tesseract is installed
        try:
            version = pytesseract.get_tesseract_version()
            print(f"   ✅ Tesseract OCR v{version} ready (no download needed)")
        except Exception as e:
            print(f"   ⚠️  Tesseract not found: {e}")
            print("   Install with: sudo apt-get install tesseract-ocr")
    
    def extract_from_url(self, image_url):
        """Download image from URL and extract text"""
        try:
            # Download image
            print(f"   📥 Downloading image...")
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            
            # Open image
            image = Image.open(BytesIO(response.content))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            print(f"   🔍 Performing OCR on image ({image.width}x{image.height})...")
            
            # Extract text using Tesseract
            # Use config for better accuracy with textbooks
            custom_config = r'--oem 3 --psm 6'
            extracted_text = pytesseract.image_to_string(image, config=custom_config)
            
            # Clean up the text
            extracted_text = extracted_text.strip()
            
            print(f"   ✅ Extracted {len(extracted_text)} characters")
            return extracted_text
        
        except Exception as e:
            raise Exception(f"OCR extraction failed: {str(e)}")
    
    def extract_from_file(self, file_path):
        """Extract text from local image file"""
        try:
            custom_config = r'--oem 3 --psm 6'
            extracted_text = pytesseract.image_to_string(file_path, config=custom_config)
            return extracted_text.strip()
        
        except Exception as e:
            raise Exception(f"OCR extraction failed: {str(e)}")
