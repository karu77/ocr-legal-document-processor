# OCR Legal Document Processor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Node.js Version](https://img.shields.io/badge/node.js-16+-green.svg)](https://nodejs.org/)

**A powerful, AI-driven application designed to streamline legal document processing with OCR, multi-language translation, and advanced text analysis.**

This tool provides a modern, intuitive interface for extracting text from legal documents, cleaning up OCR artifacts, translating content into over 50 languages, and generating AI-powered insights like summaries and key points. It's built for performance, privacy, and ease of use, with options for both local, offline processing and high-speed cloud-based analysis.

![Application Screenshot](https://user-images.githubusercontent.com/12345/67890.png) 
*Note: Add a real screenshot here after running the application.*

---

## 🚀 Key Features

-   **One-Click Setup**: Get started in minutes with a fully automated setup script.
-   **High-Accuracy OCR**: Extract text from PDFs and various image formats.
-   **Multi-Language Translation**: Translate documents to over 50 languages using local or cloud AI.
-   **AI-Powered Analysis**:
    -   **Text Cleanup**: Automatically correct OCR errors and improve readability.
    -   **Summarization**: Generate concise summaries of long documents.
    -   **Key Points**: Extract a bulleted list of key information.
    -   **Document Comparison**: View a side-by-side "diff" of two documents.
-   **Performance Optimized**:
    -   **GPU Acceleration**: Automatically uses NVIDIA GPUs for 10-20x faster processing.
    -   **CPU Fallback**: Runs smoothly on systems without a dedicated GPU.
    -   **Lazy Loading**: Optimized for fast startup and efficient memory usage.
-   **Privacy-Focused**: Run entirely on your local machine with `USE_LOCAL_NLP=true`. No data ever leaves your system.
-   **Modern UI**: A clean, responsive, and user-friendly interface with dark mode support.
-   **Comprehensive Automation**: Includes scripts for system checking, benchmarking, and automated setup.

---

## ⚡ Quick Start: One-Click Setup

Get the application running in under 2 minutes with our automated quick-start script.

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/karu77/ocr-legal-document-processor.git
    cd ocr-legal-document-processor
    ```

2.  **Run the Quick-Start Script**:
    ```bash
    python quick-start.py
    ```
    This script will:
    -   ✅ **Verify** system prerequisites (Python, Node.js, Tesseract).
    -   ✅ **Install** all backend and frontend dependencies.
    -   ✅ **Configure** your environment files.
    -   ✅ **Launch** both backend and frontend servers.
    -   ✅ **Open** the application in your default web browser.

---

## 📋 System Requirements

Before you begin, ensure you have the following installed:

-   **Python 3.8+**
-   **Node.js 16+**
-   **Tesseract OCR**: Required for text extraction.
    -   **Windows**: [Download and install from UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki). **Ensure you add it to your system's PATH.**
    -   **macOS**: `brew install tesseract`
    -   **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr`
-   **Poppler**: Required for PDF processing.
    -   **Windows**: [Download Poppler for Windows](https://github.com/oschwartz10612/poppler-windows/releases/), unzip, and add the `bin` directory to your PATH.
    -   **macOS**: `brew install poppler`
    -   **Ubuntu/Debian**: `sudo apt-get install poppler-utils`

*Our `check-system.py` script can validate these for you automatically.*

---

## 🛠️ Manual Setup

If you prefer to set up the project manually:

1.  **Environment Setup**:
    ```bash
    cp env.example .env 
    # Edit .env to choose between local NLP and Gemini API
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    python -m venv venv
    # On Windows: venv\Scripts\activate
    # On macOS/Linux: source venv/bin/activate
    pip install -r requirements.txt
    ```

3.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    ```

4.  **Run the Application**:
    -   **Windows**: `start-dev.bat`
    -   **macOS/Linux**: `chmod +x start-dev.sh && ./start-dev.sh`

The application will be available at `http://localhost:3000`.

---

## ⚙️ Configuration

### Local NLP vs. Gemini API

You can choose your AI processing engine by editing the `.env` file.

-   `USE_LOCAL_NLP=true` (Default)
    -   **Pros**: Free, private, works offline.
    -   **Cons**: Slower, requires more RAM/CPU resources. Recommended for privacy-sensitive tasks.

-   `USE_LOCAL_NLP=false`
    -   **Pros**: Extremely fast, state-of-the-art results.
    -   **Cons**: Requires a Google Gemini API key and sends data to Google.
    -   To use this, set `GEMINI_API_KEY=your_api_key_here` in your `.env` file.

### Performance Tuning

You can adjust text length limits and other performance settings in the `.env` file to balance speed and quality. For a deep dive, see our [**Performance Optimization Guide**](PERFORMANCE_GUIDE.md).

---

## 🔬 Included Utility Scripts

This project comes with several scripts to ensure a smooth experience.

-   **`check-system.py`**: A comprehensive diagnostic tool that validates your system dependencies, file integrity, and project configuration. Run it if you encounter any issues.
    ```bash
    python check-system.py
    ```

-   **`benchmark.py`**: Test your system's AI processing performance. This script provides a detailed analysis and recommendations based on your hardware.
    ```bash
    python benchmark.py
    ```

-   **`setup.py`**: An automated script that handles all setup tasks, including dependency installation and environment configuration. It's called by `quick-start.py` but can also be run standalone.
    ```bash
    python setup.py
    ```

---

## 🔧 Troubleshooting

-   **"Tesseract not found"**: Ensure Tesseract is installed and its location is in your system's PATH. Restart your terminal after making changes.
-   **"Poppler not found"**: Ensure Poppler is installed and its `bin` directory is in your system's PATH.
-   **Slow Performance**: See the [**Performance Guide**](PERFORMANCE_GUIDE.md) for optimization tips, including enabling GPU acceleration.
-   **Errors during setup**: Run `python check-system.py` for a detailed diagnostic report.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🚀 **Usage Guide**

### **Basic Workflow**
1. **Start the application**: Run `python quick-start.py` or use startup scripts
2. **Open browser**: Navigate to `http://localhost:3000`
3. **Upload document**: Drag & drop or click to upload PDF/image
4. **Extract text**: Click "Extract Text (OCR)" to process the document
5. **Use AI features**: Try translation, summarization, cleanup, etc.
6. **Compare documents**: Upload a second document for comparison

### **Supported File Formats**
- **Images**: PNG, JPG, JPEG, GIF, BMP, TIFF
- **Documents**: PDF (converted to images for OCR)
- **Size Limit**: 16MB per file

### **Language Support**
- **Translation**: 200+ languages via NLLB-200 model
- **Popular languages**: Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Arabic, Russian, Hindi, and many more

## 🔍 **Troubleshooting**

### **Common Issues**

#### **"Tesseract not found"**
```bash
# Windows: Download from UB Mannheim
# https://github.com/UB-Mannheim/tesseract/wiki

# macOS:
brew install tesseract

# Ubuntu/Debian:
sudo apt install tesseract-ocr
```

#### **Slow Performance**
```bash
# Check your system performance
python benchmark.py

# Optimize settings in .env
MAX_TEXT_LENGTH_TRANSLATION=2000
MAX_CHUNKS_PER_OPERATION=3

# Consider GPU acceleration or Gemini API
```

#### **Memory Issues**
```bash
# Reduce text processing limits
MAX_TEXT_LENGTH_CLEANUP=1500
MAX_TEXT_LENGTH_SUMMARY=2000

# Close other applications
# Consider upgrading RAM
```

#### **Port Conflicts**
```bash
# If ports 3000 or 5000 are in use:
# Kill existing processes or change ports in:
# - frontend/vite.config.js (frontend port)
# - backend/app.py (backend port)
```

### **Getting Help**
1. **Run diagnostics**: `python check-system.py`
2. **Check performance**: `python benchmark.py`
3. **Review logs**: Check terminal output for error messages
4. **Read guides**: See `PERFORMANCE_GUIDE.md` and `GETTING_STARTED.md`

## 📈 **Performance Optimization**

### **Quick Performance Wins**
1. **Enable GPU acceleration**: Install CUDA-compatible PyTorch
2. **Adjust text limits**: Reduce processing lengths in `.env`
3. **Use Gemini API**: For consistently fast processing
4. **Upgrade hardware**: More RAM and faster CPU/GPU

### **Detailed Optimization**
See `PERFORMANCE_GUIDE.md` for comprehensive optimization strategies including:
- Hardware recommendations
- Model-specific optimizations
- Memory management
- Troubleshooting guides

## 🏗️ **Architecture**

### **Backend (Python/Flask)**
- **OCR Processing**: Tesseract + pdf2image
- **AI Models**: Transformers (NLLB-200, DistilBART, DistilGPT2)
- **API Integration**: Google Gemini API support
- **File Handling**: Multi-format document processing

### **Frontend (React/Vite)**
- **Modern UI**: React with Tailwind CSS
- **File Upload**: Drag & drop with react-dropzone
- **Real-time Updates**: Progress tracking and notifications
- **Responsive Design**: Works on desktop and mobile

### **Project Structure**
```
ocrd/
├── backend/
│   ├── app.py                 # Flask application
│   ├── requirements.txt       # Python dependencies
│   └── utils/
│       ├── ocr_processor.py   # OCR functionality
│       └── gemini_client.py   # AI processing
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   └── components/       # UI components
│   ├── package.json          # Node.js dependencies
│   └── vite.config.js        # Build configuration
├── setup.py                  # Automated setup script
├── check-system.py           # System diagnostics
├── benchmark.py              # Performance testing
├── quick-start.py            # One-click launcher
└── start-dev.*               # Development servers
```

## 🚀 **Deployment**

### **Development**
```bash
python quick-start.py    # Local development with hot reload
```

### **Production**
```bash
# Build frontend
cd frontend && npm run build

# Start production backend
cd backend && python app.py

# Serve frontend (use nginx, apache, or similar)
```

### **Docker Deployment**
```dockerfile
# Dockerfile example (create as needed)
FROM python:3.9-slim
# Add your Docker configuration
```

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes and test**: `python check-system.py && python benchmark.py`
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

## 🙏 **Acknowledgments**

- **Tesseract OCR** for text extraction
- **Hugging Face Transformers** for AI models
- **Google Gemini** for fast AI processing
- **React & Vite** for the modern frontend
- **Flask** for the robust backend

## 📞 **Support**

- **📖 Documentation**: Check `GETTING_STARTED.md` and `PERFORMANCE_GUIDE.md`
- **🔧 Diagnostics**: Run `python check-system.py`
- **📊 Performance**: Run `python benchmark.py`
- **🐛 Issues**: Open an issue on GitHub
- **💬 Discussions**: Join our community discussions

---

**🎉 Ready to process your legal documents with AI? Run `python quick-start.py` and get started in seconds!** 