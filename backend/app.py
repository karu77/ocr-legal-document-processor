from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import tempfile
import uuid
import traceback
import logging
import time

from utils.ocr_processor import (
    process_ocr, clean_text, summarize_text, 
    extract_key_points, translate_text, compare_documents
)
from utils.database import db_manager
from utils.auth import auth_manager, require_auth, optional_auth
from bson import ObjectId
import json

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app)

# Configure logging for better error tracking
logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {
    # Image formats
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'tif', 'webp',
    # Document formats
    'pdf', 'doc', 'docx', 'txt', 'rtf',
    # Spreadsheet formats
    'xls', 'xlsx', 'csv',
    # Presentation formats
    'ppt', 'pptx',
    # OpenDocument formats
    'odt', 'ods', 'odp',
    # Web formats
    'html', 'htm', 'xml'
}

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize database
try:
    db = db_manager.get_db()
except:
    print("⚠️  Database connection failed")
    db = None

# Initialize NLP libraries
print("✅ Using library-based processing (no AI API required)")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_word(filepath):
    """Extract text from Word documents"""
    try:
        import docx2txt
        text = docx2txt.process(filepath)
        if text and text.strip():
            return text.strip()
        
        from docx import Document
        doc = Document(filepath)
        text_parts = []
        for paragraph in doc.paragraphs:
            text_parts.append(paragraph.text)
        return '\n'.join(text_parts)
    except Exception as e:
        return f"Error extracting text from Word document: {e}"

def translate_with_libraries(text, target_language):
    """Translate text using a simple translation API"""
    try:
        import requests
        import urllib.parse
        from time import sleep
        
        # Map common language names to codes
        language_codes = {
            'Spanish': 'es', 'French': 'fr', 'German': 'de', 'Italian': 'it',
            'Portuguese': 'pt', 'Russian': 'ru', 'Chinese': 'zh', 'Japanese': 'ja',
            'Korean': 'ko', 'Arabic': 'ar', 'Hindi': 'hi'
        }
        
        target_code = language_codes.get(target_language, target_language.lower()[:2])
        app.logger.info(f"Using language code: {target_code}")
        
        # Split text into smaller chunks (max 500 chars)
        chunks = [text[i:i+500] for i in range(0, len(text), 500)]
        translated_chunks = []
        
        # Translate each chunk
        for chunk in chunks:
            if not chunk.strip():
                continue
                
            try:
                # URL encode the text
                encoded_text = urllib.parse.quote(chunk)
                
                # Make the request to the translation API
                url = f"https://api.mymemory.translated.net/get?q={encoded_text}&langpair=en|{target_code}"
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
                
                response = requests.get(url, headers=headers)
                data = response.json()
                
                if response.status_code == 200 and data['responseStatus'] == 200:
                    translated_text = data['responseData']['translatedText']
                    translated_chunks.append(translated_text)
                else:
                    # If translation fails, try an alternative API
                    alt_url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_code}&dt=t&q={encoded_text}"
                    alt_response = requests.get(alt_url, headers=headers)
                    
                    if alt_response.status_code == 200:
                        alt_data = alt_response.json()
                        translated_text = ''.join([item[0] for item in alt_data[0] if item[0]])
                        translated_chunks.append(translated_text)
                    else:
                        translated_chunks.append(chunk)
                
                # Add delay between requests
                sleep(1)
                
            except Exception as e:
                app.logger.error(f"Chunk translation failed: {str(e)}")
                translated_chunks.append(chunk)
        
        # Join all translated chunks
        final_translation = ' '.join(translated_chunks)
        
        if final_translation and len(final_translation.strip()) > 0:
            return f"[Translated to {target_language}]\n\n{final_translation}"
        else:
            raise Exception("Translation produced empty result")
            
    except Exception as e:
        app.logger.error(f"Translation failed: {str(e)}")
        return f"[Translation failed - {str(e)}]\n\n{text}"

def create_basic_translation_notice(text, target_language):
    """Create a notice when translation services are not available"""
    word_count = len(text.split())
    char_count = len(text)
    
    notice = f"""[Translation Service Limited]

Target Language: {target_language}
Document Stats: {word_count} words, {char_count} characters

Note: Advanced translation services are not available. To get a proper translation:
1. Install Google Translate API: pip install googletrans==4.0.0-rc1
2. Configure Gemini API key for AI translation
3. Use online translation services for this document

Original text follows below:

---

{text}"""
    
    return notice

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "OCR Legal Document Processor API is running"})

