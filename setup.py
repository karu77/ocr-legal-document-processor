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
        self.is_windows = self.system == 'windows'
        
    def print_header(self):
        """Print welcome header"""
        print("\n" + "=" * 60)
        print("  OCR LEGAL DOCUMENT PROCESSOR - AUTOMATED SETUP")
        print("=" * 60)
        print("\nThis script will automatically set up everything you need!\n")

    def check_python_version(self):
        """Check if Python version is compatible"""
        print(">> Checking Python version...")
        
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            self.errors.append("Python 3.8+ is required. Please upgrade Python.")
            return False
        
        print(f"   + Python {version.major}.{version.minor}.{version.micro} detected")
        self.success_steps.append("Python version check")
        return True

    def check_node_version(self):
        """Check if Node.js is installed"""
        print(">> Checking Node.js...")
        
        try:
            # Use shell=True for better compatibility on Windows
            result = subprocess.run(['node', '--version'], capture_output=True, text=True, check=True, shell=self.is_windows)
            version = result.stdout.strip()
            print(f"   + Node.js {version} detected")
            self.success_steps.append("Node.js check")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            self.errors.append("Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/")
            return False

    def check_tesseract(self):
        """Check if Tesseract OCR is installed"""
        print(">> Checking Tesseract OCR...")
        
        try:
            # Use shell=True for better compatibility on Windows
            result = subprocess.run(['tesseract', '--version'], capture_output=True, text=True, check=True, shell=self.is_windows)
            version_line = result.stdout.split('\n')[0]
            print(f"   + {version_line}")
            self.success_steps.append("Tesseract OCR check")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            install_cmd = {
                'windows': 'Download from: https://github.com/UB-Mannheim/tesseract/wiki',
                'darwin': 'Run: brew install tesseract',
                'linux': 'Run: sudo apt install tesseract-ocr'
            }
            self.errors.append(f"Tesseract OCR not found. {install_cmd.get(self.system, 'Please install Tesseract OCR')}")
            return False

    def check_poppler(self):
        """Check if Poppler is installed (for PDF processing)"""
        print(">> Checking Poppler (PDF support)...")
        
        try:
            # Use shell=True for better compatibility on Windows
            result = subprocess.run(['pdftoppm', '-h'], capture_output=True, text=True, shell=self.is_windows)
            # Some versions of pdftoppm return non-zero on -h, so check stderr as well
            if result.returncode == 0 or 'pdftoppm' in result.stderr:
                print("   + Poppler utilities detected")
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
        print(">> Setting up environment file...")
        
        if os.path.exists('.env'):
            print("   ! .env file already exists, skipping...")
            return True
        
        if os.path.exists('env.example'):
            shutil.copy('env.example', '.env')
            print("   + Created .env file from template")
            print("   ! You can edit .env to add your Gemini API key (optional)")
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
            print("   + Created basic .env file")
            self.success_steps.append("Environment file creation")
            return True

    def setup_backend(self):
        """Set up Python backend"""
        print(">> Setting up Python backend...")
        
        backend_dir = Path('backend')
        if not backend_dir.exists():
            self.errors.append("Backend directory not found!")
            return False
        
        venv_dir = backend_dir / 'venv'
        
        # Create virtual environment
        if not venv_dir.exists():
            print("   - Creating Python virtual environment...")
            try:
                subprocess.run([sys.executable, '-m', 'venv', str(venv_dir)], check=True)
                print("   + Virtual environment created")
            except subprocess.CalledProcessError:
                self.errors.append("Failed to create virtual environment")
                return False
        
        # Determine activation script
        pip_path = venv_dir / 'Scripts' / 'pip' if self.is_windows else venv_dir / 'bin' / 'pip'
        
        # Install requirements
        requirements_file = backend_dir / 'requirements.txt'
        if requirements_file.exists():
            print("   - Installing Python dependencies...")
            try:
                subprocess.run([str(pip_path), 'install', '-r', str(requirements_file)], check=True, shell=self.is_windows)
                print("   + Python dependencies installed")
                
                # Install PyTorch for local NLP
                print("   - Installing PyTorch for local NLP...")
                subprocess.run([str(pip_path), 'install', 'torch', 'torchvision', 'torchaudio'], check=True, shell=self.is_windows)
                print("   + PyTorch installed")
                
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
        print(">> Setting up React frontend...")
        
        frontend_dir = Path('frontend')
        if not frontend_dir.exists():
            self.errors.append("Frontend directory not found!")
            return False
        
        package_json = frontend_dir / 'package.json'
        if not package_json.exists():
            self.errors.append("package.json not found in frontend directory")
            return False
        
        # Install npm dependencies
        print("   - Installing Node.js dependencies...")
        try:
            # Use shell=True for Windows compatibility
            subprocess.run(['npm', 'install'], cwd=frontend_dir, check=True, shell=self.is_windows)
            print("   + Node.js dependencies installed")
            self.success_steps.append("Frontend setup")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            self.errors.append(f"Failed to install Node.js dependencies: {e}")
            return False

    def check_file_structure(self):
        """Check if all required files exist"""
        print(">> Checking project structure...")
        
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
        
        all_found = True
        for file_path in required_files:
            if not os.path.exists(file_path):
                self.warnings.append(f"Missing file: {file_path}")
                all_found = False
        
        if all_found:
            print("   + All required files present")
            self.success_steps.append("File structure check")
        
        return all_found

    def test_backend_imports(self):
        """Test if backend modules can be imported without error"""
        print("\n>> Testing backend imports...")
        
        # Create a command to run a Python script that tries to import key modules
        # This avoids issues with sys.path in this setup script
        test_script_content = """
import sys
import os
import traceback

# Add backend and utils to path
backend_path = os.path.abspath('backend')
utils_path = os.path.join(backend_path, 'utils')
sys.path.insert(0, backend_path)
sys.path.insert(0, utils_path)

print('   - Testing core imports...')
try:
    from app import app
    from utils import ocr_processor
    from utils import gemini_client
    print('   + Core imports successful')
except Exception:
    print('   X Core imports FAILED')
    traceback.print_exc()
    sys.exit(1)

sys.exit(0)
"""
        
        try:
            # Use the python from the venv
            python_executable = Path('backend') / 'venv' / 'Scripts' / 'python' if self.is_windows else Path('backend') / 'venv' / 'bin' / 'python'
            if not python_executable.exists():
                # Fallback to system python if venv not created yet
                python_executable = sys.executable

            result = subprocess.run([str(python_executable), '-c', test_script_content], capture_output=True, text=True, encoding='utf-8')

            if result.returncode != 0:
                self.warnings.append(f"Backend import issues: {result.stderr or result.stdout}")
            else:
                print(result.stdout)
                self.success_steps.append("Backend import test")
        except Exception as e:
            self.warnings.append(f"Backend import test failed unexpectedly: {e}")

    def create_startup_scripts(self):
        """Create cross-platform startup scripts"""
        print("\n>> Creating startup scripts...")
        
        # Dev script
        dev_script_content = """
#!/bin/bash
# This script starts both the Flask backend and the React frontend for development.

# Function to kill all child processes
cleanup() {
    echo "Shutting down servers..."
    kill 0
}
trap cleanup EXIT

# Start backend
echo "Starting Flask backend..."
source backend/venv/bin/activate
flask --app backend/app run &
BACKEND_PID=$!

# Start frontend
echo "Starting React frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes to complete
wait $BACKEND_PID
wait $FRONTEND_PID
"""
        
        dev_script_content_win = """
@echo off
ECHO.
ECHO ========================================================
ECHO  Starting OCR Legal Document Processor
ECHO ========================================================
ECHO.
ECHO This will open two new command prompt windows:
ECHO   1. Flask Backend Server
ECHO   2. React Frontend Server
ECHO.
ECHO To stop the application, simply close both of those new windows.
ECHO.

REM Start backend in a new window and keep it open
ECHO Starting Flask backend...
start "Flask Backend" cmd /k "cd backend && .\\venv\\Scripts\\activate && flask run"

REM Start frontend in a new window and keep it open
ECHO Starting React frontend...
start "React Frontend" cmd /k "cd frontend && npm run dev"

ECHO.
ECHO Servers are starting up in new windows...
"""

        if self.is_windows:
            with open('start-dev.bat', 'w') as f:
                f.write(dev_script_content_win)
        else:
            with open('start-dev.sh', 'w', newline='\n') as f:
                f.write(dev_script_content)
                os.chmod('start-dev.sh', 0o755)

        print("   + Startup scripts created")
        self.success_steps.append("Startup scripts creation")

    def print_summary(self):
        """Print a summary of the setup process"""
        print(f"\n{Colors.CYAN}{Colors.BOLD}")
        print("=" * 60)
        print("  SETUP SUMMARY")
        print("=" * 60)
        print(Colors.END)
        
        print("\n+ SUCCESSFUL STEPS:")
        for step in self.success_steps:
            print(f"  - {step}")
            
        if self.warnings:
            print(f"\n{Colors.YELLOW}! WARNINGS:{Colors.END}")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        if self.errors:
            print(f"\n{Colors.RED}X ERRORS:{Colors.END}")
            for error in self.errors:
                print(f"  - {error}")
            
            print(f"\n{Colors.RED}Please fix the errors above before proceeding.{Colors.END}")
        else:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 Setup complete!{Colors.END}")
            print("To start the application, run:")
            if self.is_windows:
                print("   start-dev.bat")
            else:
                print("   ./start-dev.sh")
                
    def run_setup(self):
        """Run the entire setup process"""
        self.print_header()
        
        if self.check_python_version():
            if self.check_node_version():
                self.check_tesseract()
                self.check_poppler()
                self.check_file_structure()
                self.create_env_file()
                
                if self.setup_backend():
                    try:
                        self.setup_frontend()
                    except Exception as e:
                         self.errors.append(f"Unexpected error in setup_frontend: {e}")

                    self.test_backend_imports()
                
                self.create_startup_scripts()
        
        self.print_summary()

def main():
    manager = SetupManager()
    manager.run_setup()

if __name__ == '__main__':
    main() 