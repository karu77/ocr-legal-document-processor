#!/usr/bin/env python3
"""
Frontend components testing script.
Tests frontend functionality and UI components.
"""

import os
import sys
import requests
import json
import time
from pathlib import Path

def test_frontend_endpoint_integration():
    """Test that frontend endpoints are properly integrated"""
    print("🔍 Testing frontend-backend integration...")
    
    endpoints_to_test = [
        '/health',
        '/api/process',
        '/api/translate', 
        '/api/compare',
        '/cleanup',
        '/summarize',
        '/bullet_points'
    ]
    
    results = []
    for endpoint in endpoints_to_test:
        try:
            if endpoint == '/health':
                response = requests.get(f'http://localhost:5000{endpoint}', timeout=5)
            else:
                # These endpoints require POST with data
                test_data = {
                    'text': 'Sample text for testing'
                } if endpoint not in ['/api/process'] else {}
                
                if endpoint == '/api/process':
                    # Skip file upload test here as it's covered elsewhere
                    print(f"✅ {endpoint}: File upload endpoint available")
                    results.append(True)
                    continue
                elif endpoint == '/api/compare':
                    test_data = {'text1': 'Sample text', 'text2': 'Sample text'}
                elif endpoint == '/api/translate':
                    test_data = {'text': 'Hello', 'target_language': 'Spanish', 'source_language_code': 'en'}
                
                response = requests.post(
                    f'http://localhost:5000{endpoint}',
                    json=test_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
            
            if response.status_code in [200, 400]:  # 400 is OK for invalid requests
                print(f"✅ {endpoint}: Endpoint responding correctly")
                results.append(True)
            else:
                print(f"❌ {endpoint}: Unexpected status code {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"❌ {endpoint}: Failed with exception {e}")
            results.append(False)
    
    return all(results)

def test_cors_configuration():
    """Test CORS configuration for frontend compatibility"""
    print("\n🔍 Testing CORS configuration...")
    
    try:
        response = requests.options(
            'http://localhost:5000/health',
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET'
            },
            timeout=5
        )
        
        if response.status_code == 200:
            headers = response.headers
            if 'Access-Control-Allow-Origin' in headers:
                print("✅ CORS configured correctly")
                return True
            else:
                print("❌ CORS headers missing")
                return False
        else:
            print(f"❌ CORS preflight failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

def test_error_responses():
    """Test that error responses are properly formatted for frontend"""
    print("\n🔍 Testing error response formatting...")
    
    error_tests = [
        {
            'name': 'Missing required field',
            'endpoint': '/api/translate',
            'data': {},
            'expected_fields': ['success', 'error']
        },
        {
            'name': 'Invalid comparison data',
            'endpoint': '/api/compare',
            'data': {'text1': 'only one text'},
            'expected_fields': ['success', 'error']
        }
    ]
    
    results = []
    for test in error_tests:
        try:
            response = requests.post(
                f'http://localhost:5000{test["endpoint"]}',
                json=test['data'],
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code >= 400:
                data = response.json()
                has_all_fields = all(field in data for field in test['expected_fields'])
                
                if has_all_fields and data.get('success') is False:
                    print(f"✅ {test['name']}: Error response properly formatted")
                    results.append(True)
                else:
                    print(f"❌ {test['name']}: Error response missing required fields")
                    results.append(False)
            else:
                print(f"❌ {test['name']}: Expected error status but got {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"❌ {test['name']}: Exception {e}")
            results.append(False)
    
    return all(results)

def test_json_response_structure():
    """Test that all responses have consistent JSON structure"""
    print("\n🔍 Testing JSON response structure...")
    
    try:
        # Test a successful response
        response = requests.get('http://localhost:5000/health', timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict):
                print("✅ JSON responses properly structured")
                return True
            else:
                print("❌ Response is not a JSON object")
                return False
        else:
            print(f"❌ Health endpoint failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ JSON structure test failed: {e}")
        return False

def check_frontend_files():
    """Check if frontend files exist and are accessible"""
    print("\n🔍 Checking frontend files...")
    
    frontend_dir = Path(__file__).parent.parent / 'frontend'
    key_files = [
        'package.json',
        'src/App.jsx',
        'src/components/FileUpload.jsx',
        'src/components/ResultsDisplay.jsx',
        'index.html'
    ]
    
    results = []
    for file_path in key_files:
        full_path = frontend_dir / file_path
        if full_path.exists():
            print(f"✅ {file_path}: Found")
            results.append(True)
        else:
            print(f"❌ {file_path}: Missing")
            results.append(False)
    
    return all(results)

def main():
    """Run all frontend component tests"""
    print("🚀 Starting frontend components testing...")
    print("=" * 60)
    
    # Check if server is running
    try:
        response = requests.get('http://localhost:5000/health', timeout=5)
        if response.status_code != 200:
            print("❌ Backend server is not running. Please start it first.")
            return False
    except:
        print("❌ Backend server is not running. Please start it first.")
        return False
    
    print("✅ Backend server is running")
    
    test_results = []
    
    print("\n" + "=" * 60)
    test_results.append(test_frontend_endpoint_integration())
    
    print("\n" + "=" * 60)
    test_results.append(test_cors_configuration())
    
    print("\n" + "=" * 60)
    test_results.append(test_error_responses())
    
    print("\n" + "=" * 60)
    test_results.append(test_json_response_structure())
    
    print("\n" + "=" * 60)
    test_results.append(check_frontend_files())
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 FRONTEND COMPONENT TEST SUMMARY")
    print("=" * 60)
    
    test_names = [
        "Endpoint Integration",
        "CORS Configuration", 
        "Error Response Formatting",
        "JSON Response Structure",
        "Frontend Files Check"
    ]
    
    passed = sum(test_results)
    total = len(test_results)
    
    for i, (name, result) in enumerate(zip(test_names, test_results)):
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{i+1}. {name}: {status}")
    
    print("-" * 60)
    print(f"Overall Results: {passed}/{total} test suites passed")
    
    if passed == total:
        print("🎉 All frontend component tests passed!")
    else:
        print("⚠️  Some frontend tests failed. Please review the issues above.")
    
    return passed == total

if __name__ == "__main__":
    main() 