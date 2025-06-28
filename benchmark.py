#!/usr/bin/env python3
"""
OCR Legal Document Processor - Performance Benchmark
Test your system's performance with various AI operations.
"""

import os
import sys
import time
import platform
import subprocess
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

class BenchmarkRunner:
    def __init__(self):
        self.system = platform.system().lower()
        self.results = {}
        
    def print_header(self):
        print(f"{Colors.PURPLE}{Colors.BOLD}")
        print("╔" + "═" * 68 + "╗")
        print("║" + " " * 68 + "║")
        print("║" + "  🚀 OCR LEGAL DOCUMENT PROCESSOR - BENCHMARK  🚀  ".center(68) + "║")
        print("║" + " " * 68 + "║")
        print("║" + "  Test your system's AI processing performance  ".center(68) + "║")
        print("║" + " " * 68 + "║")
        print("╚" + "═" * 68 + "╝")
        print(f"{Colors.END}\n")

    def check_system_info(self):
        """Display system information"""
        print(f"{Colors.CYAN}🖥️ System Information:{Colors.END}")
        
        # Basic system info
        print(f"  OS: {platform.system()} {platform.release()}")
        print(f"  Python: {sys.version.split()[0]}")
        print(f"  Architecture: {platform.machine()}")
        
        # CPU info
        try:
            import psutil
            cpu_count = psutil.cpu_count(logical=False)
            cpu_count_logical = psutil.cpu_count(logical=True)
            print(f"  CPU: {cpu_count} cores ({cpu_count_logical} threads)")
            
            # RAM info
            memory = psutil.virtual_memory()
            total_gb = memory.total / (1024**3)
            print(f"  RAM: {total_gb:.1f}GB")
        except ImportError:
            print(f"  {Colors.YELLOW}Install 'psutil' for detailed system info{Colors.END}")
        
        # GPU info
        try:
            import torch
            if torch.cuda.is_available():
                gpu_name = torch.cuda.get_device_name(0)
                gpu_memory = torch.cuda.get_device_properties(0).total_memory / (1024**3)
                print(f"  GPU: {gpu_name} ({gpu_memory:.1f}GB)")
                self.results['gpu_available'] = True
            else:
                print(f"  GPU: {Colors.YELLOW}No CUDA GPU detected{Colors.END}")
                self.results['gpu_available'] = False
        except ImportError:
            print(f"  GPU: {Colors.YELLOW}PyTorch not installed{Colors.END}")
            self.results['gpu_available'] = False
        
        print()

    def check_dependencies(self):
        """Check if all required dependencies are available"""
        print(f"{Colors.CYAN}📦 Checking Dependencies:{Colors.END}")
        
        dependencies = [
            ('Flask', 'flask'),
            ('Transformers', 'transformers'),
            ('PyTorch', 'torch'),
            ('Tesseract', 'pytesseract'),
            ('PIL', 'PIL'),
        ]
        
        missing = []
        for name, module in dependencies:
            try:
                __import__(module)
                print(f"  ✅ {name}")
            except ImportError:
                print(f"  ❌ {name} (missing)")
                missing.append(name)
        
        if missing:
            print(f"\n{Colors.RED}❌ Missing dependencies: {', '.join(missing)}{Colors.END}")
            print(f"{Colors.WHITE}Run: python setup.py to install dependencies{Colors.END}")
            return False
        
        print(f"  {Colors.GREEN}✅ All dependencies available{Colors.END}")
        print()
        return True

    def benchmark_model_loading(self):
        """Benchmark model loading times"""
        print(f"{Colors.CYAN}⏱️ Model Loading Benchmark:{Colors.END}")
        
        # Add backend to path
        sys.path.insert(0, 'backend')
        
        try:
            from utils.gemini_client import GeminiClient
            
            # Test model loading
            print(f"  Loading NLP models...")
            start_time = time.time()
            
            client = GeminiClient()
            
            load_time = time.time() - start_time
            print(f"  ✅ Model loading: {load_time:.2f}s")
            self.results['model_loading_time'] = load_time
            
            return client
            
        except Exception as e:
            print(f"  ❌ Model loading failed: {e}")
            self.results['model_loading_time'] = None
            return None

    def benchmark_operations(self, client):
        """Benchmark AI operations"""
        if not client:
            print(f"{Colors.RED}❌ Cannot benchmark operations - client not available{Colors.END}")
            return
        
        print(f"{Colors.CYAN}🧠 AI Operations Benchmark:{Colors.END}")
        
        # Test text (medium length for realistic testing)
        test_text = """
        This is a comprehensive test document for benchmarking the OCR Legal Document Processor.
        The system processes legal documents using advanced optical character recognition technology.
        It can extract text from PDFs and images, clean up OCR artifacts, translate content to multiple languages,
        generate summaries, create bullet points, and compare documents for differences.
        The application uses state-of-the-art AI models including NLLB for translation,
        DistilBART for summarization, and DistilGPT2 for text generation.
        Performance varies based on hardware configuration, with GPU acceleration providing
        significant speed improvements over CPU-only processing.
        """ * 3  # Make it longer for realistic testing
        
        operations = [
            ("Text Cleanup", lambda: client.cleanup_text(test_text)),
            ("Translation (Spanish)", lambda: client.translate_text(test_text, "Spanish")),
            ("Summarization", lambda: client.summarize_text(test_text)),
            ("Bullet Points", lambda: client.generate_bullet_points(test_text)),
        ]
        
        for name, operation in operations:
            print(f"  Testing {name}...")
            try:
                start_time = time.time()
                result = operation()
                end_time = time.time()
                duration = end_time - start_time
                
                # Check if result is valid
                if result and len(result.strip()) > 10:
                    print(f"  ✅ {name}: {duration:.2f}s")
                    self.results[name.lower().replace(' ', '_')] = duration
                else:
                    print(f"  ⚠️ {name}: {duration:.2f}s (empty result)")
                    self.results[name.lower().replace(' ', '_')] = duration
                    
            except Exception as e:
                print(f"  ❌ {name}: Failed - {str(e)[:50]}...")
                self.results[name.lower().replace(' ', '_')] = None
        
        print()

    def benchmark_ocr(self):
        """Benchmark OCR processing if test files are available"""
        print(f"{Colors.CYAN}👁️ OCR Benchmark:{Colors.END}")
        
        # Look for test files
        test_files = []
        for ext in ['*.pdf', '*.png', '*.jpg', '*.jpeg']:
            test_files.extend(Path('.').glob(ext))
        
        if not test_files:
            print(f"  {Colors.YELLOW}No test files found (*.pdf, *.png, *.jpg)${Colors.END}")
            print(f"  {Colors.YELLOW}Upload a test file to benchmark OCR${Colors.END}")
            return
        
        sys.path.insert(0, 'backend')
        
        try:
            from utils.ocr_processor import process_ocr
            
            test_file = test_files[0]
            print(f"  Testing OCR with: {test_file.name}")
            
            start_time = time.time()
            result = process_ocr(str(test_file), test_file.name)
            end_time = time.time()
            duration = end_time - start_time
            
            if result and not result.startswith("Error:"):
                char_count = len(result)
                print(f"  ✅ OCR: {duration:.2f}s ({char_count} characters)")
                self.results['ocr_time'] = duration
                self.results['ocr_chars'] = char_count
            else:
                print(f"  ❌ OCR failed: {result[:50]}...")
                self.results['ocr_time'] = None
                
        except Exception as e:
            print(f"  ❌ OCR benchmark failed: {e}")
            self.results['ocr_time'] = None
        
        print()

    def analyze_results(self):
        """Analyze and categorize performance results"""
        print(f"{Colors.CYAN}📊 Performance Analysis:{Colors.END}")
        
        # Performance categories
        def categorize_time(time_seconds, thresholds):
            if time_seconds is None:
                return "Failed", Colors.RED
            elif time_seconds <= thresholds[0]:
                return "Excellent", Colors.GREEN
            elif time_seconds <= thresholds[1]:
                return "Good", Colors.CYAN
            elif time_seconds <= thresholds[2]:
                return "Average", Colors.YELLOW
            else:
                return "Slow", Colors.RED
        
        # Define thresholds for different operations (excellent, good, average)
        thresholds = {
            'translation_(spanish)': (30, 60, 120),
            'text_cleanup': (20, 40, 80),
            'summarization': (15, 30, 60),
            'bullet_points': (15, 30, 60),
            'model_loading_time': (10, 30, 60),
            'ocr_time': (5, 15, 30)
        }
        
        for operation, time_taken in self.results.items():
            if operation in thresholds and time_taken is not None:
                category, color = categorize_time(time_taken, thresholds[operation])
                print(f"  {operation.replace('_', ' ').title()}: {color}{time_taken:.2f}s ({category}){Colors.END}")
        
        # Overall system assessment
        print(f"\n{Colors.CYAN}🎯 System Assessment:{Colors.END}")
        
        # Count performance levels
        excellent_count = 0
        good_count = 0
        average_count = 0
        slow_count = 0
        
        for operation, time_taken in self.results.items():
            if operation in thresholds and time_taken is not None:
                category, _ = categorize_time(time_taken, thresholds[operation])
                if category == "Excellent":
                    excellent_count += 1
                elif category == "Good":
                    good_count += 1
                elif category == "Average":
                    average_count += 1
                else:
                    slow_count += 1
        
        total_tests = excellent_count + good_count + average_count + slow_count
        
        if total_tests == 0:
            print(f"  {Colors.RED}❌ No successful operations to analyze{Colors.END}")
            return
        
        # Overall rating
        if excellent_count >= total_tests * 0.7:
            overall = "🚀 High Performance System"
            color = Colors.GREEN
            recommendation = "Your system is optimized for AI processing!"
        elif good_count + excellent_count >= total_tests * 0.6:
            overall = "⚡ Good Performance System"
            color = Colors.CYAN
            recommendation = "Consider GPU acceleration for better performance."
        elif average_count + good_count + excellent_count >= total_tests * 0.5:
            overall = "⚠️ Average Performance System"
            color = Colors.YELLOW
            recommendation = "Consider hardware upgrades or Gemini API for faster processing."
        else:
            overall = "🐌 Low Performance System"
            color = Colors.RED
            recommendation = "Recommend using Gemini API or upgrading hardware."
        
        print(f"  {color}{overall}{Colors.END}")
        print(f"  💡 {recommendation}")
        
        # GPU recommendation
        if not self.results.get('gpu_available', False):
            print(f"  🎮 Consider adding GPU acceleration for 10-20x speed improvement")
        
        print()

    def print_recommendations(self):
        """Print optimization recommendations"""
        print(f"{Colors.CYAN}💡 Optimization Recommendations:{Colors.END}")
        
        recommendations = []
        
        # GPU recommendations
        if not self.results.get('gpu_available', False):
            recommendations.append("🎮 Install CUDA-compatible GPU for 10-20x performance boost")
        
        # Performance-based recommendations
        slow_operations = []
        for operation, time_taken in self.results.items():
            if time_taken and time_taken > 60:  # Operations taking more than 1 minute
                slow_operations.append(operation.replace('_', ' ').title())
        
        if slow_operations:
            recommendations.append(f"⚡ Consider Gemini API for faster {', '.join(slow_operations)}")
        
        # Memory recommendations
        if self.results.get('model_loading_time', 0) > 30:
            recommendations.append("💾 Consider more RAM for faster model loading")
        
        # General recommendations
        recommendations.extend([
            "📖 Read PERFORMANCE_GUIDE.md for detailed optimization tips",
            "🔧 Adjust text length limits in .env for your use case",
            "🌐 Consider hybrid approach: local for development, API for production"
        ])
        
        for i, rec in enumerate(recommendations, 1):
            print(f"  {i}. {rec}")
        
        print()

    def print_summary(self):
        """Print benchmark summary"""
        print(f"{Colors.PURPLE}{Colors.BOLD}")
        print("╔" + "═" * 68 + "╗")
        print("║" + " " * 68 + "║")
        print("║" + "  🎉 BENCHMARK COMPLETED  🎉  ".center(68) + "║")
        print("║" + " " * 68 + "║")
        print("╚" + "═" * 68 + "╝")
        print(f"{Colors.END}")
        
        print(f"{Colors.WHITE}Your OCR Legal Document Processor performance profile:{Colors.END}\n")
        
        # Quick stats
        successful_ops = sum(1 for v in self.results.values() if v is not None and isinstance(v, (int, float)))
        total_ops = len([k for k in self.results.keys() if k.endswith('_time') or k in ['text_cleanup', 'translation_(spanish)', 'summarization', 'bullet_points']])
        
        print(f"{Colors.CYAN}📈 Results Summary:{Colors.END}")
        print(f"  ✅ Successful operations: {successful_ops}/{total_ops}")
        print(f"  🎮 GPU acceleration: {'Yes' if self.results.get('gpu_available') else 'No'}")
        
        if self.results.get('model_loading_time'):
            print(f"  ⏱️ Model loading: {self.results['model_loading_time']:.1f}s")
        
        print(f"\n{Colors.WHITE}Next steps:{Colors.END}")
        print(f"  1. Review recommendations above")
        print(f"  2. Check PERFORMANCE_GUIDE.md for optimization tips")
        print(f"  3. Test with your actual documents")
        print(f"  4. Consider GPU upgrade if needed")

    def run_benchmark(self):
        """Run the complete benchmark suite"""
        self.print_header()
        
        # System info
        self.check_system_info()
        
        # Dependencies check
        if not self.check_dependencies():
            return
        
        # Model loading benchmark
        client = self.benchmark_model_loading()
        
        # Operations benchmark
        if client:
            self.benchmark_operations(client)
        
        # OCR benchmark
        self.benchmark_ocr()
        
        # Analysis
        self.analyze_results()
        
        # Recommendations
        self.print_recommendations()
        
        # Summary
        self.print_summary()

def main():
    """Main entry point"""
    benchmark = BenchmarkRunner()
    
    print(f"{Colors.WHITE}This benchmark will test your system's AI processing performance.{Colors.END}")
    print(f"{Colors.WHITE}It may take several minutes to complete.{Colors.END}\n")
    
    try:
        input(f"{Colors.YELLOW}Press Enter to start the benchmark...{Colors.END}")
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}❌ Benchmark cancelled{Colors.END}")
        return
    
    print()
    benchmark.run_benchmark()

if __name__ == "__main__":
    main() 