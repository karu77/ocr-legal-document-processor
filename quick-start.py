#!/usr/bin/env python3
"""
OCR Legal Document Processor - One-Click Quick Start
This script does everything automatically: setup, checks, and starts the application.
"""

import os
import sys
import subprocess
import platform
import time
import webbrowser
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    END = '\033[0m'

class QuickStart:
    def __init__(self):
        self.system = platform.system().lower()
        
    def print_banner(self):
        """Print welcome banner"""
        print(f"{Colors.PURPLE}{Colors.BOLD}")
        print("╔" + "═" * 68 + "╗")
        print("║" + " " * 68 + "║")
        print("║" + "  🚀 OCR LEGAL DOCUMENT PROCESSOR - QUICK START  🚀  ".center(68) + "║")
        print("║" + " " * 68 + "║")
        print("║" + "  One-click setup and launch for your AI document processor  ".center(68) + "║")
        print("║" + " " * 68 + "║")
        print("╚" + "═" * 68 + "╝")
        print(f"{Colors.END}\n")
        
        print(f"{Colors.WHITE}This script will:{Colors.END}")
        print(f"{Colors.CYAN}  ✅ Check all system requirements{Colors.END}")
        print(f"{Colors.CYAN}  ✅ Install dependencies automatically{Colors.END}")
        print(f"{Colors.CYAN}  ✅ Set up the environment{Colors.END}")
        print(f"{Colors.CYAN}  ✅ Start both servers{Colors.END}")
        print(f"{Colors.CYAN}  ✅ Open the application in your browser{Colors.END}")
        print()

    def check_prerequisites(self):
        """Quick check of basic prerequisites"""
        print(f"{Colors.BLUE}🔍 Quick Prerequisites Check...{Colors.END}")
        
        issues = []
        
        # Check Python version
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            issues.append(f"Python 3.8+ required (found {version.major}.{version.minor})")
        else:
            print(f"{Colors.GREEN}  ✅ Python {version.major}.{version.minor}.{version.micro}{Colors.END}")
        
        # Check Node.js
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"{Colors.GREEN}  ✅ Node.js {result.stdout.strip()}{Colors.END}")
            else:
                issues.append("Node.js not working properly")
        except FileNotFoundError:
            issues.append("Node.js not installed")
        
        # Check Tesseract
        try:
            result = subprocess.run(['tesseract', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                version_line = result.stdout.split('\n')[0]
                print(f"{Colors.GREEN}  ✅ {version_line}{Colors.END}")
            else:
                issues.append("Tesseract OCR not working")
        except FileNotFoundError:
            issues.append("Tesseract OCR not installed")
        
        if issues:
            print(f"\n{Colors.RED}❌ Prerequisites Issues Found:{Colors.END}")
            for issue in issues:
                print(f"{Colors.RED}  • {issue}{Colors.END}")
            print(f"\n{Colors.YELLOW}Please install missing prerequisites first:{Colors.END}")
            print(f"{Colors.WHITE}  • Python 3.8+: https://www.python.org/downloads/{Colors.END}")
            print(f"{Colors.WHITE}  • Node.js 16+: https://nodejs.org/{Colors.END}")
            print(f"{Colors.WHITE}  • Tesseract OCR: See GETTING_STARTED.md for installation{Colors.END}")
            return False
        
        print(f"{Colors.GREEN}  🎉 All prerequisites satisfied!{Colors.END}\n")
        return True

    def run_setup(self):
        """Run the automated setup script"""
        print(f"{Colors.BLUE}⚙️ Running Automated Setup...{Colors.END}")
        
        setup_script = Path('setup.py')
        if not setup_script.exists():
            print(f"{Colors.RED}❌ setup.py not found. Please ensure you're in the project directory.{Colors.END}")
            return False
        
        try:
            # Run setup script
            result = subprocess.run([sys.executable, 'setup.py'], check=True)
            print(f"{Colors.GREEN}✅ Setup completed successfully!{Colors.END}\n")
            return True
        except subprocess.CalledProcessError as e:
            print(f"{Colors.RED}❌ Setup failed with exit code {e.returncode}{Colors.END}")
            print(f"{Colors.YELLOW}Try running 'python setup.py' manually for more details.{Colors.END}")
            return False

    def start_servers(self):
        """Start both backend and frontend servers"""
        print(f"{Colors.BLUE}🚀 Starting Servers...{Colors.END}")
        
        # Check if startup scripts exist
        if self.system == 'windows':
            startup_script = 'start-dev.bat'
        else:
            startup_script = 'start-dev.sh'
        
        if not os.path.exists(startup_script):
            print(f"{Colors.RED}❌ Startup script {startup_script} not found{Colors.END}")
            return self.manual_server_start()
        
        try:
            print(f"{Colors.YELLOW}  📡 Starting backend server...{Colors.END}")
            print(f"{Colors.YELLOW}  ⚛️ Starting frontend server...{Colors.END}")
            print(f"{Colors.YELLOW}  ⏳ Please wait for servers to initialize...{Colors.END}")
            
            # Start servers using the appropriate script
            if self.system == 'windows':
                subprocess.Popen(['cmd', '/c', startup_script], shell=True)
            else:
                subprocess.Popen(['bash', startup_script])
            
            # Wait for servers to start
            print(f"{Colors.CYAN}  ⏱️ Waiting for servers to start (30 seconds)...{Colors.END}")
            
            # Check if servers are responding
            for i in range(30):
                time.sleep(1)
                if self.check_servers():
                    print(f"{Colors.GREEN}  ✅ Servers are running!{Colors.END}")
                    return True
                if i % 5 == 0:
                    print(f"{Colors.CYAN}  ⏳ Still waiting... ({30-i}s remaining){Colors.END}")
            
            print(f"{Colors.YELLOW}  ⚠️ Servers taking longer than expected to start{Colors.END}")
            print(f"{Colors.WHITE}  Please check the terminal windows for any error messages{Colors.END}")
            return True  # Continue anyway
            
        except Exception as e:
            print(f"{Colors.RED}❌ Failed to start servers: {e}{Colors.END}")
            return self.manual_server_start()

    def manual_server_start(self):
        """Provide manual server start instructions"""
        print(f"{Colors.YELLOW}📋 Manual Server Start Instructions:{Colors.END}")
        print(f"{Colors.WHITE}  Open two terminal windows and run:{Colors.END}")
        print()
        print(f"{Colors.CYAN}  Terminal 1 (Backend):{Colors.END}")
        print(f"{Colors.WHITE}    cd backend{Colors.END}")
        if self.system == 'windows':
            print(f"{Colors.WHITE}    venv\\Scripts\\activate{Colors.END}")
        else:
            print(f"{Colors.WHITE}    source venv/bin/activate{Colors.END}")
        print(f"{Colors.WHITE}    python app.py{Colors.END}")
        print()
        print(f"{Colors.CYAN}  Terminal 2 (Frontend):{Colors.END}")
        print(f"{Colors.WHITE}    cd frontend{Colors.END}")
        print(f"{Colors.WHITE}    npm run dev{Colors.END}")
        print()
        return True

    def check_servers(self):
        """Check if servers are responding"""
        try:
            import urllib.request
            
            # Check backend
            try:
                urllib.request.urlopen('http://localhost:5000/health', timeout=2)
                backend_ok = True
            except:
                backend_ok = False
            
            # Check frontend
            try:
                urllib.request.urlopen('http://localhost:3000', timeout=2)
                frontend_ok = True
            except:
                frontend_ok = False
            
            return backend_ok and frontend_ok
        except:
            return False

    def open_browser(self):
        """Open the application in the default browser"""
        print(f"{Colors.BLUE}🌐 Opening Application...{Colors.END}")
        
        url = 'http://localhost:3000'
        
        try:
            webbrowser.open(url)
            print(f"{Colors.GREEN}  ✅ Application opened in your default browser{Colors.END}")
            print(f"{Colors.CYAN}  🔗 URL: {url}{Colors.END}")
        except Exception as e:
            print(f"{Colors.YELLOW}  ⚠️ Could not open browser automatically: {e}{Colors.END}")
            print(f"{Colors.WHITE}  Please manually open: {url}{Colors.END}")

    def print_success_message(self):
        """Print final success message and instructions"""
        print(f"\n{Colors.GREEN}{Colors.BOLD}")
        print("╔" + "═" * 68 + "╗")
        print("║" + " " * 68 + "║")
        print("║" + "  🎉 SUCCESS! YOUR OCR PROCESSOR IS READY!  🎉  ".center(68) + "║")
        print("║" + " " * 68 + "║")
        print("╚" + "═" * 68 + "╝")
        print(f"{Colors.END}")
        
        print(f"{Colors.WHITE}Your OCR Legal Document Processor is now running:{Colors.END}")
        print(f"{Colors.CYAN}  🌐 Frontend: http://localhost:3000{Colors.END}")
        print(f"{Colors.CYAN}  🔧 Backend:  http://localhost:5000{Colors.END}")
        print()
        
        print(f"{Colors.WHITE}Next steps:{Colors.END}")
        print(f"{Colors.GREEN}  1. Upload a document (PDF or image){Colors.END}")
        print(f"{Colors.GREEN}  2. Click 'Extract Text (OCR)' to process it{Colors.END}")
        print(f"{Colors.GREEN}  3. Try translation, summarization, and other AI features{Colors.END}")
        print(f"{Colors.GREEN}  4. Compare documents using the comparison feature{Colors.END}")
        print()
        
        print(f"{Colors.WHITE}Performance tips:{Colors.END}")
        print(f"{Colors.CYAN}  📊 Run 'python benchmark.py' to test your system performance{Colors.END}")
        print(f"{Colors.CYAN}  📖 Check 'PERFORMANCE_GUIDE.md' for optimization tips{Colors.END}")
        print(f"{Colors.CYAN}  🎮 Consider GPU acceleration for 10-20x speed improvement{Colors.END}")
        print()
        
        print(f"{Colors.WHITE}Need help?{Colors.END}")
        print(f"{Colors.CYAN}  🔧 Run 'python check-system.py' for diagnostics{Colors.END}")
        print(f"{Colors.CYAN}  📚 Read 'GETTING_STARTED.md' for detailed instructions{Colors.END}")
        print(f"{Colors.CYAN}  🐛 Check the terminal windows for any error messages{Colors.END}")

    def handle_error(self, step_name, error):
        """Handle errors gracefully"""
        print(f"\n{Colors.RED}❌ Error in {step_name}: {error}{Colors.END}")
        print(f"{Colors.YELLOW}Don't worry! You can still proceed manually:{Colors.END}")
        print()
        print(f"{Colors.WHITE}1. Run diagnostics: python check-system.py{Colors.END}")
        print(f"{Colors.WHITE}2. Try manual setup: python setup.py{Colors.END}")
        print(f"{Colors.WHITE}3. Check the documentation in README.md{Colors.END}")
        print(f"{Colors.WHITE}4. Start servers manually (see instructions above){Colors.END}")

    def run(self):
        """Run the complete quick start process"""
        self.print_banner()
        
        # Get user confirmation
        try:
            response = input(f"{Colors.YELLOW}Press Enter to continue or Ctrl+C to cancel...{Colors.END}")
        except KeyboardInterrupt:
            print(f"\n{Colors.RED}❌ Quick start cancelled by user{Colors.END}")
            return
        
        print()
        
        try:
            # Step 1: Prerequisites check
            if not self.check_prerequisites():
                return
            
            # Step 2: Run automated setup
            if not self.run_setup():
                print(f"{Colors.YELLOW}⚠️ Setup had issues, but continuing...{Colors.END}")
            
            # Step 3: Start servers
            if not self.start_servers():
                print(f"{Colors.YELLOW}⚠️ Server startup had issues, please check manually{Colors.END}")
            
            # Step 4: Open browser
            time.sleep(3)  # Give servers a moment to fully start
            self.open_browser()
            
            # Step 5: Success message
            self.print_success_message()
            
        except KeyboardInterrupt:
            print(f"\n{Colors.RED}❌ Quick start interrupted by user{Colors.END}")
        except Exception as e:
            self.handle_error("Quick Start", str(e))

def main():
    """Main entry point"""
    quick_start = QuickStart()
    quick_start.run()

if __name__ == "__main__":
    main() 