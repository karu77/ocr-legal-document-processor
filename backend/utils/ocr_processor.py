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
from langdetect import detect, LangDetectException
import pycountry

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

# Import for Excel processing
try:
    import openpyxl
    import xlrd
    import pandas as pd
    EXCEL_SUPPORT = True
except ImportError:
    EXCEL_SUPPORT = False

# Import for PowerPoint processing
try:
    from pptx import Presentation
    POWERPOINT_SUPPORT = True
except ImportError:
    POWERPOINT_SUPPORT = False

# Import for OpenDocument processing
try:
    from odf.opendocument import load
    from odf.text import P
    from odf.element import Text
    from odf.teletype import extractText
    OPENDOCUMENT_SUPPORT = True
except ImportError:
    OPENDOCUMENT_SUPPORT = False

# Import for HTML processing
try:
    from bs4 import BeautifulSoup
    import lxml
    HTML_SUPPORT = True
except ImportError:
    HTML_SUPPORT = False

# Import for advanced text processing
try:
    import chardet
    import textract
    ADVANCED_TEXT_SUPPORT = True
except ImportError:
    ADVANCED_TEXT_SUPPORT = False

# Import for alternative OCR
try:
    import easyocr
    EASYOCR_SUPPORT = True
except ImportError:
    EASYOCR_SUPPORT = False

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

def get_tesseract_lang_code(iso_code):
    """Convert ISO 639-1 (2-letter) to ISO 639-2 (3-letter) for Tesseract."""
    try:
        lang = pycountry.languages.get(alpha_2=iso_code)
        return lang.alpha_3
    except (AttributeError, KeyError):
        # Fallback for common languages not in pycountry's main list
        # or for special cases.
        mapping = {
            'zh-cn': 'chi_sim',
            'zh-tw': 'chi_tra',
            'he': 'heb',
            'ja': 'jpn',
            'ko': 'kor',
            'en': 'eng'
        }
        return mapping.get(iso_code, 'eng') # Default to English

def perform_ocr_with_lang_detect(image_path_or_obj):
    """
    Performs OCR on an image, automatically detecting the language.
    Returns a dictionary with text, language, and any warnings.
    """
    result = {
        'text': '',
        'detected_lang_name': 'English',
        'detected_lang_code': 'eng',
        'warning': None
    }
    
    try:
        # 1. Initial OCR pass with default settings (English) to get some text
        initial_text = pytesseract.image_to_string(image_path_or_obj, lang='eng')
        
        if not initial_text.strip():
            result['warning'] = "No text detected in the document."
            return result

        # 2. Detect language from the initial text
        try:
            # Use a sample of the text for detection to improve speed and accuracy
            sample_text = initial_text[:2000]
            iso_code = detect(sample_text)
            tess_code = get_tesseract_lang_code(iso_code)
            
            lang_name = pycountry.languages.get(alpha_2=iso_code).name
            result['detected_lang_name'] = lang_name
            result['detected_lang_code'] = tess_code
            
            # 3. If language is not English, re-run OCR with the detected language
            if tess_code != 'eng':
                print(f"Language detected: {lang_name} ({tess_code}). Re-running OCR...")
                final_text = pytesseract.image_to_string(image_path_or_obj, lang=tess_code)
                result['text'] = final_text
            else:
                result['text'] = initial_text
        
        except LangDetectException:
            result['text'] = initial_text
            result['warning'] = "Language could not be reliably detected. Defaulting to English."
        except Exception as lang_e:
            result['text'] = initial_text
            result['warning'] = f"An error occurred during language detection: {lang_e}. Defaulting to English."

    except Exception as ocr_e:
        result['text'] = f"Error during OCR processing: {ocr_e}"
        result['warning'] = "OCR failed."

    return result

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

def extract_text_from_excel(filepath):
    """Extract text from Excel files (XLS, XLSX)"""
    if not EXCEL_SUPPORT:
        return "Error: Excel support not installed. Please install: pip install openpyxl xlrd pandas"
    
    try:
        # Try to detect file format and read accordingly
        file_extension = os.path.splitext(filepath)[1].lower()
        
        if file_extension == '.xlsx':
            # Use openpyxl for .xlsx files
            workbook = openpyxl.load_workbook(filepath, data_only=True)
            text_parts = []
            
            for sheet_name in workbook.sheetnames:
                sheet = workbook[sheet_name]
                text_parts.append(f"=== Sheet: {sheet_name} ===")
                
                for row in sheet.iter_rows(values_only=True):
                    row_text = []
                    for cell in row:
                        if cell is not None and str(cell).strip():
                            row_text.append(str(cell))
                    if row_text:
                        text_parts.append(" | ".join(row_text))
                text_parts.append("")
            
            return "\n".join(text_parts)
        
        elif file_extension == '.xls':
            # Use pandas for .xls files (handles both xlrd and openpyxl)
            try:
                excel_file = pd.ExcelFile(filepath)
                text_parts = []
                
                for sheet_name in excel_file.sheet_names:
                    df = pd.read_excel(filepath, sheet_name=sheet_name)
                    text_parts.append(f"=== Sheet: {sheet_name} ===")
                    
                    # Convert DataFrame to text
                    for index, row in df.iterrows():
                        row_text = []
                        for value in row:
                            if pd.notna(value) and str(value).strip():
                                row_text.append(str(value))
                        if row_text:
                            text_parts.append(" | ".join(row_text))
                    text_parts.append("")
                
                return "\n".join(text_parts)
            except Exception as e:
                return f"Error reading XLS file: {e}"
        
    except Exception as e:
        return f"Error extracting text from Excel file: {e}"

