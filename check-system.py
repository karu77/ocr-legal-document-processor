#!/usr/bin/env python3
"""
OCR Legal Document Processor - System Checker
Comprehensive validation of all files, dependencies, and configurations.
"""

import os
import sys
import json
import subprocess
import platform
import ast
import re
from pathlib import Path
from typing import List, Dict, Tuple

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

class SystemChecker:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.info = []
        self.system = platform.system().lower()
        
    def print_header(self):
        print(f"{Colors.CYAN}{Colors.BOLD}")
        print("=" * 70)
        print("  OCR LEGAL DOCUMENT PROCESSOR - SYSTEM CHECKER")
        print("=" * 70)
        print(f"{Colors.END}")
        print(f"{Colors.WHITE}Checking all files, dependencies, and configurations...{Colors.END}\n")

    def check_python_syntax(self, file_path: str) -> bool:
        """Check Python file for syntax errors"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for syntax errors
            try:
                ast.parse(content)
                return True
            except SyntaxError as e:
                self.errors.append(f"Syntax error in {file_path}:{e.lineno}: {e.msg}")
                return False
                
        except Exception as e:
            self.errors.append(f"Could not read {file_path}: {e}")
            return False

    def check_javascript_syntax(self, file_path: str) -> bool:
        """Basic JavaScript/JSX syntax checking"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Basic checks for common issues
            issues = []
            
            # Check for unclosed brackets/parentheses
            brackets = {'(': ')', '[': ']', '{': '}'}
            stack = []
            for i, char in enumerate(content):
                if char in brackets:
                    stack.append((char, i))
                elif char in brackets.values():
                    if not stack:
                        issues.append(f"Unmatched closing '{char}' at position {i}")
                    else:
                        opener, _ = stack.pop()
                        if brackets[opener] != char:
                            issues.append(f"Mismatched bracket at position {i}")
            
            if stack:
                for opener, pos in stack:
                    issues.append(f"Unclosed '{opener}' at position {pos}")
            
            # Check for common JSX issues
            if file_path.endswith('.jsx'):
                if 'className=' not in content and 'class=' in content:
                    self.warnings.append(f"{file_path}: Use 'className' instead of 'class' in JSX")
                
                # Check for missing React import
                if 'import React' not in content and ('jsx' in content or '<' in content):
                    self.warnings.append(f"{file_path}: Missing React import for JSX")
            
            if issues:
                for issue in issues:
                    self.errors.append(f"{file_path}: {issue}")
                return False
            
            return True
            
        except Exception as e:
            self.errors.append(f"Could not read {file_path}: {e}")
            return False

    def check_json_syntax(self, file_path: str) -> bool:
        """Check JSON file for syntax errors"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                json.load(f)
            return True
        except json.JSONDecodeError as e:
            self.errors.append(f"JSON syntax error in {file_path}:{e.lineno}: {e.msg}")
            return False
        except Exception as e:
            self.errors.append(f"Could not read {file_path}: {e}")
            return False

    def check_backend_files(self):
        """Check all backend Python files"""
        print(f"{Colors.BLUE}🐍 Checking backend Python files...{Colors.END}")
        
        backend_files = [
            'backend/app.py',
            'backend/utils/__init__.py',
            'backend/utils/ocr_processor.py',
            'backend/utils/gemini_client.py'
        ]
        
        all_good = True
        for file_path in backend_files:
            if os.path.exists(file_path):
                if self.check_python_syntax(file_path):
                    print(f"{Colors.GREEN}  ✅ {file_path}{Colors.END}")
                else:
                    all_good = False
                    print(f"{Colors.RED}  ❌ {file_path}{Colors.END}")
            else:
                self.errors.append(f"Missing file: {file_path}")
                all_good = False
                print(f"{Colors.RED}  ❌ {file_path} (missing){Colors.END}")
        
        # Check requirements.txt
        req_file = 'backend/requirements.txt'
        if os.path.exists(req_file):
            print(f"{Colors.GREEN}  ✅ {req_file}{Colors.END}")
            self.check_requirements_file(req_file)
        else:
            self.errors.append(f"Missing file: {req_file}")
            print(f"{Colors.RED}  ❌ {req_file} (missing){Colors.END}")
        
        return all_good

    def check_requirements_file(self, file_path: str):
        """Check requirements.txt for common issues"""
        try:
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            required_packages = [
                'Flask', 'Flask-Cors', 'python-dotenv', 'pytesseract', 
                'pdf2image', 'requests', 'transformers', 'sentencepiece'
            ]
            
            found_packages = []
            for line in lines:
                line = line.strip()
                if line and not line.startswith('#'):
                    package_name = line.split('==')[0].split('>=')[0].split('<=')[0]
                    found_packages.append(package_name)
            
            missing = []
            for pkg in required_packages:
                if not any(pkg.lower() in found.lower() for found in found_packages):
                    missing.append(pkg)
            
            if missing:
                self.warnings.append(f"Missing packages in requirements.txt: {', '.join(missing)}")
            
        except Exception as e:
            self.warnings.append(f"Could not validate requirements.txt: {e}")

    def check_frontend_files(self):
        """Check all frontend files"""
        print(f"{Colors.BLUE}⚛️ Checking frontend files...{Colors.END}")
        
        # Check package.json
        package_json = 'frontend/package.json'
        if os.path.exists(package_json):
            if self.check_json_syntax(package_json):
                print(f"{Colors.GREEN}  ✅ {package_json}{Colors.END}")
                self.check_package_json(package_json)
            else:
                print(f"{Colors.RED}  ❌ {package_json}{Colors.END}")
        else:
            self.errors.append(f"Missing file: {package_json}")
            print(f"{Colors.RED}  ❌ {package_json} (missing){Colors.END}")
        
        # Check main React files
        react_files = [
            'frontend/src/App.jsx',
            'frontend/src/main.jsx',
            'frontend/src/components/FileUpload.jsx',
            'frontend/src/components/LanguageSelector.jsx',
            'frontend/src/components/ActionButtons.jsx',
            'frontend/src/components/ResultsDisplay.jsx',
            'frontend/src/components/LoadingSpinner.jsx',
            'frontend/src/components/DocumentComparison.jsx'
        ]
        
        all_good = True
        for file_path in react_files:
            if os.path.exists(file_path):
                if self.check_javascript_syntax(file_path):
                    print(f"{Colors.GREEN}  ✅ {file_path}{Colors.END}")
                else:
                    all_good = False
                    print(f"{Colors.RED}  ❌ {file_path}{Colors.END}")
            else:
                self.warnings.append(f"Missing file: {file_path}")
                print(f"{Colors.YELLOW}  ⚠️ {file_path} (missing){Colors.END}")
        
        # Check config files
        config_files = [
            'frontend/vite.config.js',
            'frontend/tailwind.config.js',
            'frontend/postcss.config.js'
        ]
        
        for file_path in config_files:
            if os.path.exists(file_path):
                if self.check_javascript_syntax(file_path):
                    print(f"{Colors.GREEN}  ✅ {file_path}{Colors.END}")
                else:
                    all_good = False
                    print(f"{Colors.RED}  ❌ {file_path}{Colors.END}")
            else:
                self.warnings.append(f"Missing config file: {file_path}")
                print(f"{Colors.YELLOW}  ⚠️ {file_path} (missing){Colors.END}")
        
        return all_good

    def check_package_json(self, file_path: str):
        """Check package.json for required dependencies"""
        try:
            with open(file_path, 'r') as f:
                package_data = json.load(f)
            
            required_deps = [
                'react', 'react-dom', 'axios', 'framer-motion', 
                'react-hot-toast', 'react-dropzone', 'tailwindcss'
            ]
            
            dependencies = package_data.get('dependencies', {})
            dev_dependencies = package_data.get('devDependencies', {})
            all_deps = {**dependencies, **dev_dependencies}
            
            missing = []
            for dep in required_deps:
                if dep not in all_deps:
                    missing.append(dep)
            
            if missing:
                self.warnings.append(f"Missing dependencies in package.json: {', '.join(missing)}")
            
        except Exception as e:
            self.warnings.append(f"Could not validate package.json: {e}")

    def check_environment_files(self):
        """Check environment configuration"""
        print(f"{Colors.BLUE}⚙️ Checking environment configuration...{Colors.END}")
        
        # Check env.example
        if os.path.exists('env.example'):
            print(f"{Colors.GREEN}  ✅ env.example{Colors.END}")
        else:
            self.warnings.append("Missing env.example file")
            print(f"{Colors.YELLOW}  ⚠️ env.example (missing){Colors.END}")
        
        # Check .env
        if os.path.exists('.env'):
            print(f"{Colors.GREEN}  ✅ .env{Colors.END}")
            self.validate_env_file('.env')
        else:
            self.info.append("No .env file found - will be created during setup")
            print(f"{Colors.CYAN}  ℹ️ .env (will be created){Colors.END}")

    def validate_env_file(self, file_path: str):
        """Validate .env file contents"""
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Check for required variables
            required_vars = ['USE_LOCAL_NLP', 'FLASK_ENV', 'FLASK_DEBUG']
            missing_vars = []
            
            for var in required_vars:
                if var not in content:
                    missing_vars.append(var)
            
            if missing_vars:
                self.warnings.append(f"Missing environment variables: {', '.join(missing_vars)}")
            
            # Check USE_LOCAL_NLP setting
            if 'USE_LOCAL_NLP=true' in content:
                self.info.append("Using local NLP models (free, private)")
            elif 'USE_LOCAL_NLP=false' in content:
                if 'GEMINI_API_KEY=' not in content or 'your_' in content:
                    self.warnings.append("Gemini API mode enabled but no valid API key found")
                else:
                    self.info.append("Using Gemini API (requires internet and billing)")
            
        except Exception as e:
            self.warnings.append(f"Could not validate .env file: {e}")

    def check_system_dependencies(self):
        """Check system-level dependencies"""
        print(f"{Colors.BLUE}🔧 Checking system dependencies...{Colors.END}")
        
        # Check Python
        version = sys.version_info
        if version.major >= 3 and version.minor >= 8:
            print(f"{Colors.GREEN}  ✅ Python {version.major}.{version.minor}.{version.micro}{Colors.END}")
        else:
            self.errors.append("Python 3.8+ required")
            print(f"{Colors.RED}  ❌ Python {version.major}.{version.minor}.{version.micro} (upgrade needed){Colors.END}")
        
        # Check Node.js
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                version = result.stdout.strip()
                print(f"{Colors.GREEN}  ✅ Node.js {version}{Colors.END}")
            else:
                self.errors.append("Node.js not found")
                print(f"{Colors.RED}  ❌ Node.js (not found){Colors.END}")
        except FileNotFoundError:
            self.errors.append("Node.js not installed")
            print(f"{Colors.RED}  ❌ Node.js (not installed){Colors.END}")
        
        # Check Tesseract
        try:
            result = subprocess.run(['tesseract', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                version_line = result.stdout.split('\n')[0]
                print(f"{Colors.GREEN}  ✅ {version_line}{Colors.END}")
            else:
                self.errors.append("Tesseract OCR not working")
                print(f"{Colors.RED}  ❌ Tesseract OCR (not working){Colors.END}")
        except FileNotFoundError:
            self.errors.append("Tesseract OCR not installed")
            print(f"{Colors.RED}  ❌ Tesseract OCR (not installed){Colors.END}")
        
        # Check Poppler (optional)
        try:
            result = subprocess.run(['pdftoppm', '-h'], capture_output=True, text=True)
            if result.returncode == 0 or 'pdftoppm' in result.stderr:
                print(f"{Colors.GREEN}  ✅ Poppler utilities{Colors.END}")
            else:
                self.warnings.append("Poppler not found (PDF processing may fail)")
                print(f"{Colors.YELLOW}  ⚠️ Poppler (not found){Colors.END}")
        except FileNotFoundError:
            self.warnings.append("Poppler not installed (PDF processing may fail)")
            print(f"{Colors.YELLOW}  ⚠️ Poppler (not installed){Colors.END}")

    def check_project_structure(self):
        """Check overall project structure"""
        print(f"{Colors.BLUE}📁 Checking project structure...{Colors.END}")
        
        required_dirs = [
            'backend',
            'backend/utils',
            'frontend',
            'frontend/src',
            'frontend/src/components',
            'frontend/src/styles'
        ]
        
        for dir_path in required_dirs:
            if os.path.exists(dir_path) and os.path.isdir(dir_path):
                print(f"{Colors.GREEN}  ✅ {dir_path}//{Colors.END}")
            else:
                self.errors.append(f"Missing directory: {dir_path}")
                print(f"{Colors.RED}  ❌ {dir_path}/ (missing){Colors.END}")
        
        # Check important files
        important_files = [
            'README.md',
            'start-dev.bat',
            'start-dev.sh',
            'LICENSE'
        ]
        
        for file_path in important_files:
            if os.path.exists(file_path):
                print(f"{Colors.GREEN}  ✅ {file_path}{Colors.END}")
            else:
                self.warnings.append(f"Missing file: {file_path}")
                print(f"{Colors.YELLOW}  ⚠️ {file_path} (missing){Colors.END}")

    def check_potential_issues(self):
        """Check for potential runtime issues"""
        print(f"{Colors.BLUE}🔍 Checking for potential issues...{Colors.END}")
        
        issues_found = False
        
        # Check for common port conflicts
        try:
            import socket
            
            # Test if ports are available
            for port, service in [(3000, "Frontend"), (5000, "Backend")]:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                result = sock.connect_ex(('localhost', port))
                if result == 0:
                    self.warnings.append(f"Port {port} is already in use ({service} may conflict)")
                    print(f"{Colors.YELLOW}  ⚠️ Port {port} in use{Colors.END}")
                    issues_found = True
                else:
                    print(f"{Colors.GREEN}  ✅ Port {port} available{Colors.END}")
                sock.close()
        except Exception as e:
            self.warnings.append(f"Could not check port availability: {e}")
        
        # Check disk space for model downloads
        try:
            import shutil
            free_space = shutil.disk_usage('.').free / (1024**3)  # GB
            if free_space < 5:
                self.warnings.append(f"Low disk space ({free_space:.1f}GB). NLP models need ~3GB.")
                print(f"{Colors.YELLOW}  ⚠️ Low disk space ({free_space:.1f}GB){Colors.END}")
                issues_found = True
            else:
                print(f"{Colors.GREEN}  ✅ Sufficient disk space ({free_space:.1f}GB){Colors.END}")
        except Exception as e:
            self.warnings.append(f"Could not check disk space: {e}")
        
        # Check memory
        try:
            import psutil
            memory = psutil.virtual_memory()
            total_gb = memory.total / (1024**3)
            if total_gb < 4:
                self.warnings.append(f"Low RAM ({total_gb:.1f}GB). Local NLP models may be slow.")
                print(f"{Colors.YELLOW}  ⚠️ Low RAM ({total_gb:.1f}GB){Colors.END}")
                issues_found = True
            else:
                print(f"{Colors.GREEN}  ✅ Sufficient RAM ({total_gb:.1f}GB){Colors.END}")
        except ImportError:
            self.info.append("Install 'psutil' for memory checking")
        except Exception as e:
            self.warnings.append(f"Could not check memory: {e}")
        
        if not issues_found:
            print(f"{Colors.GREEN}  ✅ No obvious issues detected{Colors.END}")

    def print_summary(self):
        """Print comprehensive summary"""
        print(f"\n{Colors.CYAN}{Colors.BOLD}")
        print("=" * 70)
        print("  SYSTEM CHECK SUMMARY")
        print("=" * 70)
        print(f"{Colors.END}")
        
        # Count issues
        total_issues = len(self.errors) + len(self.warnings)
        
        if self.errors:
            print(f"{Colors.RED}{Colors.BOLD}❌ CRITICAL ERRORS ({len(self.errors)}):{Colors.END}")
            for i, error in enumerate(self.errors, 1):
                print(f"{Colors.RED}  {i}. {error}{Colors.END}")
            print()
        
        if self.warnings:
            print(f"{Colors.YELLOW}{Colors.BOLD}⚠️ WARNINGS ({len(self.warnings)}):{Colors.END}")
            for i, warning in enumerate(self.warnings, 1):
                print(f"{Colors.YELLOW}  {i}. {warning}{Colors.END}")
            print()
        
        if self.info:
            print(f"{Colors.CYAN}{Colors.BOLD}ℹ️ INFORMATION ({len(self.info)}):{Colors.END}")
            for i, info in enumerate(self.info, 1):
                print(f"{Colors.CYAN}  {i}. {info}{Colors.END}")
            print()
        
        # Overall status
        if self.errors:
            print(f"{Colors.RED}{Colors.BOLD}❌ SYSTEM CHECK FAILED{Colors.END}")
            print(f"{Colors.RED}Please fix the critical errors before proceeding.{Colors.END}")
            print(f"{Colors.WHITE}Run: python setup.py to automatically fix most issues.{Colors.END}")
            return False
        elif self.warnings:
            print(f"{Colors.YELLOW}{Colors.BOLD}⚠️ SYSTEM CHECK PASSED WITH WARNINGS{Colors.END}")
            print(f"{Colors.YELLOW}The system should work, but consider addressing the warnings.{Colors.END}")
            print(f"{Colors.WHITE}Run: python setup.py to automatically fix most issues.{Colors.END}")
            return True
        else:
            print(f"{Colors.GREEN}{Colors.BOLD}✅ SYSTEM CHECK PASSED{Colors.END}")
            print(f"{Colors.GREEN}Everything looks good! You can start the application.{Colors.END}")
            if self.system == 'windows':
                print(f"{Colors.WHITE}Run: start-dev.bat{Colors.END}")
            else:
                print(f"{Colors.WHITE}Run: ./start-dev.sh{Colors.END}")
            return True

    def run_full_check(self):
        """Run all system checks"""
        self.print_header()
        
        checks = [
            self.check_system_dependencies,
            self.check_project_structure,
            self.check_environment_files,
            self.check_backend_files,
            self.check_frontend_files,
            self.check_potential_issues
        ]
        
        for check in checks:
            try:
                check()
                print()  # Add spacing
            except Exception as e:
                self.errors.append(f"Unexpected error in {check.__name__}: {e}")
                print(f"{Colors.RED}❌ Error in {check.__name__}: {e}{Colors.END}\n")
        
        return self.print_summary()

def main():
    """Main entry point"""
    checker = SystemChecker()
    success = checker.run_full_check()
    
    if not success and checker.errors:
        sys.exit(1)

if __name__ == "__main__":
    main() 