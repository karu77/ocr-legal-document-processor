#!/usr/bin/env python3
"""
Comprehensive File Format Support Installation Script
This script installs all the dependencies needed to support all file formats
in the OCR Legal Document Processor.
"""

import subprocess
import sys
import os
import platform

def run_command(command, description=""):
    """Run a command and handle errors"""
    print(f"\n🔧 {description}")
    print(f"Running: {command}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print("✅ Success!")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_pip_packages():
    """Install all required pip packages"""
    packages = [
        # Core dependencies
        "flask>=2.0.1",
        "flask-cors>=3.0.10",
        "python-dotenv>=0.19.2",
        "Werkzeug>=2.0.1",
        "requests>=2.28.2",
        
        # OCR and Image Processing
        "pytesseract>=3.8.0",
        "pillow>=10.0.0",
        "pdf2image>=1.16.0",
        "opencv-python>=4.8.1.78",
        "easyocr>=1.7.0",
        
        # Document Processing
        "python-docx>=0.8.11",
        "docx2txt>=0.8",
        "PyPDF2>=3.0.0",
        "striprtf>=0.0.26",
        "textract>=1.6.5",
        
        # Excel and Spreadsheet Support
        "openpyxl>=3.1.0",
        "xlrd>=2.0.1",
        "pandas>=2.0.0",
        
        # PowerPoint Support
        "python-pptx>=0.6.21",
        
        # OpenDocument Support
        "odfpy>=1.4.1",
        
        # HTML/XML Processing
        "beautifulsoup4>=4.12.0",
        "lxml>=4.9.0",
        
        # Text Processing
        "chardet>=5.0.0",
        
        # Authentication & Database
        "pymongo>=4.0.1",
        "Flask-JWT-Extended>=4.4.4",
        "bcrypt>=4.0.1",
        "email-validator>=2.0.0",
        
        # NLP Libraries
        "nltk>=3.8.1",
        "spacy>=3.7.2",
        "translate>=3.6.1",
        "PyJWT>=2.3.0"
    ]
    
    print(f"\n📦 Installing {len(packages)} Python packages...")
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            print(f"⚠️  Failed to install {package}, continuing with others...")
    
    return True

def install_spacy_model():
    """Install spaCy English model"""
    print("\n🧠 Installing spaCy English model...")
    return run_command("python -m spacy download en_core_web_sm", "Downloading spaCy English model")

def install_system_dependencies():
    """Install system dependencies based on OS"""
    system = platform.system().lower()
    
    if system == "windows":
        print("\n🖥️  Windows detected - Installing system dependencies...")
        print("Please install the following manually:")
        print("1. Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki")
        print("2. Poppler: https://github.com/oschwartz10612/poppler-windows/releases/")
        print("3. Add both to your PATH environment variable")
        print("\nAlternatively, if you have Chocolatey installed:")
        print("Run as Administrator: choco install tesseract poppler")
        
    elif system == "darwin":  # macOS
        print("\n🍎 macOS detected - Installing system dependencies...")
        if run_command("brew --version", "Checking for Homebrew"):
            run_command("brew install tesseract poppler", "Installing Tesseract and Poppler")
            run_command("brew install antiword", "Installing antiword for DOC files")
        else:
            print("Please install Homebrew first: https://brew.sh/")
            
    elif system == "linux":
        print("\n🐧 Linux detected - Installing system dependencies...")
        # Try different package managers
        if run_command("apt --version", "Checking for apt"):
            run_command("sudo apt update", "Updating package list")
            run_command("sudo apt install -y tesseract-ocr poppler-utils antiword", "Installing dependencies")
        elif run_command("yum --version", "Checking for yum"):
            run_command("sudo yum install -y tesseract poppler-utils antiword", "Installing dependencies")
        elif run_command("pacman --version", "Checking for pacman"):
            run_command("sudo pacman -S tesseract poppler antiword", "Installing dependencies")
        else:
            print("Please install tesseract-ocr, poppler-utils, and antiword using your package manager")

def download_nltk_data():
    """Download required NLTK data"""
    print("\n📚 Downloading NLTK data...")
    nltk_downloads = [
        "punkt",
        "stopwords",
        "wordnet",
        "averaged_perceptron_tagger"
    ]
    
    for data_name in nltk_downloads:
        run_command(f"python -c \"import nltk; nltk.download('{data_name}')\"", f"Downloading {data_name}")

def create_test_script():
    """Create a test script to verify installation"""
    test_script = '''#!/usr/bin/env python3
"""
Test script to verify comprehensive file format support installation
"""

def test_imports():
    """Test if all required modules can be imported"""
    modules_to_test = [
        ("PIL", "Pillow - Image processing"),
        ("pytesseract", "Tesseract OCR"),
        ("pdf2image", "PDF to image conversion"),
        ("docx", "Word document processing"),
        ("openpyxl", "Excel processing"),
        ("pptx", "PowerPoint processing"),
        ("bs4", "HTML processing"),
        ("pandas", "Data processing"),
        ("nltk", "Natural language processing"),
        ("spacy", "Advanced NLP"),
        ("easyocr", "Alternative OCR"),
        ("chardet", "Character encoding detection"),
        ("odf", "OpenDocument processing"),
    ]
    
    print("🧪 Testing module imports...")
    failed_imports = []
    
    for module_name, description in modules_to_test:
        try:
            __import__(module_name)
            print(f"✅ {module_name} - {description}")
        except ImportError as e:
            print(f"❌ {module_name} - {description} - Failed: {e}")
            failed_imports.append(module_name)
    
    if failed_imports:
        print(f"\\n⚠️  {len(failed_imports)} modules failed to import:")
        for module in failed_imports:
            print(f"   - {module}")
        print("\\nSome features may not work correctly.")
    else:
        print("\\n🎉 All modules imported successfully!")
    
    return len(failed_imports) == 0

def test_system_tools():
    """Test if system tools are available"""
    import subprocess
    
    tools_to_test = [
        ("tesseract", "Tesseract OCR"),
        ("pdftoppm", "Poppler PDF tools"),
    ]
    
    print("\\n🔧 Testing system tools...")
    failed_tools = []
    
    for tool_name, description in tools_to_test:
        try:
            result = subprocess.run([tool_name, "--version"], 
                                  capture_output=True, timeout=5)
            if result.returncode == 0:
                print(f"✅ {tool_name} - {description}")
            else:
                print(f"❌ {tool_name} - {description} - Not working")
                failed_tools.append(tool_name)
        except (subprocess.TimeoutExpired, FileNotFoundError):
            print(f"❌ {tool_name} - {description} - Not found")
            failed_tools.append(tool_name)
    
    if failed_tools:
        print(f"\\n⚠️  {len(failed_tools)} system tools not available:")
        for tool in failed_tools:
            print(f"   - {tool}")
    else:
        print("\\n🎉 All system tools available!")
    
    return len(failed_tools) == 0

if __name__ == "__main__":
    print("🚀 Testing Comprehensive File Format Support Installation")
    print("=" * 60)
    
    modules_ok = test_imports()
    tools_ok = test_system_tools()
    
    print("\\n" + "=" * 60)
    if modules_ok and tools_ok:
        print("🎉 Installation test PASSED! All file formats should be supported.")
    else:
        print("⚠️  Installation test FAILED! Some features may not work.")
        print("Please check the failed items above and reinstall as needed.")
'''
    
    with open("test_installation.py", "w") as f:
        f.write(test_script)
    
    print("\n📝 Created test_installation.py - run this to verify your installation")

def main():
    """Main installation function"""
    print("🚀 OCR Legal Document Processor - Comprehensive File Format Support Installation")
    print("=" * 80)
    
    if not check_python_version():
        return False
    
    # Install system dependencies
    install_system_dependencies()
    
    # Install Python packages
    install_pip_packages()
    
    # Install spaCy model
    install_spacy_model()
    
    # Download NLTK data
    download_nltk_data()
    
    # Create test script
    create_test_script()
    
    print("\n🎉 Installation complete!")
    print("\nNext steps:")
    print("1. Run 'python test_installation.py' to verify everything works")
    print("2. If on Windows, make sure to install Tesseract and Poppler manually")
    print("3. Add Tesseract and Poppler to your PATH environment variable")
    print("4. Restart your terminal/IDE after installing system dependencies")
    print("5. Run 'python backend/app.py' to start the server")
    
    return True

if __name__ == "__main__":
    main() 