def extract_text_from_powerpoint(filepath):
    """Extract text from PowerPoint files (PPT, PPTX)"""
    if not POWERPOINT_SUPPORT:
        return "Error: PowerPoint support not installed. Please install: pip install python-pptx"
    
    try:
        presentation = Presentation(filepath)
        text_parts = []
        
        for slide_num, slide in enumerate(presentation.slides, 1):
            text_parts.append(f"=== Slide {slide_num} ===")
            
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    text_parts.append(shape.text.strip())
                    
                # Handle tables in slides
                if shape.shape_type == 19:  # Table
                    try:
                        table = shape.table
                        for row in table.rows:
                            row_text = []
                            for cell in row.cells:
                                if cell.text.strip():
                                    row_text.append(cell.text.strip())
                            if row_text:
                                text_parts.append(" | ".join(row_text))
                    except:
                        pass
            
            text_parts.append("")
        
        return "\n".join(text_parts)
    
    except Exception as e:
        return f"Error extracting text from PowerPoint: {e}"

def extract_text_from_opendocument(filepath):
    """Extract text from OpenDocument files (ODT, ODS, ODP)"""
    if not OPENDOCUMENT_SUPPORT:
        return "Error: OpenDocument support not installed. Please install: pip install odfpy"
    
    try:
        doc = load(filepath)
        text_parts = []
        
        # Extract all text elements
        for element in doc.getElementsByType(P):
            text = extractText(element)
            if text.strip():
                text_parts.append(text.strip())
        
        return "\n".join(text_parts) if text_parts else "No text found in OpenDocument file"
    
    except Exception as e:
        return f"Error extracting text from OpenDocument: {e}"

def extract_text_from_html(filepath):
    """Extract text from HTML files"""
    if not HTML_SUPPORT:
        return "Error: HTML support not installed. Please install: pip install beautifulsoup4 lxml"
    
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
        
        soup = BeautifulSoup(content, 'lxml')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text if text else "No text found in HTML file"
    
    except Exception as e:
        return f"Error extracting text from HTML: {e}"

def extract_text_from_csv(filepath):
    """Extract text from CSV files"""
    try:
        # Try different encodings
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        
        for encoding in encodings:
            try:
                df = pd.read_csv(filepath, encoding=encoding)
                text_parts = []
                
                # Add column headers
                headers = " | ".join(str(col) for col in df.columns)
                text_parts.append(f"=== Headers ===\n{headers}\n")
                
                # Add data rows
                text_parts.append("=== Data ===")
                for index, row in df.iterrows():
                    row_text = []
                    for value in row:
                        if pd.notna(value) and str(value).strip():
                            row_text.append(str(value))
                    if row_text:
                        text_parts.append(" | ".join(row_text))
                
                return "\n".join(text_parts)
            
            except UnicodeDecodeError:
                continue
        
        return "Error: Unable to decode CSV file with common encodings"
    
    except Exception as e:
        return f"Error extracting text from CSV: {e}"

def extract_text_with_textract(filepath):
    """Fallback text extraction using textract for various formats"""
    if not ADVANCED_TEXT_SUPPORT:
        return "Error: Advanced text support not installed. Please install: pip install textract"
    
    try:
        text = textract.process(filepath, encoding='utf-8')
        if isinstance(text, bytes):
            text = text.decode('utf-8')
        return text.strip() if text else "No text could be extracted"
    
    except Exception as e:
        return f"Error extracting text with textract: {e}"

def detect_file_encoding(filepath):
    """Detect file encoding for better text extraction"""
    try:
        with open(filepath, 'rb') as file:
            raw_data = file.read()
            result = chardet.detect(raw_data)
            return result.get('encoding', 'utf-8')
    except:
        return 'utf-8'

