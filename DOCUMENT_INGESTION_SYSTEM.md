# Modular Document Ingestion System

## Overview

The Enhanced OCR Legal Document Processor now supports a comprehensive modular document ingestion system that can process **all major document formats** with advanced text extraction, metadata analysis, and table extraction capabilities.

## 🚀 Key Features

### ✅ Supported Document Formats

| Format | Library Used | Features Supported |
|--------|-------------|-------------------|
| **PDF** | PyMuPDF + pdfplumber | Text extraction, OCR for scanned PDFs, table extraction, metadata |
| **DOCX** | python-docx | Text extraction, table extraction, document properties |
| **DOC** | mammoth | Text extraction from legacy Word documents |
| **PPTX** | python-pptx | Slide text extraction, presentation metadata |
| **XLSX/XLS** | pandas + openpyxl | Table data extraction, multiple sheets support |
| **CSV** | pandas | Structured data extraction |
| **TXT** | Native Python | Plain text with encoding detection |
| **RTF** | striprtf | Rich text format support |
| **Images** | Tesseract + EasyOCR | OCR with confidence scoring, language detection |
| **HTML** | BeautifulSoup | Clean text extraction, metadata parsing |
| **Markdown** | markdown2 | Text extraction with formatting preservation |
| **JSON** | Native Python | Structured data extraction with hierarchy |
| **XML** | ElementTree | Structured data extraction with attributes |

### 🧠 Advanced Processing Features

1. **Automatic File Type Detection**
   - MIME type detection
   - Extension-based fallback
   - Magic number validation

2. **Language Detection**
   - Automatic language identification using `langdetect`
   - Confidence scoring for OCR results

3. **Metadata Extraction**
   - File properties (size, dates, author, title)
   - Document-specific metadata
   - Word/character count statistics

4. **Table Extraction**
   - Structured table data from PDFs, DOCX, Excel files
   - Header detection and data normalization
   - JSON serialization for API responses

5. **OCR Processing**
   - Dual OCR engine support (Tesseract + EasyOCR)
   - Confidence scoring and quality assessment
   - Language-specific processing

6. **Error Handling**
   - Graceful degradation for unsupported formats
   - Detailed error reporting
   - Fallback processing methods

## 🛠 Installation

### Dependencies

Install all required dependencies:

```bash
pip install -r backend/requirements.txt
```

### System Requirements

- **Tesseract OCR**: Required for image text extraction
- **Poppler**: Required for PDF to image conversion
- **Python 3.8+**: Minimum Python version

## 📚 API Documentation

### FastAPI Endpoints (v2.0)

#### 1. Process Single Document
```http
POST /api/v2/process
Content-Type: multipart/form-data

Parameters:
- file: Document file (required)
- extract_tables: boolean (default: true)
- extract_metadata: boolean (default: true)
- ocr_language: string (default: "en")
```

#### 2. Process Multiple Documents
```http
POST /api/v2/process/batch
Content-Type: multipart/form-data

Parameters:
- files: Array of document files (max 10)
- extract_tables: boolean (default: true)
- extract_metadata: boolean (default: true)
- ocr_language: string (default: "en")
```

#### 3. Validate File
```http
POST /api/v2/validate
Content-Type: multipart/form-data

Parameters:
- file: Document file to validate
```

#### 4. Get Supported Formats
```http
GET /api/v2/formats
```

#### 5. Health Check
```http
GET /api/v2/health
```

### Flask Integration (Backward Compatible)

The existing Flask endpoints continue to work with enhanced functionality:

```http
POST /api/process
POST /ocr
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
cd backend
python -m pytest tests/ -v

# Run specific test categories
python -m pytest tests/test_document_processor.py -v

# Run with coverage
python -m pytest tests/ --cov=utils --cov-report=html
```

### Test Cases Covered

1. **✅ Normal PDF file (text-based)**
2. **✅ Scanned PDF file**
3. **✅ DOCX file**
4. **✅ TXT file**
5. **✅ XLSX file with tables**
6. **✅ PNG/JPG image documents**
7. **✅ HTML file**
8. **✅ Unsupported formats**
9. **✅ Multiple files together**
10. **✅ Edge cases** (empty files, corrupt documents, large files)

## 🔧 Usage Examples

### Python API

```python
from utils.document_processor import document_processor

# Process a single document
result = document_processor.process_document("path/to/document.pdf")

# Access extracted content
print(f"Text: {result.text}")
print(f"Language: {result.metadata.language}")
print(f"Tables: {len(result.tables)}")

# Process multiple documents
results = document_processor.process_multiple_documents([
    "doc1.pdf", "doc2.docx", "doc3.xlsx"
])
```

### cURL Examples

```bash
# Process single document
curl -X POST "http://localhost:5000/api/v2/process" \
  -F "file=@document.pdf"

# Process multiple documents
curl -X POST "http://localhost:5000/api/v2/process/batch" \
  -F "files=@doc1.pdf" \
  -F "files=@doc2.docx"

# Validate file
curl -X POST "http://localhost:5000/api/v2/validate" \
  -F "file=@document.pdf"
```

## 🚨 Error Handling

The system provides comprehensive error handling with detailed error messages and graceful degradation for unsupported formats.

## 📊 Performance

Processing times vary by file type and size:
- TXT files: < 1 second
- PDF (text): 2-5 seconds  
- PDF (scanned): 10-30 seconds
- Images: 5-15 seconds

## 🔒 Security

- File type validation
- Size limits (20MB default)
- Automatic temporary file cleanup
- Input sanitization

## 🆕 Migration

The new system is fully backward compatible. Existing applications continue to work while automatically benefiting from enhanced capabilities.

---

**Version**: 2.0.0  
**Compatibility**: Python 3.8+, Flask 2.0+, FastAPI 0.68+ 