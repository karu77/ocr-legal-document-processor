#!/usr/bin/env python3
"""
OCR Legal Document Processor - One-Click Quick Start
This script does everything automatically: setup, checks, and starts the application.
"""

import os
import sys
import platform
import subprocess
import time
import webbrowser
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('quickstart.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

class Colors:
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    WHITE = '\033[37m'
    END = '\033[0m'

def run_command(cmd, cwd=None):
    """Run a command and handle errors"""
    try:
        if platform.system().lower() == 'windows':
            result = subprocess.run(cmd, shell=True, cwd=cwd, text=True, capture_output=True)
        else:
            result = subprocess.run(cmd, shell=True, cwd=cwd, text=True, capture_output=True)
        
        if result.returncode != 0:
            print(f"{Colors.RED}Command failed with error: {result.stderr}{Colors.END}")
            return False
        return True
    except Exception as e:
        print(f"{Colors.RED}Error running command: {str(e)}{Colors.END}")
        return False

def setup_backend():
    """Set up the backend environment"""
    print(f"{Colors.BLUE}Setting up backend...{Colors.END}")
    
    # Create and activate virtual environment
    if not os.path.exists('backend/venv'):
        print(f"{Colors.WHITE}Creating virtual environment...{Colors.END}")
        if not run_command('python -m venv venv', cwd='backend'):
            return False
    
    # Install dependencies using the full path to pip
    print(f"{Colors.WHITE}Installing Python dependencies...{Colors.END}")
    if platform.system().lower() == 'windows':
        if not run_command('.\\venv\\Scripts\\python.exe -m pip install -r requirements.txt', cwd='backend'):
            return False
    else:
        if not run_command('./venv/bin/pip install -r requirements.txt', cwd='backend'):
            return False
    
    return True

def setup_frontend():
    """Set up the frontend environment"""
    print(f"{Colors.BLUE}Setting up frontend...{Colors.END}")
    
    print(f"{Colors.WHITE}Installing Node.js dependencies...{Colors.END}")
    if not run_command('npm install --yes', cwd='frontend'):
        return False
    
    return True

def start_servers():
    """Start both backend and frontend servers in separate processes"""
    print(f"{Colors.GREEN}Starting servers...{Colors.END}")
    
    # Start backend server in a separate process
    print(f"{Colors.WHITE}Starting backend server...{Colors.END}")
    if platform.system().lower() == 'windows':
        backend_cmd = '.\\venv\\Scripts\\python.exe run_backend.py'
        # Start in a new command prompt window
        backend_process = subprocess.Popen(
            f'start "OCR Backend Server" cmd /k "cd /d {os.path.abspath("backend")} && {backend_cmd}"',
            shell=True,
            cwd='backend'
        )
    else:
        backend_cmd = './venv/bin/python run_backend.py'
        backend_process = subprocess.Popen(
            backend_cmd,
            shell=True,
            cwd='backend'
        )
    
    # Give backend server time to start
    print(f"{Colors.WHITE}Waiting for backend server to start...{Colors.END}")
    time.sleep(5)
    
    # Start frontend server in a separate process
    print(f"{Colors.WHITE}Starting frontend server...{Colors.END}")
    if platform.system().lower() == 'windows':
        # Start in a new command prompt window
        frontend_process = subprocess.Popen(
            f'start "OCR Frontend Server" cmd /k "cd /d {os.path.abspath("frontend")} && npm run dev"',
            shell=True,
            cwd='frontend'
        )
    else:
        frontend_process = subprocess.Popen(
            'npm run dev',
            shell=True,
            cwd='frontend'
        )
    
    # Give frontend server time to start
    print(f"{Colors.WHITE}Waiting for frontend server to start...{Colors.END}")
    time.sleep(3)
    
    return True

def print_banner():
    """Print welcome banner"""
    print(f"{Colors.PURPLE}{Colors.BOLD}")
    print("╔" + "═" * 68 + "╗")
    print("║" + " " * 68 + "║")
    print("║" + "  >> OCR LEGAL DOCUMENT PROCESSOR - QUICK START <<  ".center(68) + "║")
    print("║" + " " * 68 + "║")
    print("║" + "  AI-powered document processing for ALL devices! 📱💻  ".center(68) + "║")
    print("║" + " " * 68 + "║")
    print("╚" + "═" * 68 + "╝")
    print(f"{Colors.END}\n")
    
    print(f"{Colors.GREEN}🎉 NOW WITH FULL MOBILE SUPPORT! 📱{Colors.END}")
    print(f"{Colors.CYAN}  ✨ Fully responsive design for phones, tablets & desktop{Colors.END}")
    print(f"{Colors.CYAN}  🚀 Progressive Web App (PWA) - install like a native app{Colors.END}")
    print(f"{Colors.CYAN}  ⚡ Touch-optimized interface with offline capability{Colors.END}")
    print()
    
    print(f"{Colors.WHITE}This script will:{Colors.END}")
    print(f"{Colors.CYAN}  [+] Check all system requirements{Colors.END}")
    print(f"{Colors.CYAN}  [+] Install dependencies automatically{Colors.END}")
    print(f"{Colors.CYAN}  [+] Set up PWA and mobile features{Colors.END}")
    print(f"{Colors.CYAN}  [+] Start both servers{Colors.END}")
    print(f"{Colors.CYAN}  [+] Open the application in your browser{Colors.END}")
    print()

def main():
    """Main entry point"""
    print_banner()
    
    if not setup_backend():
        print(f"{Colors.RED}[X] Backend setup failed{Colors.END}")
        sys.exit(1)
    
    if not setup_frontend():
        print(f"{Colors.RED}[X] Frontend setup failed{Colors.END}")
        sys.exit(1)
    
    if not start_servers():
        print(f"{Colors.RED}[X] Failed to start servers{Colors.END}")
        sys.exit(1)
    
    print(f"{Colors.GREEN}[+] Setup complete! The application is now running.{Colors.END}")
    print(f"{Colors.WHITE}Frontend: http://localhost:3000{Colors.END}")
    print(f"{Colors.WHITE}Backend: http://localhost:5000{Colors.END}")
    print()
    print(f"{Colors.GREEN}📱 MOBILE ACCESS:{Colors.END}")
    print(f"{Colors.CYAN}  • Desktop: http://localhost:3000{Colors.END}")
    print(f"{Colors.CYAN}  • Mobile: http://[your-ip]:3000 (find your IP in network settings){Colors.END}")
    print(f"{Colors.CYAN}  • PWA: Use 'Add to Home Screen' for native app experience{Colors.END}")
    print()
    print(f"{Colors.YELLOW}[!] Two new command prompt windows have been opened for the servers.{Colors.END}")
    print(f"{Colors.YELLOW}[!] To stop the application, close both server windows.{Colors.END}")
    print()
    print(f"{Colors.WHITE}Opening application in your browser...{Colors.END}")
    
    # Wait a bit more for servers to fully start, then open browser
    time.sleep(5)
    try:
        webbrowser.open('http://localhost:3000')
    except:
        print(f"{Colors.YELLOW}[!] Could not open browser automatically. Please visit: http://localhost:3000{Colors.END}")

if __name__ == '__main__':
    main() 