def extract_text_with_easyocr(filepath):
    """Alternative OCR using EasyOCR for better multilingual support"""
    if not EASYOCR_SUPPORT:
        return None
    
    try:
        reader = easyocr.Reader(['en'])  # Can add more languages as needed
        result = reader.readtext(filepath)
        
        # Extract text from results
        text_parts = []
        for (bbox, text, confidence) in result:
            if confidence > 0.5:  # Only include high-confidence text
                text_parts.append(text)
        
        return "\n".join(text_parts) if text_parts else None
    
    except Exception as e:
        print(f"EasyOCR failed: {e}")
        return None

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
    
    # Fallback to textract
    return extract_text_with_textract(filepath)

def extract_text_from_txt(filepath):
    """Extract text from TXT files"""
    try:
        # First try to detect encoding
        if ADVANCED_TEXT_SUPPORT:
            encoding = detect_file_encoding(filepath)
            encodings = [encoding, 'utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        else:
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
    """Process OCR for various document types, now with language detection."""
    file_extension = os.path.splitext(filename)[1].lower()
    
    # This dictionary will hold our final results
    ocr_result = {
        'text': '',
        'detected_lang_name': 'N/A',
        'detected_lang_code': 'N/A',
        'warning': None
    }

    # Helper to update results
    def update_result(data, is_ocr=False):
        if is_ocr:
            ocr_result.update(data)
        else:
            ocr_result['text'] = data

    # PDF Files
    if file_extension == '.pdf':
        if not PDF_SUPPORT:
            update_result("Error: pdf2image not installed. Please install: pip install pdf2image")
        elif not check_poppler_installation():
            print("Poppler not found, trying fallback method...")
            fallback_text = process_pdf_fallback(filepath)
            if "Error:" in fallback_text:
                fallback_text += f"\\n\\n{install_poppler_guide()}"
            update_result(fallback_text)
        else:
            try:
                images = convert_from_path(filepath, dpi=300)
                all_texts = []
                detected_langs = []
                
                for i, image in enumerate(images):
                    page_result = perform_ocr_with_lang_detect(image)
                    all_texts.append(f"--- Page {i+1} ---\\n{page_result['text'].strip()}")
                    if page_result['detected_lang_code'] not in detected_langs:
                        detected_langs.append(page_result['detected_lang_code'])
                
                # Consolidate results
                update_result({
                    'text': "\\n\\n".join(all_texts),
                    'detected_lang_name': ', '.join(lang.capitalize() for lang in detected_langs),
                    'detected_lang_code': ','.join(detected_langs)
                }, is_ocr=True)

            except Exception as e:
                print(f"Error processing PDF with Tesseract/Poppler: {e}")
                update_result(f"Error: Failed to extract text from PDF. {e}\\n\\n{install_poppler_guide()}")

    # Image Files (OCR Processing)
    elif file_extension in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', '.tif']:
        try:
            update_result(perform_ocr_with_lang_detect(filepath), is_ocr=True)
            if not ocr_result['text'].strip() and not ocr_result['warning']:
                ocr_result['warning'] = "No text detected in image. The image may not contain readable text."
        except Exception as e:
            print(f"Error processing image with OCR: {e}")
            update_result(f"Error: Failed to extract text from image. {e}")

    # Microsoft Word Documents
    elif file_extension in ['.docx']:
        if not WORD_SUPPORT:
            update_result("Error: Word document support not installed. Please install: pip install python-docx docx2txt")
        else:
            update_result(extract_text_from_docx(filepath))

    elif file_extension in ['.doc']:
        update_result(extract_text_from_doc(filepath))

    # Other file types that don't need image-based OCR
    else:
        text_content = ""
        if file_extension in ['.xlsx', '.xls']:
            text_content = extract_text_from_excel(filepath)
        elif file_extension in ['.pptx', '.ppt']:
            text_content = extract_text_from_powerpoint(filepath)
        elif file_extension in ['.odt', '.ods', '.odp']:
            text_content = extract_text_from_opendocument(filepath)
        elif file_extension in ['.txt', '.text']:
            text_content = extract_text_from_txt(filepath)
        elif file_extension in ['.csv']:
            text_content = extract_text_from_csv(filepath)
        elif file_extension in ['.html', '.htm', '.xml']:
            text_content = extract_text_from_html(filepath)
        elif file_extension in ['.rtf']:
            try:
                import striprtf
                with open(filepath, 'r', encoding='utf-8') as file:
                    rtf_content = file.read()
                    text_content = striprtf.striprtf(rtf_content)
            except ImportError:
                text_content = "Error: RTF support not installed. Please install: pip install striprtf"
            except Exception as e:
                text_content = f"Error processing RTF file: {e}"
        else:
             text_content = f"Error: Unsupported file type '{file_extension}'."
        
        update_result(text_content)
    
    if not ocr_result['text'] and not ocr_result['warning']:
         ocr_result['text'] = "No text could be extracted from this document."

    return ocr_result

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