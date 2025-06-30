# OCR Legal Document Processor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Node.js Version](https://img.shields.io/badge/node.js-16+-green.svg)](https://nodejs.org/)

A powerful, AI-driven application designed to streamline legal document processing with OCR, multi-language translation, and advanced text analysis.

This tool provides a modern, intuitive interface for extracting text from legal documents, cleaning up OCR artifacts, translating content, and generating AI-powered insights like summaries and key points. It's built for performance, privacy, and ease of use, with options for both local, offline processing and high-speed cloud-based analysis using the Google Gemini API.

---

## 🚀 Key Features

-   **High-Accuracy OCR**: Extract text from PDFs and various image formats.
-   **Multi-Language Support**: Process and analyze documents in any language.
-   **AI-Powered Analysis (Gemini Ready)**:
    -   **Text Cleanup**: Automatically correct OCR errors and improve readability.
    -   **Summarization**: Generate concise summaries of long documents.
    -   **Key Points**: Extract a bulleted list of key information.
    -   **Translation**: Translate text between languages.
    -   **Document Comparison**: View a side-by-side "diff" of two documents.
-   **Dual Processing Modes**:
    -   **Local Mode**: Free, private, and works offline. Ideal for sensitive documents.
    -   **Gemini API Mode**: Faster, state-of-the-art results for best-in-class performance.
-   **User-Friendly Interface**: A clean, responsive, and modern UI.
-   **Automated Setup**: Get up and running in minutes with helper scripts.

---

## 📋 Installation

### Prerequisites

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

### Automated Setup (Recommended)

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Run the Setup Script**:
    ```bash
    python setup.py
    ```
    This script will:
    -   ✅ Install all backend and frontend dependencies.
    -   ✅ Create a `.env` file from the `env.example` template.

---

## ⚙️ Configuration

After installation, configure your environment by editing the `.env` file.

1.  **Choose your AI Engine**:
    -   `USE_LOCAL_NLP=true`: Uses local, offline processing. Free and private. (Default)
    -   `USE_LOCAL_NLP=false`: Uses the Google Gemini API for the highest quality results.

2.  **Add API Keys (if using AI services)**:
    -   To enable Gemini, set `USE_LOCAL_NLP=false` and add your key:
        ```
        GEMINI_API_KEY=your_gemini_api_key_here
        ```
    -   To enable high-quality translations with Hugging Face, add your token:
        ```
        HUGGINGFACE_API_TOKEN=your_huggingface_api_token_here
        ```

---

## ▶️ Usage

1.  **Start the Application**:
    -   **Windows**:
        ```bash
        .\start-dev.bat
        ```
    -   **macOS/Linux**:
        ```bash
        chmod +x start-dev.sh
        ./start-dev.sh
        ```
    This will start the backend server on port 5000 and the frontend on port 3000.

2.  **Open in Browser**: Navigate to `http://localhost:3000`.

3.  **Process Documents**:
    -   Upload a document (PDF, PNG, JPG, etc.).
    -   Click **"Extract Text"** to perform OCR.
    -   Use the other buttons to clean, summarize, translate, or get key points from the extracted text.

---

## 🧪 Testing

To ensure the application is working correctly, run the test suite:

```bash
python -m pytest
```

The tests include mocked API calls to verify the logic of both local and AI-powered features without needing live API keys.

---

## 🔧 Troubleshooting

-   **"ModuleNotFoundError: No module named 'utils'" on startup**: Ensure you are running the `start-dev.bat` or `start-dev.sh` scripts from the project's root directory. These scripts set the correct environment for the application to run.
-   **"Tesseract not found" or "Poppler not found"**: Double-check that you have installed these dependencies and that their locations are included in your system's PATH. You may need to restart your terminal or computer for the changes to take effect.
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