@app.route('/ocr', methods=['POST'])
@app.route('/api/process', methods=['POST'])
@optional_auth
def process_document():
    """Extract text from uploaded image or PDF using OCR"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided', 'success': False}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected', 'success': False}), 400
            
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported', 'success': False}), 400
        
        # Save file temporarily  
        filename = secure_filename(file.filename)
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{filename}")
        file.save(temp_path)
        
        try:
            # Handle different file types
            file_extension = os.path.splitext(filename)[1].lower()
            
            ocr_result = process_ocr(temp_path, filename)

            if ocr_result['text'].startswith("Error:"):
                return jsonify({"success": False, "error": ocr_result['text']}), 500
            
            return jsonify({
                'success': True,
                'extracted_text': ocr_result['text'],
                'raw_text': ocr_result['text'],
                'filename': filename,
                'detected_lang_name': ocr_result.get('detected_lang_name'),
                'detected_lang_code': ocr_result.get('detected_lang_code'),
                'warning': ocr_result.get('warning')
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
    except Exception as e:
        app.logger.error(f"Error processing document: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f"Failed to process document: {str(e)}"
        }), 500

@app.route('/translate', methods=['POST'])
@app.route('/api/translate', methods=['POST'])
@optional_auth
def translate_document():
    """Translate text using library-based translation"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required', 'success': False}), 400
        
        text = data['text']
        target_language = data.get('target_language', 'English')
        
        # Debug logging
        app.logger.info(f"Translation request: target_language = '{target_language}', text length = {len(text)}")
        
        if not text.strip():
            return jsonify({'error': 'Text cannot be empty', 'success': False}), 400
            
        # Check if user is trying to translate to the same language (likely English to English)
        if target_language.lower() == 'english':
            return jsonify({
                'success': True,
                'translated_text': f"[Already in {target_language}]\n\n{text}",
                'target_language': target_language,
                'message': f'Text is already in {target_language}'
            })
        
        # Use library-based translation directly
        translated_text = translate_with_libraries(text, target_language)
        
        return jsonify({
            'success': True,
            'translated_text': translated_text,
            'target_language': target_language
        })
        
    except Exception as e:
        app.logger.error(f"Translation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Translation failed: {str(e)}"
        }), 500

@app.route('/cleanup', methods=['POST'])
@optional_auth
def cleanup_text_endpoint():
    """Clean up OCR text using library-based cleaning"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required', 'success': False}), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({'error': 'Text cannot be empty', 'success': False}), 400
        
        # Use enhanced library-based text cleanup
        cleaned_text = clean_text_with_libraries(text)
        
        return jsonify({
            'success': True,
            'cleaned_text': cleaned_text
        })
        
    except Exception as e:
        app.logger.error(f"Cleanup error: {str(e)}")
        return jsonify({'success': False, 'error': f'Text cleanup failed: {str(e)}'}), 500

@app.route('/summarize', methods=['POST'])
@optional_auth
def summarize_text_endpoint():
    """Summarize text using library-based summarization"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required', 'success': False}), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({'error': 'Text cannot be empty', 'success': False}), 400
        
        # Use library-based summarization
        summary = summarize_with_libraries(text)
        
        return jsonify({
            'success': True,
            'summary': summary
        })
        
    except Exception as e:
        app.logger.error(f"Summarization error: {str(e)}")
        return jsonify({'success': False, 'error': f'Summarization failed: {str(e)}'}), 500

