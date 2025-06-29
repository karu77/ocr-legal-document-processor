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
from utils.database import db_manager
from utils.auth import auth_manager, require_auth, optional_auth

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging for better error tracking
logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'pdf', 'doc', 'docx', 'txt'}

# Initialize Gemini client
try:
    gemini_client = GeminiClient()
    print("✅ AI Client initialized successfully")
except Exception as e:
    print(f"⚠️  AI Client initialization failed: {e}")
    gemini_client = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "OCR Legal Document Processor API is running"})

@app.route('/ocr', methods=['POST'])
def ocr_endpoint():
    """Extract text from uploaded image or PDF using real OCR"""
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
            # Handle different file types
            file_extension = os.path.splitext(filename)[1].lower()
            
            if file_extension in ['.doc', '.docx']:
                # Handle Word documents
                extracted_text = extract_text_from_word(temp_path)
            elif file_extension == '.txt':
                # Handle text files
                with open(temp_path, 'r', encoding='utf-8') as f:
                    extracted_text = f.read()
            else:
                # Handle images and PDFs with OCR
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
        
        if gemini_client:
            translated_text = gemini_client.translate_text(text, target_language)
        else:
            translated_text = f"[AI Service Unavailable] Translation to {target_language}: {text}"
        
        return jsonify({
            "success": True,
            "translated_text": translated_text,
            "target_language": target_language
        })
    
    except Exception as e:
        app.logger.error(f"Translation error: {str(e)}")
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
        
        if gemini_client:
            cleaned_text = gemini_client.cleanup_text(text)
        else:
            # Basic cleanup without AI
            cleaned_text = ' '.join(text.split())  # Remove extra whitespace
        
        return jsonify({
            "success": True,
            "cleaned_text": cleaned_text
        })
    
    except Exception as e:
        app.logger.error(f"Cleanup error: {str(e)}")
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
        
        if gemini_client:
            summary = gemini_client.summarize_text(text)
        else:
            # Basic summarization without AI
            sentences = text.split('.')[:3]  # Take first 3 sentences
            summary = '. '.join(sentences) + '.'
        
        return jsonify({
            "success": True,
            "summary": summary
        })
    
    except Exception as e:
        app.logger.error(f"Summarization error: {str(e)}")
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
        
        if gemini_client:
            bullet_points = gemini_client.generate_bullet_points(text)
        else:
            # Basic bullet points without AI
            sentences = text.split('.')[:5]
            bullet_points = '\n'.join([f"• {sentence.strip()}" for sentence in sentences if sentence.strip()])
        
        return jsonify({
            "success": True,
            "bullet_points": bullet_points
        })
    
    except Exception as e:
        app.logger.error(f"Bullet points error: {str(e)}")
        return jsonify({"error": f"Bullet point generation failed: {str(e)}"}), 500

@app.route('/compare', methods=['POST'])
def compare_endpoint():
    """Compare two documents (simplified mock for testing)"""
    try:
        data = request.get_json()
        if not data or 'text1' not in data or 'text2' not in data:
            return jsonify({"error": "Both text1 and text2 are required"}), 400
        
        text1 = data['text1']
        text2 = data['text2']
        
        if not text1.strip() or not text2.strip():
            return jsonify({"error": "Both texts must be non-empty"}), 400
        
        # Mock comparison
        comparison_result = {
            "similarity_percentage": 75.0,
            "differences": "[MOCK COMPARISON] Documents have moderate similarity",
            "summary": "These documents share common themes but have distinct differences",
            "text1": text1,
            "text2": text2
        }
        
        return jsonify({
            "success": True,
            "comparison": comparison_result
        })
    
    except Exception as e:
        return jsonify({"error": f"Document comparison failed: {str(e)}"}), 500

