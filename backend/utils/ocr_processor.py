import io
import os
import pytesseract
from PIL import Image
import tempfile
import subprocess
import sys
import re
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
import spacy
from spacy.language import Language
from spacy.tokens import Doc
from translate import Translator

# Import for Word document processing
try:
    import docx2txt
    from docx import Document
    WORD_SUPPORT = True
except ImportError:
    WORD_SUPPORT = False

# Import for PDF processing
try:
    from pdf2image import convert_from_bytes, convert_from_path
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

# Set up Google Cloud Vision client
# Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set
# or provide credentials directly.
# For local development, it's common to set GOOGLE_APPLICATION_CREDENTIALS
# to the path of your service account key file.
# vision_client = vision.ImageAnnotatorClient()

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Load spaCy model
try:
    nlp = spacy.load('en_core_web_sm')
except OSError:
    print("Downloading spaCy model...")
    subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load('en_core_web_sm')

def install_poppler_guide():
    """Return installation guide for Poppler on Windows"""
    return """
    To enable PDF processing, please install Poppler:
    
    Option 1 - Using Chocolatey (Run PowerShell as Administrator):
    choco install poppler
    
    Option 2 - Manual Installation:
    1. Download Poppler from: https://github.com/oschwartz10612/poppler-windows/releases/
    2. Extract to C:\\poppler
    3. Add C:\\poppler\\Library\\bin to your PATH environment variable
    4. Restart your command prompt/IDE
    
    Option 3 - Using conda:
    conda install -c conda-forge poppler
    """

def extract_text_from_docx(filepath):
    """Extract text from DOCX files"""
    try:
        # Try docx2txt first (simpler)
        text = docx2txt.process(filepath)
        if text and text.strip():
            return text.strip()
        
        # Fallback to python-docx
        doc = Document(filepath)
        text_parts = []
        for paragraph in doc.paragraphs:
            text_parts.append(paragraph.text)
        return '\n'.join(text_parts)
    except Exception as e:
        return f"Error extracting text from DOCX: {e}"

def extract_text_from_doc(filepath):
    """Extract text from DOC files using antiword or textract"""
    try:
        # Try using antiword command line tool
        result = subprocess.run(['antiword', filepath], 
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0 and result.stdout:
            return result.stdout
    except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError):
        pass
    
    try:
        # Try using textract
        import textract
        text = textract.process(filepath, encoding='utf-8')
        return text.decode('utf-8')
    except ImportError:
        return "Error: textract not installed. Please install: pip install textract"
    except Exception as e:
        return f"Error extracting text from DOC: {e}"

def extract_text_from_txt(filepath):
    """Extract text from TXT files"""
    try:
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        for encoding in encodings:
            try:
                with open(filepath, 'r', encoding=encoding) as file:
                    return file.read()
            except UnicodeDecodeError:
                continue
        return "Error: Unable to decode text file with common encodings"
    except Exception as e:
        return f"Error reading text file: {e}"

def setup_poppler_path():
    """Setup Poppler path from project directory"""
    from pathlib import Path
    
    # Get the project root directory
    current_file = Path(__file__)
    project_root = current_file.parent.parent.parent
    
    # Check for Poppler in project directory
    poppler_paths = [
        project_root / "poppler" / "poppler-23.11.0" / "Library" / "bin",
        project_root / "poppler" / "Library" / "bin",
        project_root / "poppler" / "bin"
    ]
    
    for poppler_path in poppler_paths:
        if poppler_path.exists() and (poppler_path / "pdftoppm.exe").exists():
            # Add to PATH if not already there
            poppler_str = str(poppler_path)
            current_path = os.environ.get('PATH', '')
            if poppler_str not in current_path:
                os.environ['PATH'] = poppler_str + os.pathsep + current_path
                print(f"Added Poppler to PATH: {poppler_str}")
            return True
    
    return False

def check_poppler_installation():
    """Check if Poppler is installed and accessible"""
    # First try to setup from project directory
    setup_poppler_path()
    
    try:
        # Try to run pdftoppm command
        result = subprocess.run(['pdftoppm', '-h'], 
                              capture_output=True, timeout=5)
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError):
        return False

