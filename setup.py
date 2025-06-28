#!/usr/bin/env python3
"""
OCR Legal Document Processor - Automated Setup Script
This script automates the entire setup process and checks for common issues.
"""

import os
import sys
import subprocess
import platform
import shutil
import urllib.request
import json
from pathlib import Path

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    END = '\033[0m'

class SetupManager:
    def __init__(self):
        self.system = platform.system().lower()
        self.errors = []
        self.warnings = []
        self.success_steps = []
        
    def print_header(self):
        """Print welcome header"""
        print(f"{Colors.CYAN}{Colors.BOLD}")
        print("=" * 60)
        print("  OCR LEGAL DOCUMENT PROCESSOR - AUTOMATED SETUP")
        print("=" * 60)
        print(f"{Colors.END}")
        print(f"{Colors.WHITE}This script will automatically set up everything you need!{Colors.END}\n")

    def check_python_version(self):
        """Check if Python version is compatible"""
        print(f"{Colors.BLUE}🐍 Checking Python version...{Colors.END}")
        
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            self.errors.append("Python 3.8+ is required. Please upgrade Python.")
            return False
        
        print(f"{Colors.GREEN}✅ Python {version.major}.{version.minor}.{version.micro} detected{Colors.END}")
        self.success_steps.append("Python version check")
        return True

    def check_node_version(self):
        """Check if Node.js is installed"""
        print(f"{Colors.BLUE}📦 Checking Node.js...{Colors.END}")
        
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                version = result.stdout.strip()
                print(f"{Colors.GREEN}✅ Node.js {version} detected{Colors.END}")
                self.success_steps.append("Node.js check")
                return True
        except FileNotFoundError:
            pass
        
        self.errors.append("Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/")
        return False

    def check_tesseract(self):
        """Check if Tesseract OCR is installed"""
        print(f"{Colors.BLUE}👁️ Checking Tesseract OCR...{Colors.END}")
        
        try:
            result = subprocess.run(['tesseract', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                version_line = result.stdout.split('\n')[0]
                print(f"{Colors.GREEN}✅ {version_line}{Colors.END}")
                self.success_steps.append("Tesseract OCR check")
                return True
        except FileNotFoundError:
            pass
        
        install_cmd = {
            'windows': 'Download from: https://github.com/UB-Mannheim/tesseract/wiki',
            'darwin': 'Run: brew install tesseract',
            'linux': 'Run: sudo apt install tesseract-ocr'
        }
        
        self.errors.append(f"Tesseract OCR not found. {install_cmd.get(self.system, 'Please install Tesseract OCR')}")
        return False

    def check_poppler(self):
        """Check if Poppler is installed (for PDF processing)"""
        print(f"{Colors.BLUE}📄 Checking Poppler (PDF support)...{Colors.END}")
        
        # Check for pdftoppm (part of poppler-utils)
        try:
            result = subprocess.run(['pdftoppm', '-h'], capture_output=True, text=True)
            if result.returncode == 0 or 'pdftoppm' in result.stderr:
                print(f"{Colors.GREEN}✅ Poppler utilities detected{Colors.END}")
                self.success_steps.append("Poppler check")
                return True
        except FileNotFoundError:
            pass
        
        install_cmd = {
            'windows': 'Download from: https://github.com/oschwartz10612/poppler-windows/releases',
            'darwin': 'Run: brew install poppler',
            'linux': 'Run: sudo apt install poppler-utils'
        }
        
        self.warnings.append(f"Poppler not found (PDF processing may fail). {install_cmd.get(self.system, 'Please install Poppler')}")
        return False

    def create_env_file(self):
        """Create .env file from template"""
        print(f"{Colors.BLUE}⚙️ Setting up environment file...{Colors.END}")
        
        if os.path.exists('.env'):
            print(f"{Colors.YELLOW}⚠️ .env file already exists, skipping...{Colors.END}")
            return True
        
        if os.path.exists('env.example'):
            shutil.copy('env.example', '.env')
            print(f"{Colors.GREEN}✅ Created .env file from template{Colors.END}")
            print(f"{Colors.YELLOW}📝 You can edit .env to add your Gemini API key (optional){Colors.END}")
            self.success_steps.append("Environment file creation")
            return True
        else:
            # Create a basic .env file
            env_content = """# OCR Legal Document Processor Configuration

# NLP Model Configuration
# Set to 'true' for local models (free, private, offline)
# Set to 'false' for Google Gemini API (requires API key and billing)
USE_LOCAL_NLP=true

# Optional: Google Gemini API Key (only needed if USE_LOCAL_NLP=false)
# Get your key from: https://aistudio.google.com/app/apikey
# GEMINI_API_KEY=your_actual_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# Performance Settings
MAX_CONTENT_LENGTH=16777216
ALLOWED_EXTENSIONS=png,jpg,jpeg,gif,bmp,tiff,pdf
"""
            with open('.env', 'w') as f:
                f.write(env_content)
            print(f"{Colors.GREEN}✅ Created basic .env file{Colors.END}")
            self.success_steps.append("Environment file creation")
            return True

    def setup_backend(self):
        """Set up Python backend"""
        print(f"{Colors.BLUE}🔧 Setting up Python backend...{Colors.END}")
        
        backend_dir = Path('backend')
        if not backend_dir.exists():
            self.errors.append("Backend directory not found!")
            return False
        
        venv_dir = backend_dir / 'venv'
        
        # Create virtual environment
        if not venv_dir.exists():
            print(f"{Colors.YELLOW}📦 Creating Python virtual environment...{Colors.END}")
            try:
                subprocess.run([sys.executable, '-m', 'venv', str(venv_dir)], check=True)
                print(f"{Colors.GREEN}✅ Virtual environment created{Colors.END}")
            except subprocess.CalledProcessError:
                self.errors.append("Failed to create virtual environment")
                return False
        
        # Determine activation script
        if self.system == 'windows':
            activate_script = venv_dir / 'Scripts' / 'activate'
            pip_path = venv_dir / 'Scripts' / 'pip'
        else:
            activate_script = venv_dir / 'bin' / 'activate'
            pip_path = venv_dir / 'bin' / 'pip'
        
        # Install requirements
        requirements_file = backend_dir / 'requirements.txt'
        if requirements_file.exists():
            print(f"{Colors.YELLOW}📦 Installing Python dependencies...{Colors.END}")
            try:
                subprocess.run([str(pip_path), 'install', '-r', str(requirements_file)], check=True)
                print(f"{Colors.GREEN}✅ Python dependencies installed{Colors.END}")
                
                # Install PyTorch for local NLP
                print(f"{Colors.YELLOW}🧠 Installing PyTorch for local NLP...{Colors.END}")
                subprocess.run([str(pip_path), 'install', 'torch', 'torchvision', 'torchaudio'], check=True)
                print(f"{Colors.GREEN}✅ PyTorch installed{Colors.END}")
                
                self.success_steps.append("Backend setup")
                return True
            except subprocess.CalledProcessError as e:
                self.errors.append(f"Failed to install Python dependencies: {e}")
                return False
        else:
            self.errors.append("requirements.txt not found in backend directory")
            return False

    def setup_frontend(self):
        """Set up React frontend"""
        print(f"{Colors.BLUE}⚛️ Setting up React frontend...{Colors.END}")
        
        frontend_dir = Path('frontend')
        if not frontend_dir.exists():
            self.errors.append("Frontend directory not found!")
            return False
        
        package_json = frontend_dir / 'package.json'
        if not package_json.exists():
            self.errors.append("package.json not found in frontend directory")
            return False
        
        # Install npm dependencies
        print(f"{Colors.YELLOW}📦 Installing Node.js dependencies...{Colors.END}")
        try:
            subprocess.run(['npm', 'install'], cwd=frontend_dir, check=True)
            print(f"{Colors.GREEN}✅ Node.js dependencies installed{Colors.END}")
            self.success_steps.append("Frontend setup")
            return True
        except subprocess.CalledProcessError as e:
            self.errors.append(f"Failed to install Node.js dependencies: {e}")
            return False

    def check_file_structure(self):
        """Check if all required files exist"""
        print(f"{Colors.BLUE}📁 Checking project structure...{Colors.END}")
        
        required_files = [
            'backend/app.py',
            'backend/requirements.txt',
            'backend/utils/__init__.py',
            'backend/utils/ocr_processor.py',
            'backend/utils/gemini_client.py',
            'frontend/package.json',
            'frontend/src/App.jsx',
            'frontend/src/main.jsx',
            'README.md'
        ]
        
        missing_files = []
        for file_path in required_files:
            if not os.path.exists(file_path):
                missing_files.append(file_path)
        
        if missing_files:
            self.errors.append(f"Missing required files: {', '.join(missing_files)}")
            return False
        
        print(f"{Colors.GREEN}✅ All required files present{Colors.END}")
        self.success_steps.append("File structure check")
        return True

    def test_backend_imports(self):
        """Test if backend can import all required modules"""
        print(f"{Colors.BLUE}🧪 Testing backend imports...{Colors.END}")
        
        backend_dir = Path('backend')
        venv_dir = backend_dir / 'venv'
        
        if self.system == 'windows':
            python_path = venv_dir / 'Scripts' / 'python'
        else:
            python_path = venv_dir / 'bin' / 'python'
        
        test_script = '''
import sys
sys.path.insert(0, ".")

try:
    from flask import Flask
    from flask_cors import CORS
    import pytesseract
    from PIL import Image
    import requests
    from transformers import pipeline
    print("✅ All critical imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
'''
        
        try:
            result = subprocess.run([str(python_path), '-c', test_script], 
                                  cwd=backend_dir, capture_output=True, text=True)
            if result.returncode == 0:
                print(f"{Colors.GREEN}✅ Backend imports working{Colors.END}")
                self.success_steps.append("Backend import test")
                return True
            else:
                self.warnings.append(f"Backend import issues: {result.stdout + result.stderr}")
                return False
        except Exception as e:
            self.warnings.append(f"Could not test backend imports: {e}")
            return False

    def create_startup_scripts(self):
        """Create or update startup scripts"""
        print(f"{Colors.BLUE}🚀 Creating startup scripts...{Colors.END}")
        
        # Enhanced Windows batch script
        windows_script = '''@echo off
echo ========================================
echo  OCR Legal Document Processor
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo Error: .env file not found!
    echo Please run setup.py first.
    pause
    exit /b
)

REM Check if backend virtual environment exists
if not exist backend\\venv (
    echo Error: Backend virtual environment not found!
    echo Please run setup.py first.
    pause
    exit /b
)

REM Check if frontend node_modules exists
if not exist frontend\\node_modules (
    echo Error: Frontend dependencies not installed!
    echo Please run setup.py first.
    pause
    exit /b
)

echo Starting Flask backend...
start "Backend Server" cmd /k "cd backend && venv\\Scripts\\activate && python app.py"

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo Starting React frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo ========================================
echo.
echo Press any key to exit...
pause >nul
'''
        
        # Enhanced Unix shell script
        unix_script = '''#!/bin/bash

echo "========================================"
echo "  OCR Legal Document Processor"
echo "========================================"
echo

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please run: python setup.py"
    exit 1
fi

# Check if backend virtual environment exists
if [ ! -d backend/venv ]; then
    echo "Error: Backend virtual environment not found!"
    echo "Please run: python setup.py"
    exit 1
fi

# Check if frontend node_modules exists
if [ ! -d frontend/node_modules ]; then
    echo "Error: Frontend dependencies not installed!"
    echo "Please run: python setup.py"
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    echo
    echo "Shutting down servers..."
    jobs -p | xargs -r kill
    exit 0
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Start backend
echo "Starting Flask backend..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Start frontend
echo "Starting React frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo "========================================"
echo "Both servers are running:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo "========================================"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for processes
wait
'''
        
        # Write scripts
        with open('start-dev.bat', 'w') as f:
            f.write(windows_script)
        
        with open('start-dev.sh', 'w') as f:
            f.write(unix_script)
        
        # Make Unix script executable
        if self.system != 'windows':
            os.chmod('start-dev.sh', 0o755)
        
        print(f"{Colors.GREEN}✅ Startup scripts created{Colors.END}")
        self.success_steps.append("Startup scripts creation")
        return True

    def print_summary(self):
        """Print setup summary"""
        print(f"\n{Colors.CYAN}{Colors.BOLD}")
        print("=" * 60)
        print("  SETUP SUMMARY")
        print("=" * 60)
        print(f"{Colors.END}")
        
        if self.success_steps:
            print(f"{Colors.GREEN}{Colors.BOLD}✅ SUCCESSFUL STEPS:{Colors.END}")
            for step in self.success_steps:
                print(f"{Colors.GREEN}  • {step}{Colors.END}")
            print()
        
        if self.warnings:
            print(f"{Colors.YELLOW}{Colors.BOLD}⚠️ WARNINGS:{Colors.END}")
            for warning in self.warnings:
                print(f"{Colors.YELLOW}  • {warning}{Colors.END}")
            print()
        
        if self.errors:
            print(f"{Colors.RED}{Colors.BOLD}❌ ERRORS:{Colors.END}")
            for error in self.errors:
                print(f"{Colors.RED}  • {error}{Colors.END}")
            print()
            print(f"{Colors.RED}{Colors.BOLD}Please fix the errors above before proceeding.{Colors.END}")
            return False
        else:
            print(f"{Colors.GREEN}{Colors.BOLD}🎉 SETUP COMPLETED SUCCESSFULLY!{Colors.END}")
            print()
            print(f"{Colors.WHITE}Next steps:{Colors.END}")
            print(f"{Colors.CYAN}  1. Run the application:{Colors.END}")
            if self.system == 'windows':
                print(f"{Colors.WHITE}     start-dev.bat{Colors.END}")
            else:
                print(f"{Colors.WHITE}     ./start-dev.sh{Colors.END}")
            print(f"{Colors.CYAN}  2. Open your browser:{Colors.END}")
            print(f"{Colors.WHITE}     http://localhost:3000{Colors.END}")
            print(f"{Colors.CYAN}  3. Upload a document and test the features!{Colors.END}")
            print()
            return True

    def run_setup(self):
        """Run the complete setup process"""
        self.print_header()
        
        # Run all setup steps
        steps = [
            self.check_python_version,
            self.check_node_version,
            self.check_tesseract,
            self.check_poppler,
            self.check_file_structure,
            self.create_env_file,
            self.setup_backend,
            self.setup_frontend,
            self.test_backend_imports,
            self.create_startup_scripts
        ]
        
        for step in steps:
            try:
                step()
                print()  # Add spacing between steps
            except Exception as e:
                self.errors.append(f"Unexpected error in {step.__name__}: {e}")
                print(f"{Colors.RED}❌ Error in {step.__name__}: {e}{Colors.END}\n")
        
        return self.print_summary()

def main():
    """Main entry point"""
    setup_manager = SetupManager()
    success = setup_manager.run_setup()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main() 