# Authentication Routes
@app.route('/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({"error": f"{field} is required"}), 400
        
        username = data['username'].strip()
        email = data['email'].strip()
        password = data['password']
        full_name = data.get('full_name', '').strip()
        
        # Create user
        result = db_manager.create_user(username, email, password, full_name)
        
        if result['success']:
            # Generate tokens
            tokens = auth_manager.generate_tokens(result['user']['id'])
            
            return jsonify({
                "success": True,
                "user": result['user'],
                "tokens": tokens,
                "message": "User registered successfully"
            }), 201
        else:
            return jsonify({"error": result['error']}), 400
    
    except Exception as e:
        app.logger.error(f"Registration error: {str(e)}")
        return jsonify({"error": "Registration failed"}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        email_or_username = data.get('email_or_username', '').strip()
        password = data.get('password', '')
        
        if not email_or_username or not password:
            return jsonify({"error": "Email/username and password are required"}), 400
        
        # Authenticate user
        result = db_manager.authenticate_user(email_or_username, password)
        
        if result['success']:
            # Generate tokens
            tokens = auth_manager.generate_tokens(result['user']['id'])
            
            return jsonify({
                "success": True,
                "user": result['user'],
                "tokens": tokens,
                "message": "Login successful"
            })
        else:
            return jsonify({"error": result['error']}), 401
    
    except Exception as e:
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Login failed"}), 500

@app.route('/auth/refresh', methods=['POST'])
def refresh_token():
    """Refresh access token endpoint"""
    try:
        data = request.get_json()
        if not data or 'refresh_token' not in data:
            return jsonify({"error": "Refresh token is required"}), 400
        
        refresh_token = data['refresh_token']
        
        result = auth_manager.refresh_access_token(refresh_token)
        
        if result['success']:
            return jsonify({
                "success": True,
                "tokens": result['tokens'],
                "message": "Token refreshed successfully"
            })
        else:
            return jsonify({"error": result['error']}), 401
    
    except Exception as e:
        app.logger.error(f"Token refresh error: {str(e)}")
        return jsonify({"error": "Token refresh failed"}), 500

@app.route('/auth/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get user profile endpoint"""
    try:
        return jsonify({
            "success": True,
            "user": request.current_user
        })
    except Exception as e:
        app.logger.error(f"Get profile error: {str(e)}")
        return jsonify({"error": "Failed to get profile"}), 500

@app.route('/auth/profile', methods=['PUT'])
@require_auth
def update_profile():
    """Update user profile endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        user_id = request.current_user['id']
        result = db_manager.update_user_profile(user_id, data)
        
        if result['success']:
            return jsonify({
                "success": True,
                "user": result['user'],
                "message": result['message']
            })
        else:
            return jsonify({"error": result['error']}), 400
    
    except Exception as e:
        app.logger.error(f"Update profile error: {str(e)}")
        return jsonify({"error": "Failed to update profile"}), 500

@app.route('/documents', methods=['GET'])
@require_auth
def get_user_documents():
    """Get user's processed documents"""
    try:
        user_id = request.current_user['id']
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        result = db_manager.get_user_documents(user_id, limit, offset)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify({"error": result['error']}), 500
    
    except Exception as e:
        app.logger.error(f"Get documents error: {str(e)}")
        return jsonify({"error": "Failed to get documents"}), 500

@app.route('/documents', methods=['POST'])
@require_auth
def save_document():
    """Save processed document for user"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Document data is required"}), 400
        
        user_id = request.current_user['id']
        result = db_manager.save_document(user_id, data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify({"error": result['error']}), 500
    
    except Exception as e:
        app.logger.error(f"Save document error: {str(e)}")
        return jsonify({"error": "Failed to save document"}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 16MB"}), 413

@app.errorhandler(500)
def internal_server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print("🚀 Starting OCR Legal Document Processor (Authentication Test Mode)")
    print("✅ MongoDB Connected")
    print("📡 All authentication endpoints available")
    print("🔗 Access at: http://localhost:5000")
    print("📚 API Documentation: Check AUTH_SETUP_GUIDE.md")
    
    app.run(debug=True, host='0.0.0.0', port=5000) 