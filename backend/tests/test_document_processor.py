import pytest
import tempfile
import os
import json
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from PIL import Image

# Import the modules to test
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.document_processor import (
    DocumentProcessor, 
    ExtractedContent, 
    DocumentMetadata,
    TextExtractor,
    ImageExtractor,
    JSONExtractor,
    HTMLExtractor,
    DocumentTypeDetector,
    LanguageDetector,
    serialize_extracted_content
)

class TestDocumentTypeDetector:
    """Test document type detection"""
    
    def test_detect_pdf_type(self):
        """Test PDF file type detection"""
        file_ext, mime_type = DocumentTypeDetector.detect_file_type("test.pdf")
        assert file_ext == ".pdf"
        assert mime_type == "application/pdf"
    
    def test_detect_docx_type(self):
        """Test DOCX file type detection"""
        file_ext, mime_type = DocumentTypeDetector.detect_file_type("test.docx")
        assert file_ext == ".docx"
        assert mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    def test_is_supported(self):
        """Test supported file detection"""
        assert DocumentTypeDetector.is_supported("test.pdf") == True
        assert DocumentTypeDetector.is_supported("test.docx") == True
        assert DocumentTypeDetector.is_supported("test.xyz") == False

class TestTextExtractor:
    """Test text file extraction"""
    
    def test_extract_plain_text(self):
        """Test plain text file extraction"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write("This is a test text file.\nWith multiple lines.")
            temp_path = f.name
        
        try:
            extractor = TextExtractor()
            result = extractor.extract(temp_path, "test.txt")
            
            assert result.text == "This is a test text file.\nWith multiple lines."
            assert result.metadata.filename == "test.txt"
            assert result.metadata.file_type == ".txt"
            assert result.processing_method == "text_extraction"
        finally:
            os.unlink(temp_path)

class TestImageExtractor:
    """Test image OCR extraction"""
    
    def test_extract_image_mock_ocr(self):
        """Test image extraction with mocked OCR"""
        image = Image.new('RGB', (100, 50), color='white')
        
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            image.save(f.name, 'PNG')
            temp_path = f.name
        
        try:
            with patch('pytesseract.image_to_string', return_value="Sample OCR text"):
                with patch('pytesseract.image_to_data', return_value={'conf': ['80', '90']}):
                    extractor = ImageExtractor()
                    result = extractor.extract(temp_path, "test.png")
                    
                    assert result.text == "Sample OCR text"
                    assert result.metadata.filename == "test.png"
                    assert result.processing_method == "tesseract_ocr"
        finally:
            os.unlink(temp_path)

class TestJSONExtractor:
    """Test JSON file extraction"""
    
    def test_extract_json(self):
        """Test JSON file extraction"""
        test_data = {
            "name": "John Doe",
            "age": 30,
            "address": {
                "street": "123 Main St",
                "city": "Anytown"
            }
        }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(test_data, f)
            temp_path = f.name
        
        try:
            extractor = JSONExtractor()
            result = extractor.extract(temp_path, "test.json")
            
            assert "name: John Doe" in result.text
            assert "age: 30" in result.text
            assert result.metadata.filename == "test.json"
            assert result.processing_method == "json_extraction"
        finally:
            os.unlink(temp_path)

class TestDocumentProcessor:
    """Test the main document processor"""
    
    def test_get_supported_formats(self):
        """Test getting supported formats"""
        processor = DocumentProcessor()
        formats = processor.get_supported_formats()
        
        assert '.pdf' in formats
        assert '.docx' in formats
        assert '.txt' in formats
        assert '.jpg' in formats
    
    def test_process_text_file(self):
        """Test processing a text file end-to-end"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write("This is a comprehensive test of the document processor.")
            temp_path = f.name
        
        try:
            processor = DocumentProcessor()
            result = processor.process_document(temp_path, "test.txt")
            
            assert isinstance(result, ExtractedContent)
            assert result.text == "This is a comprehensive test of the document processor."
            assert result.metadata.filename == "test.txt"
            assert result.processing_method == "text_extraction"
        finally:
            os.unlink(temp_path)
    
    def test_process_nonexistent_file(self):
        """Test processing non-existent file"""
        processor = DocumentProcessor()
        
        with pytest.raises(FileNotFoundError):
            processor.process_document("/nonexistent/file.pdf")
    
    def test_process_unsupported_file(self):
        """Test processing unsupported file"""
        processor = DocumentProcessor()
        
        with pytest.raises(ValueError, match="Unsupported file type"):
            processor.process_document("test.xyz")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
