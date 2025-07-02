#!/usr/bin/env python3
"""
Comprehensive testing script for the OCR application.
Tests all functions and identifies bugs.
"""

import os
import sys
import requests
import json
import time
import tempfile
from pathlib import Path

# Add the backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get('http://localhost:5000/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed:", data)
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed with exception: {e}")
        return False

def test_file_upload():
    """Test file upload functionality"""
    print("\n🔍 Testing file upload functionality...")
    
    # Test with different file types
    test_files = [
        ('test.txt', 'text/plain', 'This is a test text file for OCR processing.'),
        ('test.html', 'text/html', '<html><body><h1>Test HTML</h1><p>This is a test HTML file.</p></body></html>'),
        ('test.csv', 'text/csv', 'Name,Age,City\nJohn,30,New York\nJane,25,London')
    ]
    
    results = []
    for filename, content_type, content in test_files:
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix=filename, delete=False) as f:
                f.write(content)
                temp_path = f.name
            
            # Test upload
            with open(temp_path, 'rb') as f:
                files = {'file': (filename, f, content_type)}
                response = requests.post('http://localhost:5000/api/process', files=files, timeout=30)
            
            # Clean up
            os.unlink(temp_path)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"✅ {filename} upload and processing successful")
                    print(f"   Extracted text length: {len(data.get('extracted_text', ''))}")
                    results.append(True)
                else:
                    print(f"❌ {filename} processing failed: {data.get('error', 'Unknown error')}")
                    results.append(False)
            else:
                print(f"❌ {filename} upload failed with status {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"❌ {filename} upload failed with exception: {e}")
            results.append(False)
    
    return all(results)

def test_translation_api():
    """Test translation functionality"""
    print("\n🔍 Testing translation functionality...")
    
    test_cases = [
        {'text': 'Hello world', 'target_language': 'Spanish', 'source_language_code': 'en'},
        {'text': 'Bonjour le monde', 'target_language': 'English', 'source_language_code': 'fr'},
        {'text': 'Hola mundo', 'target_language': 'English', 'source_language_code': 'es'}
    ]
    
    results = []
    for test_case in test_cases:
        try:
            response = requests.post(
                'http://localhost:5000/api/translate',
                json=test_case,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"✅ Translation successful: '{test_case['text']}' -> '{data.get('translated_text', '')}'")
                    results.append(True)
                else:
                    print(f"❌ Translation failed: {data.get('error', 'Unknown error')}")
                    results.append(False)
            else:
                print(f"❌ Translation request failed with status {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"❌ Translation failed with exception: {e}")
            results.append(False)
    
    return all(results)

def test_text_processing_apis():
    """Test text processing APIs (cleanup, summarize, bullet points)"""
    print("\n🔍 Testing text processing APIs...")
    
    test_text = """
    This is a sample legal document that contains important information. 
    It has multiple sentences and paragraphs. The document discusses various 
    legal matters and requirements. There are several key points that need 
    to be highlighted. The document also contains some formatting issues 
    that need to be cleaned up.
    """
    
    endpoints = ['cleanup', 'summarize', 'bullet_points']
    results = []
    
    for endpoint in endpoints:
        try:
            response = requests.post(
                f'http://localhost:5000/{endpoint}',
                json={'text': test_text},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    result_key = endpoint.replace('_', '')  # cleanup -> cleaned_text
                    if endpoint == 'cleanup':
                        result_key = 'cleaned_text'
                    elif endpoint == 'summarize':
                        result_key = 'summary'
                    elif endpoint == 'bullet_points':
                        result_key = 'bullet_points'
                    
                    result_text = data.get(result_key, '')
                    print(f"✅ {endpoint} successful (length: {len(result_text)})")
                    results.append(True)
                else:
                    print(f"❌ {endpoint} failed: {data.get('error', 'Unknown error')}")
                    results.append(False)
            else:
                print(f"❌ {endpoint} request failed with status {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"❌ {endpoint} failed with exception: {e}")
            results.append(False)
    
    return all(results)

def test_document_comparison():
    """Test document comparison functionality"""
    print("\n🔍 Testing document comparison...")
    
    test_cases = [
        {
            'text1': 'This is the first document.',
            'text2': 'This is the first document.',
            'expected_similarity': 100.0
        },
        {
            'text1': 'This is a completely different document.',
            'text2': 'This is the first document.',
            'expected_similarity': 'less_than_100'
        }
    ]
    
    results = []
    for i, test_case in enumerate(test_cases):
        try:
            response = requests.post(
                'http://localhost:5000/api/compare',
                json={'text1': test_case['text1'], 'text2': test_case['text2']},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    similarity = data.get('similarity_percentage', 0)
                    print(f"✅ Comparison {i+1} successful: {similarity}% similarity")
                    
                    if test_case['expected_similarity'] == 100.0:
                        if similarity == 100.0:
                            results.append(True)
                        else:
                            print(f"   ⚠️  Expected 100% similarity but got {similarity}%")
                            results.append(False)
                    else:
                        if similarity < 100.0:
                            results.append(True)
                        else:
                            print(f"   ⚠️  Expected less than 100% similarity but got {similarity}%")
                            results.append(False)
                else:
                    print(f"❌ Comparison {i+1} failed: {data.get('error', 'Unknown error')}")
                    results.append(False)
            else:
                print(f"❌ Comparison {i+1} request failed with status {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"❌ Comparison {i+1} failed with exception: {e}")
            results.append(False)
    
    return all(results)

def test_error_handling():
    """Test error handling"""
    print("\n🔍 Testing error handling...")
    
    error_tests = [
        {
            'name': 'Empty file upload',
            'url': 'http://localhost:5000/api/process',
            'method': 'POST',
            'data': {},
            'expected_status': 400
        },
        {
            'name': 'Invalid translation request',
            'url': 'http://localhost:5000/api/translate',
            'method': 'POST',
            'json': {},
            'expected_status': 400
        },
        {
            'name': 'Invalid comparison request',
            'url': 'http://localhost:5000/api/compare',
            'method': 'POST',
            'json': {'text1': 'only one text'},
            'expected_status': 400
        }
    ]
    
    results = []
    for test in error_tests:
        try:
            if test['method'] == 'POST':
                if 'json' in test:
                    response = requests.post(test['url'], json=test.get('json'), timeout=10)
                else:
                    response = requests.post(test['url'], data=test.get('data'), timeout=10)
            
            if response.status_code == test['expected_status']:
                print(f"✅ {test['name']}: Correctly returned status {response.status_code}")
                results.append(True)
            else:
                print(f"❌ {test['name']}: Expected status {test['expected_status']}, got {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"❌ {test['name']} failed with exception: {e}")
            results.append(False)
    
    return all(results)

def main():
    """Run all comprehensive tests"""
    print("🚀 Starting comprehensive OCR application testing...")
    print("=" * 60)
    
    # Wait for server to be ready
    print("⏳ Waiting for server to be ready...")
    max_retries = 10
    for i in range(max_retries):
        if test_health_endpoint():
            break
        if i < max_retries - 1:
            print(f"   Retrying in 2 seconds... ({i+1}/{max_retries})")
            time.sleep(2)
        else:
            print("❌ Server is not responding. Please start the Flask server first.")
            return
    
    # Run all tests
    test_results = []
    
    print("\n" + "=" * 60)
    test_results.append(test_file_upload())
    
    print("\n" + "=" * 60)
    test_results.append(test_translation_api())
    
    print("\n" + "=" * 60)
    test_results.append(test_text_processing_apis())
    
    print("\n" + "=" * 60)
    test_results.append(test_document_comparison())
    
    print("\n" + "=" * 60)
    test_results.append(test_error_handling())
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 COMPREHENSIVE TEST SUMMARY")
    print("=" * 60)
    
    test_names = [
        "File Upload & Processing",
        "Translation API",
        "Text Processing APIs",
        "Document Comparison",
        "Error Handling"
    ]
    
    passed = sum(test_results)
    total = len(test_results)
    
    for i, (name, result) in enumerate(zip(test_names, test_results)):
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{i+1}. {name}: {status}")
    
    print("-" * 60)
    print(f"Overall Results: {passed}/{total} test suites passed")
    
    if passed == total:
        print("🎉 All tests passed! The application is working correctly.")
    else:
        print("⚠️  Some tests failed. Please review the issues above.")
    
    return passed == total

if __name__ == "__main__":
    main() 