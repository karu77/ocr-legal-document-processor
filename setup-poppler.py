#!/usr/bin/env python3
"""
Poppler Setup Script for Windows
This script downloads and sets up Poppler binaries for PDF processing
"""

import os
import sys
import requests
import zipfile
import tempfile
from pathlib import Path

def download_poppler_windows():
    """Download and setup Poppler for Windows"""
    
    print("Setting up Poppler for PDF processing...")
    
    # Create poppler directory in the project
    project_root = Path(__file__).parent
    poppler_dir = project_root / "poppler"
    
    if poppler_dir.exists():
        print(f"✓ Poppler already exists at {poppler_dir}")
        return str(poppler_dir / "Library" / "bin")
    
    # Download URL for Poppler Windows binaries
    poppler_url = "https://github.com/oschwartz10612/poppler-windows/releases/download/v23.11.0-0/Release-23.11.0-0.zip"
    
    try:
        print("Downloading Poppler binaries...")
        response = requests.get(poppler_url, stream=True)
        response.raise_for_status()
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as tmp_file:
            total_size = int(response.headers.get('content-length', 0))
            downloaded = 0
            
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    tmp_file.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        print(f"\rProgress: {percent:.1f}%", end='', flush=True)
            
            print("\n✓ Download completed")
            
            # Extract the zip file
            print("Extracting Poppler...")
            with zipfile.ZipFile(tmp_file.name, 'r') as zip_ref:
                zip_ref.extractall(poppler_dir)
            
            print(f"✓ Poppler extracted to {poppler_dir}")
            
            # Clean up
            os.unlink(tmp_file.name)
            
            # Return the bin path
            bin_path = poppler_dir / "poppler-23.11.0" / "Library" / "bin"
            if not bin_path.exists():
                # Try alternative structure
                bin_path = poppler_dir / "Library" / "bin"
                if not bin_path.exists():
                    print("Warning: Could not find Poppler bin directory")
                    return None
            
            print(f"✓ Poppler setup complete: {bin_path}")
            return str(bin_path)
            
    except Exception as e:
        print(f"Error downloading Poppler: {e}")
        print("\nManual installation instructions:")
        print("1. Download Poppler from: https://github.com/oschwartz10612/poppler-windows/releases/")
        print("2. Extract to project/poppler directory")
        print("3. Ensure poppler/Library/bin contains pdftoppm.exe")
        return None

def update_path_for_poppler():
    """Update the system PATH to include Poppler"""
    
    project_root = Path(__file__).parent
    poppler_bin = project_root / "poppler" / "poppler-23.11.0" / "Library" / "bin"
    
    if not poppler_bin.exists():
        poppler_bin = project_root / "poppler" / "Library" / "bin"
    
    if poppler_bin.exists():
        poppler_bin_str = str(poppler_bin)
        current_path = os.environ.get('PATH', '')
        
        if poppler_bin_str not in current_path:
            os.environ['PATH'] = poppler_bin_str + os.pathsep + current_path
            print(f"✓ Added Poppler to PATH: {poppler_bin_str}")
        
        return True
    
    return False

def test_poppler():
    """Test if Poppler is working"""
    import subprocess
    
    try:
        result = subprocess.run(['pdftoppm', '-h'], 
                              capture_output=True, timeout=5)
        if result.returncode == 0:
            print("✓ Poppler is working correctly!")
            return True
        else:
            print("✗ Poppler test failed")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError):
        print("✗ Poppler not found in PATH")
        return False

if __name__ == "__main__":
    print("=== Poppler Setup for OCR Legal Document Processor ===\n")
    
    # First check if Poppler is already available
    if test_poppler():
        print("Poppler is already installed and working!")
        sys.exit(0)
    
    # Download and setup Poppler
    bin_path = download_poppler_windows()
    
    if bin_path:
        # Update PATH
        update_path_for_poppler()
        
        # Test again
        if test_poppler():
            print("\n✅ Poppler setup completed successfully!")
            print("\nYou can now process PDF files with OCR.")
            print("Note: You may need to restart your terminal/IDE to pick up the PATH changes.")
        else:
            print("\n⚠️ Poppler was installed but not detected in PATH")
            print(f"Manual PATH setup may be needed: {bin_path}")
    else:
        print("\n❌ Poppler setup failed")
        print("Please follow manual installation instructions above")
    
    input("\nPress Enter to continue...") 