@app.route('/bullet_points', methods=['POST'])
@optional_auth
def bullet_points_endpoint():
    """Generate bullet points from text using library-based extraction"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required', 'success': False}), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({'error': 'Text cannot be empty', 'success': False}), 400
        
        # Use library-based key points extraction
        bullet_points = extract_key_points_with_libraries(text)
        
        return jsonify({
            'success': True,
            'bullet_points': bullet_points
        })
        
    except Exception as e:
        app.logger.error(f"Bullet points error: {str(e)}")
        return jsonify({'success': False, 'error': f'Bullet points generation failed: {str(e)}'}), 500

@app.route('/compare', methods=['POST'])
@app.route('/api/compare', methods=['POST'])
@optional_auth
def compare_documents_endpoint():
    """Compare two documents using library-based comparison"""
    try:
        data = request.get_json()
        if not data or 'text1' not in data or 'text2' not in data:
            return jsonify({'error': 'Both texts are required for comparison', 'success': False}), 400
        
        text1 = data['text1']
        text2 = data['text2']
        file1_name = data.get('file1Name', 'Document 1')
        file2_name = data.get('file2Name', 'Document 2')
        
        # Use library-based document comparison
        comparison = compare_documents_with_libraries(text1, text2)
        comparison['file1Name'] = file1_name
        comparison['file2Name'] = file2_name
        
        return jsonify({
            'success': True,
            'similarity_percentage': comparison.get('similarity_percentage', 0),
            'differences': comparison.get('differences', []),
            'file1Name': file1_name,
            'file2Name': file2_name,
            'text1': text1,
            'text2': text2
        })
        
    except Exception as e:
        app.logger.error(f"Comparison error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Comparison failed: {str(e)}"
        }), 500

def compare_documents_with_libraries(text1, text2):
    """Compare two texts and return their differences"""
    try:
        from difflib import SequenceMatcher
        
        # Calculate similarity ratio
        similarity = SequenceMatcher(None, text1, text2).ratio()
        similarity_percentage = round(similarity * 100, 2)
        
        # Split texts into lines for comparison
        lines1 = text1.splitlines()
        lines2 = text2.splitlines()
        
        # Compare line by line
        differences = []
        max_lines = max(len(lines1), len(lines2))
        
        for i in range(max_lines):
            line1 = lines1[i] if i < len(lines1) else ''
            line2 = lines2[i] if i < len(lines2) else ''
            
            if line1 != line2:
                differences.append({
                    'line_number': i + 1,
                    'text1': line1,
                    'text2': line2
                })
        
        return {
            'similarity_percentage': similarity_percentage,
            'differences': differences
        }
        
    except Exception as e:
        app.logger.error(f"Error in document comparison: {str(e)}")
        return {
            'similarity_percentage': 0,
            'differences': [],
            'error': str(e)
        }

@app.route('/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    if not db:
        return jsonify({'success': False, 'error': 'Database not connected'}), 500
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided', 'success': False}), 400
            
        result = db_manager.create_user(
            username=data.get('username'),
            email=data.get('email'),
            password=data.get('password'),
            full_name=data.get('full_name', '')
        )

        if result['success']:
            # Generate tokens for the new user
            user_id = str(result['user']['id'])
            tokens = auth_manager.generate_tokens(user_id)
            result['tokens'] = tokens
        
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Registration error: {str(e)}")
        return jsonify({'success': False, 'error': f'Registration failed: {str(e)}'}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    """Login a user"""
    if not db:
        return jsonify({'success': False, 'error': 'Database not connected'}), 500
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided', 'success': False}), 400
            
        result = db_manager.authenticate_user(
            email_or_username=data.get('email_or_username'),
            password=data.get('password')
        )

        if result['success']:
            # Generate tokens for the logged-in user
            user_id = str(result['user']['id'])
            tokens = auth_manager.generate_tokens(user_id)
            result['tokens'] = tokens
        
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'error': f'Login failed: {str(e)}'}), 500

@app.route('/auth/refresh', methods=['POST'])
def refresh_token():
    """Refresh an access token"""
    try:
        data = request.get_json()
        if not data or 'refresh_token' not in data:
            return jsonify({'error': 'Refresh token is required', 'success': False}), 400
            
        result = auth_manager.refresh_access_token(data['refresh_token'])
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Token refresh error: {str(e)}")
        return jsonify({'success': False, 'error': f'Token refresh failed: {str(e)}'}), 500

@app.route('/auth/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get user profile"""
    try:
        user_id = request.user_id
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found', 'success': False}), 404
            
        # Remove sensitive data
        user.pop('password', None)
        user.pop('refresh_tokens', None)
        user['_id'] = str(user['_id'])
        
        return jsonify({
            'success': True,
            'user': user
        })
        
    except Exception as e:
        app.logger.error(f"Profile fetch error: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to fetch profile: {str(e)}'}), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({
        'success': False,
        'error': 'File is too large. Maximum size is 16MB.'
    }), 413

@app.errorhandler(500)
def internal_server_error(e):
    """Handle internal server errors"""
    app.logger.error(f"Internal server error: {str(e)}")
    return jsonify({
        'success': False,
        'error': 'An internal server error occurred'
    }), 500

