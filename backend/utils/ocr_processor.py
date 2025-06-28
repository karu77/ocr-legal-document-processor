import io
import os
import pytesseract
from PIL import Image
from pdf2image import convert_from_bytes, convert_from_path
import tempfile

# Set up Google Cloud Vision client
# Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set
# or provide credentials directly.
# For local development, it's common to set GOOGLE_APPLICATION_CREDENTIALS
# to the path of your service account key file.
# vision_client = vision.ImageAnnotatorClient()

def process_ocr(filepath, filename):
    file_extension = os.path.splitext(filename)[1].lower()
    extracted_text = ""

    if file_extension == '.pdf':
        try:
            # Convert PDF pages to images from the file path
            images = convert_from_path(filepath, dpi=300)
            
            extracted_texts = []
            for i, image in enumerate(images):
                text = pytesseract.image_to_string(image)
                extracted_texts.append(f"--- Page {i+1} ---\n{text.strip()}")
            
            extracted_text = "\n\n".join(extracted_texts)

        except Exception as e:
            print(f"Error processing PDF with Tesseract/Poppler: {e}")
            extracted_text = f"Error: Failed to extract text from PDF. Ensure Poppler is installed and in PATH. {e}"

    elif file_extension in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']:
        try:
            image = Image.open(filepath)
            extracted_text = pytesseract.image_to_string(image)

        except Exception as e:
            print(f"Error processing image with Tesseract: {e}")
            extracted_text = f"Error: Failed to extract text from image using Tesseract. {e}"
    else:
        extracted_text = "Error: Unsupported file type. Please upload a PDF or an image."
    
    return extracted_text 