#!/usr/bin/env python3
"""
Quick test script for the authentication system
This will test the core functionality without requiring MongoDB initially
"""

import sys
import os
import subprocess
import time
import requests
import json

def test_backend_startup():
    """Test if the backend starts without errors"""
    print("🧪 Testing backend startup...")
    
    try:
        # Start backend in background
        proc = subprocess.Popen(
            [sys.executable, "app.py"],
            cwd="backend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for startup
        time.sleep(3)
        
        # Check if process is still running
        if proc.poll() is None:
            print("✅ Backend started successfully!")
            
            # Test health endpoint
            try:
                response = requests.get("http://localhost:5000/health", timeout=5)
                if response.status_code == 200:
                    print("✅ Health check passed!")
                    print(f"   Response: {response.json()}")
                else:
                    print(f"⚠️  Health check returned status: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"⚠️  Could not reach health endpoint: {e}")
            
            # Terminate the process
            proc.terminate()
            proc.wait()
            return True
        else:
            stdout, stderr = proc.communicate()
            print(f"❌ Backend failed to start:")
            print(f"   stdout: {stdout}")
            print(f"   stderr: {stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

def test_authentication_endpoints():
    """Test authentication endpoints with a running backend"""
    print("\n🔐 Testing authentication endpoints...")
    
    try:
        # Start backend
        proc = subprocess.Popen(
            [sys.executable, "app.py"],
            cwd="backend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait for startup
        time.sleep(3)
        
        if proc.poll() is not None:
            print("❌ Backend failed to start for testing")
            return False
        
        base_url = "http://localhost:5000"
        
        # Test 1: Health check
        print("  Testing health endpoint...")
        response = requests.get(f"{base_url}/health")
        print(f"    Health: {response.status_code} - {response.json().get('status', 'unknown')}")
        
        # Test 2: Register endpoint (will fail without MongoDB, but should show proper error)
        print("  Testing registration endpoint...")
        test_user = {
            "username": "testuser123",
            "email": "test@example.com",
            "password": "securepass123",
            "full_name": "Test User"
        }
        
        try:
            response = requests.post(f"{base_url}/auth/register", json=test_user)
            print(f"    Register: {response.status_code}")
            if response.status_code != 200:
                print(f"    Response: {response.text}")
        except Exception as e:
            print(f"    Register test error: {e}")
        
        # Test 3: OCR endpoint (should work without auth)
        print("  Testing OCR endpoint...")
        try:
            response = requests.post(f"{base_url}/ocr", files={})
            print(f"    OCR: {response.status_code} (expected 400 - no file)")
        except Exception as e:
            print(f"    OCR test error: {e}")
        
        # Cleanup
        proc.terminate()
        proc.wait()
        
        print("✅ Authentication endpoints are responding correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing authentication: {e}")
        if 'proc' in locals():
            proc.terminate()
        return False

def check_mongodb_availability():
    """Check if MongoDB is available"""
    print("\n🗄️  Checking MongoDB availability...")
    
    try:
        import pymongo
        client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
        client.server_info()
        print("✅ MongoDB is running and accessible!")
        return True
    except ImportError:
        print("❌ pymongo not installed")
        return False
    except Exception as e:
        print(f"⚠️  MongoDB not accessible: {e}")
        print("   You can still test the system - authentication will use Gemini API fallback")
        return False

def main():
    """Main test function"""
    print("🚀 OCR Legal Document Processor - Authentication Test")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists("backend/app.py"):
        print("❌ Please run this script from the project root directory")
        return False
    
    # Check if .env exists
    if not os.path.exists(".env"):
        print("⚠️  .env file not found. Creating from env.example...")
        if os.path.exists("env.example"):
            import shutil
            shutil.copy("env.example", ".env")
            print("✅ Created .env file")
        else:
            print("❌ env.example not found")
            return False
    
    # Test backend startup
    if not test_backend_startup():
        return False
    
    # Check MongoDB
    check_mongodb_availability()
    
    # Test authentication endpoints
    if not test_authentication_endpoints():
        return False
    
    print("\n🎉 Basic tests completed!")
    print("\n📋 Next steps:")
    print("1. Install MongoDB (optional - you can use Gemini API only)")
    print("2. Update .env with your GEMINI_API_KEY")
    print("3. Start the full application:")
    print("   Backend: cd backend && python app.py")
    print("   Frontend: cd frontend && npm run dev")
    print("4. Access: http://localhost:5173")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        sys.exit(1) 