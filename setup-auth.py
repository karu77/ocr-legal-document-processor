#!/usr/bin/env python3
"""
Setup script for OCR Legal Document Processor with Authentication
This script installs the required dependencies and sets up the authentication system.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, description=""):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor} is compatible")
    return True

def check_node_version():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run("node --version", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js is installed: {result.stdout.strip()}")
            return True
    except:
        pass
    print("❌ Node.js is not installed. Please install Node.js from https://nodejs.org/")
    return False

def check_mongodb():
    """Check if MongoDB is running"""
    try:
        import pymongo
        client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
        client.server_info()
        print("✅ MongoDB is running and accessible")
        return True
    except:
        print("⚠️  MongoDB is not running or not accessible")
        print("   Please install and start MongoDB:")
        print("   - Windows: Download from https://www.mongodb.com/try/download/community")
        print("   - macOS: brew install mongodb-community")
        print("   - Linux: sudo apt-get install mongodb or sudo yum install mongodb")
        return False

def install_backend_dependencies():
    """Install Python backend dependencies"""
    print("\n📦 Installing Python backend dependencies...")
    
    # Check if we're in a virtual environment
    if sys.prefix == sys.base_prefix:
        print("⚠️  Consider using a virtual environment:")
        print("   python -m venv ocr-env")
        print("   source ocr-env/bin/activate  # On Windows: ocr-env\\Scripts\\activate")
        print("   Then run this script again")
        print()
    
    # Install backend dependencies
    if not run_command("pip install -r backend/requirements.txt", "Installing Python packages"):
        return False
    
    return True

def install_frontend_dependencies():
    """Install Node.js frontend dependencies"""
    print("\n📦 Installing Node.js frontend dependencies...")
    
    # Change to frontend directory and install
    os.chdir("frontend")
    
    if not run_command("npm install", "Installing Node.js packages"):
        os.chdir("..")
        return False
    
    os.chdir("..")
    return True

def setup_environment():
    """Set up environment variables"""
    print("\n🔧 Setting up environment variables...")
    
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if not env_file.exists():
        if env_example.exists():
            # Copy example file
            with open(env_example, 'r') as f:
                content = f.read()
            
            with open(env_file, 'w') as f:
                f.write(content)
            
            print("✅ Created .env file from env.example")
            print("⚠️  Please update the following in your .env file:")
            print("   - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey")
            print("   - JWT_SECRET_KEY: Generate a strong secret key")
            print("   - MONGODB_URI: Update if using remote MongoDB")
        else:
            print("❌ env.example file not found")
            return False
    else:
        print("✅ .env file already exists")
    
    return True

def create_startup_scripts():
    """Create convenient startup scripts"""
    print("\n📝 Creating startup scripts...")
    
    # Windows batch script
    with open("start-with-auth.bat", "w") as f:
        f.write("""@echo off
echo Starting OCR Legal Document Processor with Authentication...
echo.

echo Starting MongoDB (if not already running)...
start /b mongod --dbpath data/db 2>nul

echo.
echo Starting backend server...
cd backend
start /b python app.py

echo.
echo Starting frontend server...
cd ../frontend
start /b npm run dev

echo.
echo ✅ All services started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to stop all services...
pause >nul

echo Stopping services...
taskkill /f /im python.exe /t 2>nul
taskkill /f /im node.exe /t 2>nul
taskkill /f /im mongod.exe /t 2>nul
""")
    
    # Unix shell script
    with open("start-with-auth.sh", "w") as f:
        f.write("""#!/bin/bash
echo "Starting OCR Legal Document Processor with Authentication..."
echo

echo "Starting MongoDB (if not already running)..."
mongod --fork --dbpath data/db --logpath data/mongodb.log 2>/dev/null || echo "MongoDB may already be running"

echo
echo "Starting backend server..."
cd backend
python app.py &
BACKEND_PID=$!

echo
echo "Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ All services started!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop all services..."

# Wait for interrupt
trap 'echo "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
""")
    
    # Make shell script executable
    os.chmod("start-with-auth.sh", 0o755)
    
    print("✅ Created startup scripts: start-with-auth.bat and start-with-auth.sh")
    return True

def main():
    """Main setup function"""
    print("🚀 OCR Legal Document Processor - Authentication Setup")
    print("=" * 60)
    
    # Check system requirements
    if not check_python_version():
        return False
    
    if not check_node_version():
        return False
    
    # Install dependencies
    if not install_backend_dependencies():
        return False
    
    if not install_frontend_dependencies():
        return False
    
    # Check MongoDB
    check_mongodb()  # This is a warning, not a failure
    
    # Setup environment
    if not setup_environment():
        return False
    
    # Create startup scripts
    if not create_startup_scripts():
        return False
    
    print("\n🎉 Setup completed successfully!")
    print()
    print("📋 Next steps:")
    print("1. Update your .env file with:")
    print("   - GEMINI_API_KEY (get from https://makersuite.google.com/app/apikey)")
    print("   - JWT_SECRET_KEY (generate a strong secret key)")
    print("2. Start MongoDB if not already running")
    print("3. Run the application:")
    print(f"   - Windows: start-with-auth.bat")
    print(f"   - Unix/Linux/macOS: ./start-with-auth.sh")
    print()
    print("🌐 Access the application at:")
    print("   - Frontend: http://localhost:5173")
    print("   - Backend API: http://localhost:5000")
    print()
    print("🔐 New Authentication Features:")
    print("   - User registration and login")
    print("   - JWT token-based authentication")
    print("   - Document history for authenticated users")
    print("   - User profile management")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Setup failed with error: {e}")
        sys.exit(1) 