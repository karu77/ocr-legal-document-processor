import pytest
import tempfile
import os
import json
from pathlib import Path
from fastapi.testclient import TestClient
from PIL import Image
import io

# Import the FastAPI app
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.fastapi_routes import fastapi_app

class TestFastAPIIntegration:
    """Integration tests for FastAPI document processing endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(fastapi_app)
    
    @pytest.fixture
    def sample_text_file(self):
        """Create a sample text file"""
        content = "This is a sample legal document for testing purposes.\nIt contains multiple lines and legal terminology."
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(content)
            yield f.name
        os.unlink(f.name)
    
    @pytest.fixture
    def sample_json_file(self):
        """Create a sample JSON file"""
        data = {
            "contract": {
                "parties": ["Party A", "Party B"],
                "terms": {
                    "duration": "12 months",
                    "payment": "$10,000"
                },
                "clauses": [
                    "Confidentiality clause",
                    "Termination clause"
                ]
            }
        }
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(data, f)
            yield f.name
        os.unlink(f.name)
    
    @pytest.fixture
    def sample_html_file(self):
        """Create a sample HTML file"""
        html_content = """
        <html>
        <head>
            <title>Legal Document</title>
            <meta name="author" content="Legal Firm">
        </head>
        <body>
            <h1>Contract Agreement</h1>
            <p>This agreement is between the parties mentioned below.</p>
            <ul>
                <li>Party A: Company Inc.</li>
                <li>Party B: Individual</li>
            </ul>
        </body>
        </html>
        """
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
            f.write(html_content)
            yield f.name
        os.unlink(f.name)
    
    @pytest.fixture
    def sample_image_file(self):
        """Create a sample image file"""
        # Create a simple white image
        image = Image.new('RGB', (200, 100), color='white')
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            image.save(f.name, 'PNG')
            yield f.name
        os.unlink(f.name)
    
    @pytest.fixture
    def sample_csv_file(self):
        """Create a sample CSV file"""
        csv_content = "Name,Position,Salary\nJohn Doe,Manager,75000\nJane Smith,Developer,65000\nBob Johnson,Analyst,55000"
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_content)
            yield f.name
        os.unlink(f.name)
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "supported_formats" in data
        assert "endpoints" in data
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/api/v2/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "supported_formats" in data
    
    def test_get_supported_formats(self, client):
        """Test supported formats endpoint"""
        response = client.get("/api/v2/formats")
        assert response.status_code == 200
        data = response.json()
        assert "supported_formats" in data
        assert "format_details" in data
        assert ".pdf" in data["supported_formats"]
        assert ".docx" in data["supported_formats"]
        assert ".txt" in data["supported_formats"]
    
    def test_process_text_file(self, client, sample_text_file):
        """Test uploading and processing a text file"""
        with open(sample_text_file, 'rb') as f:
            response = client.post(
                "/api/v2/process",
                files={"file": ("test.txt", f, "text/plain")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "sample legal document" in data["text"].lower()
        assert data["metadata"]["file_type"] == ".txt"
        assert data["metadata"]["word_count"] > 0
        assert data["processing_method"] == "text_extraction"
    
    def test_process_json_file(self, client, sample_json_file):
        """Test uploading and processing a JSON file"""
        with open(sample_json_file, 'rb') as f:
            response = client.post(
                "/api/v2/process",
                files={"file": ("test.json", f, "application/json")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "Party A" in data["text"]
        assert "12 months" in data["text"]
        assert data["metadata"]["file_type"] == ".json"
        assert data["processing_method"] == "json_extraction"
        assert data["raw_content"] is not None
    
    def test_process_html_file(self, client, sample_html_file):
        """Test uploading and processing an HTML file"""
        with open(sample_html_file, 'rb') as f:
            response = client.post(
                "/api/v2/process",
                files={"file": ("test.html", f, "text/html")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "Contract Agreement" in data["text"]
        assert "Company Inc." in data["text"]
        assert data["metadata"]["title"] == "Legal Document"
        assert data["metadata"]["author"] == "Legal Firm"
        assert data["processing_method"] == "html_extraction"
    
    def test_process_csv_file(self, client, sample_csv_file):
        """Test uploading and processing a CSV file"""
        with open(sample_csv_file, 'rb') as f:
            response = client.post(
                "/api/v2/process",
                files={"file": ("test.csv", f, "text/csv")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "John Doe" in data["text"]
        assert "Manager" in data["text"]
        assert len(data["tables"]) == 1
        assert data["tables"][0]["headers"] == ["Name", "Position", "Salary"]
        assert data["tables"][0]["rows"] == 3
        assert data["processing_method"] == "excel_extraction"
    
    def test_process_image_file_mock_ocr(self, client, sample_image_file):
        """Test uploading and processing an image file with mocked OCR"""
        with open(sample_image_file, 'rb') as f:
            # Mock OCR to return some text
            import unittest.mock
            with unittest.mock.patch('pytesseract.image_to_string', return_value="This is sample OCR text from image"):
                with unittest.mock.patch('pytesseract.image_to_data', return_value={'conf': ['85', '90']}):
                    response = client.post(
                        "/api/v2/process",
                        files={"file": ("test.png", f, "image/png")}
                    )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "sample OCR text" in data["text"]
        assert data["metadata"]["file_type"] == ".png"
        assert data["processing_method"] == "tesseract_ocr"
        assert data["ocr_confidence"] > 0
    
    def test_process_multiple_files(self, client, sample_text_file, sample_json_file):
        """Test batch processing of multiple files"""
        files = []
        
        with open(sample_text_file, 'rb') as f1:
            with open(sample_json_file, 'rb') as f2:
                response = client.post(
                    "/api/v2/process/batch",
                    files=[
                        ("files", ("test1.txt", f1, "text/plain")),
                        ("files", ("test2.json", f2, "application/json"))
                    ]
                )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["processed_count"] == 2
        assert data["failed_count"] == 0
        assert len(data["results"]) == 2
        
        # Check first file (text)
        result1 = data["results"][0]
        assert result1["success"] == True
        assert result1["processing_method"] == "text_extraction"
        
        # Check second file (JSON)
        result2 = data["results"][1]
        assert result2["success"] == True
        assert result2["processing_method"] == "json_extraction"
    
    def test_validate_file_valid(self, client, sample_text_file):
        """Test file validation with valid file"""
        with open(sample_text_file, 'rb') as f:
            response = client.post(
                "/api/v2/validate",
                files={"file": ("test.txt", f, "text/plain")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        assert data["filename"] == "test.txt"
        assert data["file_type"] == ".txt"
    
    def test_validate_file_unsupported(self, client):
        """Test file validation with unsupported file"""
        # Create a fake unsupported file
        fake_content = b"fake binary content"
        
        response = client.post(
            "/api/v2/validate",
            files={"file": ("test.xyz", io.BytesIO(fake_content), "application/octet-stream")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == False
        assert "Unsupported file type" in data["error"]
    
    def test_process_empty_file(self, client):
        """Test processing empty file"""
        empty_content = b""
        
        response = client.post(
            "/api/v2/process",
            files={"file": ("empty.txt", io.BytesIO(empty_content), "text/plain")}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "Empty file uploaded" in data["detail"]
    
    def test_process_large_file(self, client):
        """Test processing file that exceeds size limit"""
        # Create content larger than 20MB
        large_content = b"A" * (21 * 1024 * 1024)  # 21MB
        
        response = client.post(
            "/api/v2/process",
            files={"file": ("large.txt", io.BytesIO(large_content), "text/plain")}
        )
        
        assert response.status_code == 413
        data = response.json()
        assert "File too large" in data["detail"]
    
    def test_process_no_file(self, client):
        """Test processing request without file"""
        response = client.post("/api/v2/process")
        
        assert response.status_code == 422  # FastAPI validation error
    
    def test_process_unsupported_file(self, client):
        """Test processing unsupported file type"""
        fake_content = b"fake binary content"
        
        response = client.post(
            "/api/v2/process",
            files={"file": ("test.xyz", io.BytesIO(fake_content), "application/octet-stream")}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "Unsupported file type" in data["detail"]
    
    def test_batch_process_too_many_files(self, client, sample_text_file):
        """Test batch processing with too many files"""
        files = []
        
        # Try to upload 11 files (limit is 10)
        with open(sample_text_file, 'rb') as f:
            content = f.read()
            
        file_list = []
        for i in range(11):
            file_list.append(("files", (f"test{i}.txt", io.BytesIO(content), "text/plain")))
        
        response = client.post("/api/v2/process/batch", files=file_list)
        
        assert response.status_code == 400
        data = response.json()
        assert "Maximum 10 files allowed" in data["detail"]
    
    def test_batch_process_mixed_results(self, client, sample_text_file):
        """Test batch processing with mixed valid and invalid files"""
        with open(sample_text_file, 'rb') as f:
            valid_content = f.read()
        
        invalid_content = b"fake content"
        
        response = client.post(
            "/api/v2/process/batch",
            files=[
                ("files", ("valid.txt", io.BytesIO(valid_content), "text/plain")),
                ("files", ("invalid.xyz", io.BytesIO(invalid_content), "application/octet-stream"))
            ]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["processed_count"] == 1
        assert data["failed_count"] == 1
        assert len(data["results"]) == 2
        
        # Check results
        valid_result = next(r for r in data["results"] if r["filename"] == "valid.txt")
        invalid_result = next(r for r in data["results"] if r["filename"] == "invalid.xyz")
        
        assert valid_result["success"] == True
        assert invalid_result["success"] == False
        assert "Unsupported file type" in invalid_result["error"]

class TestDocumentProcessingEdgeCases:
    """Test edge cases and error scenarios"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(fastapi_app)
    
    def test_process_corrupt_json(self, client):
        """Test processing corrupt JSON file"""
        corrupt_json = b'{"key": "value", "invalid": }'
        
        response = client.post(
            "/api/v2/process",
            files={"file": ("corrupt.json", io.BytesIO(corrupt_json), "application/json")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True  # Should handle gracefully
        assert "Error:" in data["text"]
        assert data["errors"] is not None
    
    def test_process_special_characters(self, client):
        """Test processing file with special characters"""
        special_text = "Legal document with special chars: àáâãäåæçèéêë 中文 العربية русский"
        
        response = client.post(
            "/api/v2/process",
            files={"file": ("special.txt", io.BytesIO(special_text.encode('utf-8')), "text/plain")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "àáâãäåæçèéêë" in data["text"]
        assert "中文" in data["text"]
    
    def test_process_very_long_filename(self, client):
        """Test processing file with very long filename"""
        long_filename = "a" * 200 + ".txt"
        content = b"Test content"
        
        response = client.post(
            "/api/v2/process",
            files={"file": (long_filename, io.BytesIO(content), "text/plain")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["filename"] == long_filename

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 