def process_pdf_fallback(filepath):
    """Fallback PDF processing using PyPDF2 for text extraction"""
    try:
        import PyPDF2
        with open(filepath, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text_parts = []
            for page_num, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                if text.strip():
                    text_parts.append(f"--- Page {page_num + 1} ---\n{text.strip()}")
            
            if text_parts:
                return "\n\n".join(text_parts)
            else:
                return "Error: PDF appears to be image-based. OCR processing requires Poppler installation."
    except ImportError:
        return "Error: PyPDF2 not installed. Please install: pip install PyPDF2"
    except Exception as e:
        return f"Error processing PDF: {e}"

def process_ocr(filepath, filename):
    """Process OCR for various document types"""
    file_extension = os.path.splitext(filename)[1].lower()
    extracted_text = ""

    if file_extension == '.pdf':
        if not PDF_SUPPORT:
            extracted_text = "Error: pdf2image not installed. Please install: pip install pdf2image"
        elif not check_poppler_installation():
            print("Poppler not found, trying fallback method...")
            extracted_text = process_pdf_fallback(filepath)
            if "Error:" in extracted_text:
                extracted_text += f"\n\n{install_poppler_guide()}"
        else:
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
                # Try fallback method
                extracted_text = process_pdf_fallback(filepath)
                if "Error:" in extracted_text:
                    extracted_text = f"Error: Failed to extract text from PDF. {e}\n\n{install_poppler_guide()}"

    elif file_extension in ['.docx']:
        if not WORD_SUPPORT:
            extracted_text = "Error: Word document support not installed. Please install: pip install python-docx docx2txt"
        else:
            extracted_text = extract_text_from_docx(filepath)

    elif file_extension in ['.doc']:
        extracted_text = extract_text_from_doc(filepath)

    elif file_extension in ['.txt', '.text']:
        extracted_text = extract_text_from_txt(filepath)

    elif file_extension in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp']:
        try:
            image = Image.open(filepath)
            extracted_text = pytesseract.image_to_string(image)
            if not extracted_text.strip():
                extracted_text = "Warning: No text detected in image. The image may not contain readable text."

        except Exception as e:
            print(f"Error processing image with Tesseract: {e}")
            extracted_text = f"Error: Failed to extract text from image using Tesseract. {e}"

    elif file_extension in ['.rtf']:
        try:
            import striprtf
            with open(filepath, 'r') as file:
                rtf_content = file.read()
                extracted_text = striprtf.striprtf(rtf_content)
        except ImportError:
            extracted_text = "Error: RTF support not installed. Please install: pip install striprtf"
        except Exception as e:
            extracted_text = f"Error processing RTF file: {e}"

    else:
        supported_formats = ['.pdf', '.docx', '.doc', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', '.rtf']
        extracted_text = f"Error: Unsupported file type '{file_extension}'. Supported formats: {', '.join(supported_formats)}"
    
    return extracted_text if extracted_text else "No text could be extracted from this document."

def clean_text(text: str) -> str:
    """Clean and format extracted text"""
    if not text:
        return ""
    
    # Basic cleanup
    text = re.sub(r'\s+', ' ', text)  # Remove multiple spaces
    text = re.sub(r'[^\x00-\x7F]+', '', text)  # Remove non-ASCII characters
    text = text.strip()
    
    # Process with spaCy
    doc = nlp(text)
    
    # Reconstruct text with proper formatting
    sentences = []
    current_paragraph = []
    
    for sent in doc.sents:
        # Clean the sentence
        clean_sent = re.sub(r'\s+', ' ', sent.text.strip())
        if clean_sent:
            current_paragraph.append(clean_sent)
            
            # Check for paragraph breaks (based on newlines or semantic breaks)
            if '\n' in sent.text or len(current_paragraph) > 5:
                sentences.append(' '.join(current_paragraph))
                current_paragraph = []
    
    # Add any remaining sentences
    if current_paragraph:
        sentences.append(' '.join(current_paragraph))
    
    # Join paragraphs with double newlines
    cleaned_text = '\n\n'.join(sentences)
    
    # Fix common OCR issues
    cleaned_text = re.sub(r'[lI](?=\d)', '1', cleaned_text)  # Fix common l/I to 1 confusion
    cleaned_text = re.sub(r'O(?=\d)', '0', cleaned_text)  # Fix common O to 0 confusion
    cleaned_text = re.sub(r'(?<=\d)[oO]', '0', cleaned_text)  # Fix common o/O to 0 confusion
    
    return cleaned_text

def summarize_text(text: str) -> str:
    """Generate a summary of the text using extractive summarization"""
    if not text:
        return ""
    
    # Process with spaCy
    doc = nlp(text)
    
    # Calculate sentence importance scores
    sentence_scores = {}
    for sent in doc.sents:
        # Score based on length and position
        score = len([token for token in sent if not token.is_stop and token.is_alpha])
        if sent.start == 0:  # First sentence gets a boost
            score *= 1.25
        sentence_scores[sent.text] = score
    
    # Get top sentences (about 30% of original)
    num_sentences = max(3, len(list(doc.sents)) // 3)
    summary_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)[:num_sentences]
    
    # Reconstruct summary in original order
    summary = []
    for sent in doc.sents:
        if sent.text in dict(summary_sentences):
            summary.append(sent.text.strip())
    
    return '\n\n'.join(summary)

def extract_key_points(text: str) -> list:
    """Extract key points from the text"""
    if not text:
        return []
    
    # Process with spaCy
    doc = nlp(text)
    
    # Extract important sentences based on various criteria
    key_points = []
    for sent in doc.sents:
        # Check for important features
        has_entity = any(ent.label_ in ['ORG', 'PERSON', 'DATE', 'MONEY', 'PERCENT'] for ent in sent.ents)
        has_numbers = any(token.like_num for token in sent)
        has_key_phrase = any(phrase in sent.text.lower() for phrase in [
            'must', 'shall', 'will', 'agree', 'require', 'important',
            'deadline', 'payment', 'terms', 'condition'
        ])
        
        if has_entity or has_numbers or has_key_phrase:
            clean_sent = re.sub(r'\s+', ' ', sent.text.strip())
            if clean_sent and clean_sent not in key_points:
                key_points.append(clean_sent)
    
    return key_points

def translate_text(text: str, target_language: str) -> str:
    """Translate text to target language"""
    if not text or not target_language:
        return ""
    
    try:
        # Initialize translator
        translator = Translator(to_lang=target_language)
        
        # Split text into manageable chunks (API limits)
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sent_tokenize(text):
            # Add sentence length plus a space
            sent_length = len(sentence) + 1
            
            if current_length + sent_length > 500:  # API typically has limits
                chunks.append(' '.join(current_chunk))
                current_chunk = [sentence]
                current_length = sent_length
            else:
                current_chunk.append(sentence)
                current_length += sent_length
        
        # Add any remaining chunk
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        # Translate each chunk
        translated_chunks = []
        for chunk in chunks:
            try:
                translated = translator.translate(chunk)
                if translated:
                    translated_chunks.append(translated)
            except Exception as e:
                print(f"Translation error for chunk: {e}")
                translated_chunks.append(chunk)  # Keep original on error
        
        # Join translated chunks
        return '\n\n'.join(translated_chunks)
        
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # Return original text on error

def compare_documents(text1: str, text2: str) -> dict:
    """Compare two documents and return differences"""
    if not text1 or not text2:
        return {
            "similarity_percentage": 0,
            "differences": [],
            "common_points": []
        }
    
    # Process both texts
    doc1 = nlp(text1)
    doc2 = nlp(text2)
    
    # Compare sentences
    sentences1 = [sent.text.strip() for sent in doc1.sents]
    sentences2 = [sent.text.strip() for sent in doc2.sents]
    
    # Find common and different sentences
    common = set(sentences1) & set(sentences2)
    only_in_1 = set(sentences1) - set(sentences2)
    only_in_2 = set(sentences2) - set(sentences1)
    
    # Calculate similarity percentage
    total_sentences = len(set(sentences1) | set(sentences2))
    similarity = len(common) / total_sentences if total_sentences > 0 else 0
    
    # Format differences
    differences = []
    if only_in_1:
        differences.append({
            "type": "removed",
            "sentences": list(only_in_1)
        })
    if only_in_2:
        differences.append({
            "type": "added",
            "sentences": list(only_in_2)
        })
    
    return {
        "similarity_percentage": round(similarity * 100, 2),
        "differences": differences,
        "common_points": list(common)
    } 