#!/usr/bin/env python3
"""
Install Hindi Language Support for OCR
This script helps install Hindi language packs for better Devanagari script recognition
"""

import os
import sys
import platform
import subprocess
import urllib.request
import tempfile
import shutil

def print_status(message, status="info"):
    colors = {
        "info": "\033[94m",      # Blue
        "success": "\033[92m",   # Green
        "warning": "\033[93m",   # Yellow
        "error": "\033[91m",     # Red
        "reset": "\033[0m"       # Reset
    }
    
    symbols = {
        "info": "ℹ️",
        "success": "✅",
        "warning": "⚠️",
        "error": "❌"
    }
    
    print(f"{colors[status]}{symbols[status]} {message}{colors['reset']}")

def run_command(command, description=""):
    """Run a system command and return success status"""
    try:
        print_status(f"Running: {description or command}", "info")
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print_status(f"Success: {description or command}", "success")
            return True
        else:
            print_status(f"Failed: {description or command}", "error")
            if result.stderr:
                print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print_status(f"Exception: {str(e)}", "error")
        return False

def check_tesseract():
    """Check if Tesseract is installed"""
    try:
        result = subprocess.run(['tesseract', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print_status(f"Tesseract found: {version_line}", "success")
            return True
    except FileNotFoundError:
        pass
    
    print_status("Tesseract OCR not found!", "error")
    print("Please install Tesseract first:")
    system = platform.system().lower()
    if system == "windows":
        print("Download from: https://github.com/UB-Mannheim/tesseract/wiki")
    elif system == "darwin":
        print("Run: brew install tesseract")
    else:
        print("Run: sudo apt install tesseract-ocr")
    return False

def check_tesseract_languages():
    """Check which languages are currently installed"""
    try:
        result = subprocess.run(['tesseract', '--list-langs'], capture_output=True, text=True)
        if result.returncode == 0:
            langs = result.stdout.strip().split('\n')[1:]  # Skip first line
            print_status(f"Currently installed languages: {', '.join(langs)}", "info")
            return langs
    except:
        return []

def install_hindi_windows():
    """Install Hindi language pack on Windows"""
    print_status("Installing Hindi language pack for Windows...", "info")
    
    # Download Hindi traineddata file
    hindi_url = "https://github.com/tesseract-ocr/tessdata_best/raw/main/hin.traineddata"
    
    # Find Tesseract installation directory
    possible_paths = [
        r"C:\Program Files\Tesseract-OCR\tessdata",
        r"C:\Program Files (x86)\Tesseract-OCR\tessdata",
        r"C:\Users\{}\AppData\Local\Tesseract-OCR\tessdata".format(os.getenv('USERNAME')),
        r"C:\tools\tesseract\tessdata"
    ]
    
    tessdata_dir = None
    for path in possible_paths:
        if os.path.exists(path):
            tessdata_dir = path
            break
    
    if not tessdata_dir:
        print_status("Could not find Tesseract tessdata directory!", "error")
        print("Please locate your Tesseract installation and manually download:")
        print(f"URL: {hindi_url}")
        print("Save as: hin.traineddata in your tessdata folder")
        return False
    
    try:
        print_status(f"Downloading Hindi language pack to {tessdata_dir}...", "info")
        hindi_file = os.path.join(tessdata_dir, "hin.traineddata")
        urllib.request.urlretrieve(hindi_url, hindi_file)
        print_status("Hindi language pack installed successfully!", "success")
        return True
    except Exception as e:
        print_status(f"Failed to download Hindi pack: {e}", "error")
        return False

def install_hindi_linux():
    """Install Hindi language pack on Linux"""
    print_status("Installing Hindi language pack for Linux...", "info")
    
    # Try package manager first
    if run_command("sudo apt update", "Updating package list"):
        if run_command("sudo apt install -y tesseract-ocr-hin", "Installing Hindi language pack"):
            return True
    
    # Try yum/dnf
    if run_command("sudo yum install -y tesseract-langpack-hin", "Installing Hindi with yum"):
        return True
    
    if run_command("sudo dnf install -y tesseract-langpack-hin", "Installing Hindi with dnf"):
        return True
    
    # Manual installation
    print_status("Trying manual installation...", "info")
    hindi_url = "https://github.com/tesseract-ocr/tessdata_best/raw/main/hin.traineddata"
    
    try:
        with tempfile.NamedTemporaryFile(suffix='.traineddata', delete=False) as tmp_file:
            urllib.request.urlretrieve(hindi_url, tmp_file.name)
            
            # Try common tessdata locations
            tessdata_dirs = [
                "/usr/share/tesseract-ocr/4.00/tessdata",
                "/usr/share/tesseract-ocr/tessdata",
                "/usr/share/tessdata",
                "/opt/homebrew/share/tessdata"
            ]
            
            for tessdata_dir in tessdata_dirs:
                if os.path.exists(tessdata_dir):
                    target = os.path.join(tessdata_dir, "hin.traineddata")
                    if run_command(f"sudo cp {tmp_file.name} {target}", f"Installing to {tessdata_dir}"):
                        os.unlink(tmp_file.name)
                        return True
            
            os.unlink(tmp_file.name)
            print_status("Could not find tessdata directory for manual installation", "error")
            return False
            
    except Exception as e:
        print_status(f"Manual installation failed: {e}", "error")
        return False

def install_hindi_macos():
    """Install Hindi language pack on macOS"""
    print_status("Installing Hindi language pack for macOS...", "info")
    
    # Try homebrew
    if run_command("brew install tesseract-lang", "Installing language packs with Homebrew"):
        return True
    
    # Manual installation
    print_status("Trying manual installation...", "info")
    hindi_url = "https://github.com/tesseract-ocr/tessdata_best/raw/main/hin.traineddata"
    
    try:
        tessdata_dirs = [
            "/opt/homebrew/share/tessdata",
            "/usr/local/share/tessdata",
            "/usr/share/tessdata"
        ]
        
        for tessdata_dir in tessdata_dirs:
            if os.path.exists(tessdata_dir):
                target = os.path.join(tessdata_dir, "hin.traineddata")
                with tempfile.NamedTemporaryFile(suffix='.traineddata', delete=False) as tmp_file:
                    urllib.request.urlretrieve(hindi_url, tmp_file.name)
                    if run_command(f"cp {tmp_file.name} {target}", f"Installing to {tessdata_dir}"):
                        os.unlink(tmp_file.name)
                        return True
                    os.unlink(tmp_file.name)
        
        print_status("Could not find tessdata directory", "error")
        return False
        
    except Exception as e:
        print_status(f"Manual installation failed: {e}", "error")
        return False

def install_easyocr():
    """Install EasyOCR for better Hindi support"""
    print_status("Installing EasyOCR for enhanced Hindi recognition...", "info")
    
    try:
        # Check if already installed
        import easyocr
        print_status("EasyOCR is already installed", "success")
        return True
    except ImportError:
        pass
    
    if run_command("pip install easyocr", "Installing EasyOCR"):
        print_status("EasyOCR installed successfully!", "success")
        return True
    else:
        print_status("Failed to install EasyOCR", "error")
        return False

def test_hindi_ocr():
    """Test Hindi OCR capability"""
    print_status("Testing Hindi OCR capability...", "info")
    
    try:
        import pytesseract
        
        # Test if Hindi is available
        langs = check_tesseract_languages()
        if 'hin' in langs:
            print_status("Hindi language pack is available in Tesseract", "success")
        else:
            print_status("Hindi language pack not found in Tesseract", "warning")
        
        # Test EasyOCR
        try:
            import easyocr
            reader = easyocr.Reader(['hi', 'en'])
            print_status("EasyOCR with Hindi support is available", "success")
        except ImportError:
            print_status("EasyOCR is not available", "warning")
        except Exception as e:
            print_status(f"EasyOCR Hindi setup issue: {e}", "warning")
        
        return True
        
    except Exception as e:
        print_status(f"Testing failed: {e}", "error")
        return False

def main():
    """Main installation function"""
    print("\n" + "="*60)
    print("🇮🇳 Hindi Language Support Installation for OCR")
    print("="*60)
    
    # Check prerequisites
    if not check_tesseract():
        return False
    
    # Check current languages
    current_langs = check_tesseract_languages()
    if 'hin' in current_langs:
        print_status("Hindi language pack is already installed!", "success")
    else:
        # Install based on platform
        system = platform.system().lower()
        if system == "windows":
            success = install_hindi_windows()
        elif system == "darwin":
            success = install_hindi_macos()
        else:
            success = install_hindi_linux()
        
        if not success:
            print_status("Failed to install Hindi language pack", "error")
            return False
    
    # Install EasyOCR for better results
    install_easyocr()
    
    # Test the installation
    test_hindi_ocr()
    
    print("\n" + "="*60)
    print_status("Installation complete!", "success")
    print("\nNext steps:")
    print("1. Restart your OCR application")
    print("2. Try uploading a Hindi document")
    print("3. The system will automatically detect Hindi and use appropriate OCR")
    print("\nTips for better Hindi OCR:")
    print("• Use high-resolution, clear images")
    print("• Ensure good contrast between text and background")
    print("• Avoid skewed or rotated text")
    print("• Use standard Devanagari fonts when possible")
    print("="*60)
    
    return True

if __name__ == "__main__":
    main() 