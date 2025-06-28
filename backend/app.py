from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import tempfile
import uuid
import traceback
import logging
from werkzeug.utils import secure_filename

from utils.ocr_processor import process_ocr
from utils.gemini_client import GeminiClient

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging for better error tracking
logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'pdf'}

# Initialize Gemini client
gemini_client = GeminiClient()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "OCR Legal Document Processor API is running"})

@app.route('/ocr', methods=['POST'])
def ocr_endpoint():
    """Extract text from uploaded image or PDF using OCR"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not supported"}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{filename}")
        file.save(temp_path)
        
        try:
            # Extract text using OCR
            extracted_text = process_ocr(temp_path, filename)
            
            if extracted_text.startswith("Error:"):
                return jsonify({"success": False, "error": extracted_text}), 500
            
            return jsonify({
                "success": True,
                "extracted_text": extracted_text,
                "filename": filename
            })
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        app.logger.error(f"Error during OCR processing: {e}")
        return jsonify({"success": False, "error": f"OCR processing failed: {str(e)}"}), 500

@app.route('/translate', methods=['POST'])
def translate_endpoint():
    """Translate text using Gemini API"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Text is required"}), 400
        
        text = data['text']
        target_language = data.get('target_language', 'English')
        
        if not text.strip():
            return jsonify({"error": "Text cannot be empty"}), 400
        
        translated_text = gemini_client.translate_text(text, target_language)
        
        return jsonify({
            "success": True,
            "translated_text": translated_text,
            "target_language": target_language
        })
    
    except Exception as e:
        app.logger.error(f"Translation error: {str(e)}")
        app.logger.error(f"Full traceback: {traceback.format_exc()}")
        print(f"TRANSLATION ERROR: {str(e)}")
        print(f"FULL TRACEBACK: {traceback.format_exc()}")
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500

@app.route('/cleanup', methods=['POST'])
def cleanup_endpoint():
    """Clean up OCR text using Gemini API"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Text is required"}), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({"error": "Text cannot be empty"}), 400
        
        cleaned_text = gemini_client.cleanup_text(text)
        
        return jsonify({
            "success": True,
            "cleaned_text": cleaned_text
        })
    
    except Exception as e:
        app.logger.error(f"Cleanup error: {str(e)}")
        app.logger.error(f"Full traceback: {traceback.format_exc()}")
        print(f"CLEANUP ERROR: {str(e)}")
        print(f"FULL TRACEBACK: {traceback.format_exc()}")
        return jsonify({"error": f"Text cleanup failed: {str(e)}"}), 500

@app.route('/summarize', methods=['POST'])
def summarize_endpoint():
    """Summarize text using Gemini API"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Text is required"}), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({"error": "Text cannot be empty"}), 400
        
        summary = gemini_client.summarize_text(text)
        
        return jsonify({
            "success": True,
            "summary": summary
        })
    
    except Exception as e:
        app.logger.error(f"Summarization error: {str(e)}")
        app.logger.error(f"Full traceback: {traceback.format_exc()}")
        print(f"SUMMARIZATION ERROR: {str(e)}")
        print(f"FULL TRACEBACK: {traceback.format_exc()}")
        return jsonify({"error": f"Summarization failed: {str(e)}"}), 500

@app.route('/bullet_points', methods=['POST'])
def bullet_endpoint():
    """Generate bullet points from text using Gemini API"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Text is required"}), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({"error": "Text cannot be empty"}), 400
        
        bullet_points = gemini_client.generate_bullet_points(text)
        
        return jsonify({
            "success": True,
            "bullet_points": bullet_points
        })
    
    except Exception as e:
        app.logger.error(f"Bullet points error: {str(e)}")
        app.logger.error(f"Full traceback: {traceback.format_exc()}")
        print(f"BULLET POINTS ERROR: {str(e)}")
        print(f"FULL TRACEBACK: {traceback.format_exc()}")
        return jsonify({"error": f"Bullet point generation failed: {str(e)}"}), 500

@app.route('/compare', methods=['POST'])
def compare_endpoint():
    """Compare two documents using Gemini API"""
    try:
        data = request.get_json()
        if not data or 'text1' not in data or 'text2' not in data:
            return jsonify({"error": "Both text1 and text2 are required"}), 400
        
        text1 = data['text1']
        text2 = data['text2']
        
        if not text1.strip() or not text2.strip():
            return jsonify({"error": "Both texts must be non-empty"}), 400
        
        comparison_result = gemini_client.compare_documents(text1, text2)
        
        return jsonify({
            "success": True,
            "comparison": comparison_result
        })
    
    except Exception as e:
        return jsonify({"error": f"Document comparison failed: {str(e)}"}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 16MB"}), 413

@app.errorhandler(500)
def internal_server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Check if Gemini API key is set
    if not os.getenv('GEMINI_API_KEY'):
        print("Warning: GEMINI_API_KEY not found in environment variables")
        print("Please set your Gemini API key in the .env file")
    
    app.run(debug=True, host='0.0.0.0', port=5000) 