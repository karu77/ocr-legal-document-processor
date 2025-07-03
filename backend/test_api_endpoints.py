import requests
import os
import json
from pathlib import Path

BASE_URL = "http://localhost:5000"
SAMPLE_FILES_DIR = Path("tests/sample_files")

def test_health():
    print("\n🔍 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_ocr():
    print("\n🔍 Testing OCR endpoint with different file types...")
    
    test_files = [
        "test.png",
        "test.pdf",
        "test.docx",
        "test.txt",
        "test.html"
    ]
    
    for file_name in test_files:
        file_path = SAMPLE_FILES_DIR / file_name
        if not file_path.exists():
            print(f"⚠️ File {file_name} not found, skipping...")
            continue
            
        print(f"\nTesting with {file_name}...")
        with open(file_path, "rb") as f:
            files = {"file": (file_name, f)}
            response = requests.post(f"{BASE_URL}/ocr", files=files)
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            assert response.status_code == 200
            assert response.json()["success"] == True

def test_translation():
    print("\n🔍 Testing translation endpoint...")
    
    test_texts = [
        ("Hello world", "Hindi"),
        ("This is a test document", "Spanish"),
        ("Legal document processing", "French")
    ]
    
    for text, target_lang in test_texts:
        print(f"\nTranslating to {target_lang}...")
        data = {
            "text": text,
            "target_language": target_lang
        }
        response = requests.post(f"{BASE_URL}/translate", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == 200

def test_cleanup():
    print("\n🔍 Testing text cleanup endpoint...")
    
    test_text = """This   is  a   test    document
    with     multiple    spaces
    and line   breaks."""
    
    data = {"text": test_text}
    response = requests.post(f"{BASE_URL}/cleanup", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200

def test_summarize():
    print("\n🔍 Testing summarization endpoint...")
    
    test_text = """The Legal Document Processing System is a comprehensive solution designed to handle various types of legal documents.
    It supports multiple file formats including PDF, DOCX, and images. The system can perform OCR, translation, and text analysis.
    Advanced features include document comparison, key point extraction, and automatic summarization.
    The system is built with security in mind and supports various authentication methods."""
    
    data = {"text": test_text}
    response = requests.post(f"{BASE_URL}/summarize", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200

def test_bullet_points():
    print("\n🔍 Testing bullet points extraction endpoint...")
    
    test_text = """The system includes several key features:
    1. OCR processing for scanned documents
    2. Translation support for multiple languages
    3. Document comparison capabilities
    4. Text summarization and analysis
    5. Security features and authentication"""
    
    data = {"text": test_text}
    response = requests.post(f"{BASE_URL}/bullet_points", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200

def test_document_comparison():
    print("\n🔍 Testing document comparison endpoint...")
    
    text1 = "This is the original document text."
    text2 = "This is the modified document text."
    
    data = {
        "text1": text1,
        "text2": text2
    }
    response = requests.post(f"{BASE_URL}/compare", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200

def main():
    print("🚀 Starting API endpoint tests...")
    
    tests = [
        test_health,
        test_ocr,
        test_translation,
        test_cleanup,
        test_summarize,
        test_bullet_points,
        test_document_comparison
    ]
    
    success_count = 0
    failure_count = 0
    
    for test in tests:
        try:
            test()
            success_count += 1
            print(f"✅ {test.__name__} passed")
        except Exception as e:
            failure_count += 1
            print(f"❌ {test.__name__} failed: {str(e)}")
            
    print(f"\n📊 Test Summary:")
    print(f"Total tests: {len(tests)}")
    print(f"Successes: {success_count}")
    print(f"Failures: {failure_count}")

if __name__ == "__main__":
    main() 