# OCR Legal Document Processor

A powerful AI-driven application for processing legal documents with OCR, translation, summarization, and document comparison capabilities.

## 🚀 **Quick Start (One-Click Setup)**

**New to this project? Get started in 30 seconds:**

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd ocrd

# 2. Run the automated setup and launch
python quick-start.py
```

That's it! The script will:
- ✅ Check all system requirements
- ✅ Install all dependencies automatically
- ✅ Set up the environment
- ✅ Start both servers
- ✅ Open the application in your browser

## 📋 **System Requirements**

**Minimum Requirements:**
- **Python 3.8+** (for backend AI processing)
- **Node.js 16+** (for frontend interface)
- **Tesseract OCR** (for text extraction)
- **8GB RAM** (for local AI models)
- **10GB free disk space** (for model downloads)

**Recommended for Best Performance:**
- **16GB+ RAM**
- **NVIDIA GPU** with CUDA support
- **SSD storage**
- **Multi-core CPU (8+ cores)**

## 🛠️ **Installation Methods**

### Method 1: Automated Setup (Recommended)
```bash
python setup.py    # Full automated setup
python quick-start.py    # Setup + launch in one go
```

### Method 2: Manual Setup
```bash
# Backend setup
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt

# Frontend setup  
cd ../frontend
npm install

# Start application
# Windows: start-dev.bat
# macOS/Linux: ./start-dev.sh
```

## 🎯 **Features**

### **Core Capabilities**
- **📄 OCR Processing**: Extract text from PDFs and images
- **🌍 Multi-Language Translation**: 200+ languages supported
- **📝 Text Cleanup**: Remove OCR artifacts and formatting issues
- **📊 Document Summarization**: Generate concise summaries
- **🔸 Bullet Point Generation**: Create structured bullet points
- **📋 Document Comparison**: Compare two documents with diff highlighting

### **AI Processing Options**
- **🏠 Local NLP Models** (Default): Free, private, offline processing
- **☁️ Google Gemini API**: Fast cloud-based processing (requires API key)

### **Performance Features**
- **🎮 GPU Acceleration**: 10-20x faster with CUDA support
- **⚡ Lazy Model Loading**: Fast startup times
- **🧠 Smart Text Chunking**: Optimized processing for large documents
- **📊 Progress Tracking**: Real-time processing updates

## 🔧 **Configuration**

### **Environment Setup**
The application uses a `.env` file for configuration:

```bash
# Copy the template
cp env.example .env

# Edit configuration (optional - works with defaults)
```

### **Key Settings**

#### **Local NLP (Default - Free)**
```bash
USE_LOCAL_NLP=true
# No API key needed - completely free and private
```

#### **Gemini API (Fast)**
```bash
USE_LOCAL_NLP=false
GEMINI_API_KEY=your_api_key_here
# Get key from: https://aistudio.google.com/app/apikey
```

#### **Performance Tuning**
```bash
# Adjust these based on your hardware:
MAX_TEXT_LENGTH_TRANSLATION=3000
MAX_TEXT_LENGTH_CLEANUP=2000
MAX_TEXT_LENGTH_SUMMARY=3000
MAX_TEXT_LENGTH_BULLETS=2000
MAX_CHUNKS_PER_OPERATION=5
```

## 📊 **Performance Comparison**

| Operation | Local CPU | Local GPU | Gemini API |
|-----------|-----------|-----------|------------|
| **Translation** | 1-3 min | 15-30 sec | 5-10 sec |
| **Summarization** | 30-60 sec | 10-15 sec | 3-5 sec |
| **Text Cleanup** | 45-90 sec | 15-20 sec | 5-8 sec |
| **Bullet Points** | 30-45 sec | 10-15 sec | 3-5 sec |

## 🧪 **Testing & Diagnostics**

### **System Health Check**
```bash
python check-system.py    # Comprehensive system validation
```

### **Performance Benchmark**
```bash
python benchmark.py    # Test your system's AI performance
```

### **Quick Validation**
```bash
# Check if everything is working
curl http://localhost:5000/health    # Backend health
curl http://localhost:3000    # Frontend accessibility
```

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

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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