def clean_text_with_libraries(text):
    """Clean text using basic text processing libraries"""
    try:
        import re
        
        # Basic text cleaning
        cleaned = text.strip()
        
        # Remove multiple spaces
        cleaned = re.sub(r'\s+', ' ', cleaned)
        
        # Fix common OCR errors
        cleaned = re.sub(r'[|]', 'I', cleaned)  # Replace | with I
        cleaned = re.sub(r'[}]', ')', cleaned)  # Replace } with )
        cleaned = re.sub(r'[{]', '(', cleaned)  # Replace { with (
        cleaned = re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', cleaned)  # Add space between camelCase
        
        # Fix spacing around punctuation
        cleaned = re.sub(r'\s*([.,!?:;])\s*', r'\1 ', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned)
        
        # Normalize quotes
        cleaned = re.sub(r'["""]', '"', cleaned)
        cleaned = re.sub(r"['']", "'", cleaned)
        
        # Fix common sentence spacing
        cleaned = re.sub(r'(?<=[.!?])\s*(?=[A-Z])', '\n\n', cleaned)
        
        return cleaned.strip()
        
    except Exception as e:
        app.logger.error(f"Text cleaning failed: {str(e)}")
        return text

def summarize_with_libraries(text):
    """Summarize text using basic NLP techniques"""
    try:
        import re
        from collections import Counter
        from string import punctuation
        
        # Tokenize into sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        if len(sentences) <= 3:
            return text
            
        # Tokenize words and remove stopwords
        stopwords = {'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
                    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
                    'will', 'with'}
                    
        words = []
        for sentence in sentences:
            words.extend([word.strip(punctuation).lower() 
                        for word in sentence.split()
                        if word.strip(punctuation).lower() not in stopwords])
        
        # Get word frequency
        word_freq = Counter(words)
        
        # Score sentences based on word frequency
        sentence_scores = []
        for sentence in sentences:
            score = sum(word_freq[word.strip(punctuation).lower()] 
                       for word in sentence.split()
                       if word.strip(punctuation).lower() in word_freq)
            sentence_scores.append((score, sentence))
        
        # Get top sentences
        sentence_scores.sort(reverse=True)
        num_sentences = max(3, len(sentences) // 4)  # At least 3 sentences or 25% of original
        summary_sentences = [sentence for _, sentence in sentence_scores[:num_sentences]]
        
        # Reorder sentences to maintain original flow
        summary_sentences.sort(key=lambda x: sentences.index(x))
        
        return '\n\n'.join(summary_sentences)
        
    except Exception as e:
        app.logger.error(f"Summarization failed: {str(e)}")
        return text[:500] + '...'  # Return truncated text as fallback

def extract_key_points_with_libraries(text):
    """Extract key points using basic NLP techniques"""
    try:
        import re
        from collections import Counter
        from string import punctuation
        
        # Split into sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        if not sentences:
            return "No key points found."
            
        # Simple scoring based on key phrases
        key_phrases = ['important', 'key', 'main', 'significant', 'essential', 'critical',
                      'must', 'should', 'need to', 'required', 'recommended', 'note that',
                      'remember', 'consider', 'ensure', 'crucial', 'vital', 'fundamental']
                      
        scored_sentences = []
        for sentence in sentences:
            score = sum(1 for phrase in key_phrases if phrase in sentence.lower())
            
            # Additional score for sentences with numbers, dates, or percentages
            if re.search(r'\d+', sentence):
                score += 1
            if re.search(r'\d{1,2}/\d{1,2}/\d{2,4}', sentence):
                score += 1
            if re.search(r'\d+%', sentence):
                score += 1
                
            scored_sentences.append((score, sentence))
        
        # Sort by score and get top sentences
        scored_sentences.sort(reverse=True)
        top_sentences = [s for _, s in scored_sentences[:5]]  # Get top 5 sentences
        
        # Format as bullet points
        bullet_points = []
        for i, sentence in enumerate(top_sentences, 1):
            # Clean up the sentence
            point = sentence.strip()
            if not point.endswith(('.', '!', '?')):
                point += '.'
            bullet_points.append(f"{i}. {point}")
        
        return '\n\n'.join(bullet_points)
        
    except Exception as e:
        app.logger.error(f"Key points extraction failed: {str(e)}")
        return f"KEY POINTS:\n\n• {text[:200]}{'...' if len(text) > 200 else ''}"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)