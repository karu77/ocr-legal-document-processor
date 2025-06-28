# OCR Legal Document Processor

A comprehensive fullstack web application for processing multilingual legal documents using OCR, AI translation, and natural language processing. Features both cloud-based AI (Google Gemini) and local open-source NLP models for maximum flexibility and cost control.

## 🚀 Features

- **📄 OCR Text Extraction**: Extract text from PDF and image files using Tesseract OCR
- **🌍 AI-Powered Translation**: Translate documents to 15+ languages using Google Gemini API or local NLLB models
- **✨ Intelligent Text Cleanup**: Clean and format OCR-extracted text using AI with smart chunking for long documents
- **📋 Document Summarization**: Generate concise summaries of legal documents using local DistilBART or Gemini
- **🔗 Bullet Point Generation**: Create structured bullet points from document content
- **🔍 Document Comparison**: Compare two documents with AI-powered analysis and visual diff
- **🎨 Modern UI**: Responsive design built with React, Vite, and Tailwind CSS
- **⚡ Local NLP Support**: Use open-source models offline to avoid API costs and ensure privacy
- **🔄 Smart Text Chunking**: Handles long documents by intelligently splitting text at paragraph/sentence boundaries

## 🛠️ Tech Stack

### Backend
- **Flask** - Python web framework with CORS support
- **pytesseract** - OCR text extraction from images and PDFs
- **Google Gemini API** - Cloud-based AI for NLP tasks (optional)
- **🤗 Transformers** - Local open-source NLP models:
  - `facebook/nllb-200-distilled-600M` - Multilingual translation
  - `sshleifer/distilbart-cnn-12-6` - Text summarization
  - `distilgpt2` - Text generation and cleanup
- **Flask-CORS** - Cross-origin resource sharing
- **python-dotenv** - Environment variable management
- **pdf2image** - PDF to image conversion for OCR

### Frontend
- **React 18** - Modern UI framework with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **react-dropzone** - Drag-and-drop file upload interface
- **axios** - Promise-based HTTP client
- **Framer Motion** - Smooth animations and transitions

## 📋 Prerequisites

1. **Python 3.8+** - Recommended via [Anaconda](https://www.anaconda.com/products/individual)
2. **Node.js 16+** and npm/yarn
3. **Tesseract OCR**:
   - **Windows**: [Tesseract at UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki) (add to PATH)
   - **macOS**: `brew install tesseract`
   - **Ubuntu/Debian**: `sudo apt install tesseract-ocr`
4. **Poppler** (for PDF processing):
   - **Windows**: [Poppler for Windows](https://github.com/oschwartz10612/poppler-windows/releases) (add bin to PATH)
   - **macOS**: `brew install poppler`
   - **Ubuntu/Debian**: `sudo apt install poppler-utils`
5. **Google Gemini API key** (Optional) - From [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ocrd
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install PyTorch (choose based on your system)
# For CUDA GPU support:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
# For CPU only:
pip install torch torchvision torchaudio

# Optional: For improved GPU performance
pip install xformers  # Requires compatible GPU and CUDA PyTorch
```

### 3. Environment Configuration

Create `.env` file from template:

```bash
cp .env.example .env
```

Configure your environment:

```ini
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# NLP Model Configuration
# Set to 'true' for local models (free, private, offline)
# Set to 'false' for Google Gemini API (requires API key and billing)
USE_LOCAL_NLP=true

# Optional: Gemini API Key (only if USE_LOCAL_NLP=false)
# GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Frontend Setup

```bash
cd frontend
npm install
# or
yarn install
```

### 5. Run the Application

**Easy Start (Windows):**
```bash
.\start-dev.bat
```

**Easy Start (macOS/Linux):**
```bash
bash ./start-dev.sh
```

**Manual Start (Two terminals):**

Terminal 1 - Backend:
```bash
cd backend
python app.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

🌐 **Access the application:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## 🔧 Configuration Options

### Local NLP Models vs Gemini API

| Feature | Local Models | Gemini API |
|---------|-------------|------------|
| **Cost** | Free | Pay per request |
| **Privacy** | Fully private | Data sent to Google |
| **Internet** | Works offline | Requires internet |
| **Performance** | Depends on hardware | Consistently fast |
| **Setup** | Automatic download | API key required |

### Supported Languages

**Translation Support (15+ languages):**
- English, Spanish, French, German, Italian, Portuguese
- Hindi, Bengali, Tamil, Telugu, Gujarati, Marathi
- Punjabi, Urdu, Malayalam, Kannada, Assamese
- Chinese (Simplified/Traditional), Japanese, Korean
- Arabic, Russian, and more...

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### 🏥 Health Check
```http
GET /health
```

#### 📄 OCR Text Extraction
```http
POST /ocr
Content-Type: multipart/form-data

Body:
- file: PDF or image file (max 16MB)

Response:
{
  "success": true,
  "extracted_text": "Extracted text content...",
  "filename": "document.pdf"
}
```

#### 🌍 Text Translation
```http
POST /translate
Content-Type: application/json

Body:
{
  "text": "Text to translate",
  "target_language": "Spanish"
}

Response:
{
  "success": true,
  "translated_text": "Texto traducido...",
  "target_language": "Spanish"
}
```

#### ✨ Text Cleanup
```http
POST /cleanup
Content-Type: application/json

Body:
{
  "text": "Raw OCR text with errors..."
}

Response:
{
  "success": true,
  "cleaned_text": "Cleaned and formatted text..."
}
```

#### 📋 Text Summarization
```http
POST /summarize
Content-Type: application/json

Body:
{
  "text": "Long document text to summarize..."
}

Response:
{
  "success": true,
  "summary": "Concise summary of the document..."
}
```

#### 🔗 Bullet Point Generation
```http
POST /bullet_points
Content-Type: application/json

Body:
{
  "text": "Text to convert to bullet points..."
}

Response:
{
  "success": true,
  "bullet_points": "• Key point 1\n• Key point 2..."
}
```

#### 🔍 Document Comparison
```http
POST /compare
Content-Type: application/json

Body:
{
  "text1": "First document text",
  "text2": "Second document text"
}

Response:
{
  "success": true,
  "comparison": {
    "summary": "Analysis of differences...",
    "detailed_diff": "Unified diff output...",
    "html_diff": "HTML formatted diff...",
    "similarity_ratio": 0.85
  }
}
```

## 📁 Supported File Formats

- **Images**: PNG, JPG, JPEG, GIF, BMP, TIFF
- **Documents**: PDF (multi-page support)
- **File Size**: Maximum 16MB per file
- **Batch Processing**: Up to 2 files for comparison

## 🏗️ Project Structure

```
ocrd/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── requirements.txt          # Python dependencies
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── ocr_processor.py      # OCR functionality
│   │   └── gemini_client.py      # AI client (Gemini + local models)
│   └── venv/                     # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main React component
│   │   ├── main.jsx              # React entry point
│   │   ├── components/           # React components
│   │   │   ├── FileUpload.jsx
│   │   │   ├── LanguageSelector.jsx
│   │   │   ├── ActionButtons.jsx
│   │   │   ├── ResultsDisplay.jsx
│   │   │   ├── DocumentComparison.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   └── styles/
│   │       └── App.css           # Custom styles
│   ├── package.json              # Node.js dependencies
│   ├── vite.config.js            # Vite configuration
│   └── tailwind.config.js        # Tailwind CSS config
├── .env.example                  # Environment template
├── start-dev.bat                 # Windows dev script
├── start-dev.sh                  # Unix dev script
├── README.md                     # This file
└── SETUP_GUIDE.md               # Detailed setup guide
```

## 🔧 Development

### Adding New Features

1. **Backend**: Add routes in `app.py`, utilities in `utils/`
2. **Frontend**: Create components in `src/components/`
3. **API Integration**: Update API calls in `App.jsx`

### Code Quality

```bash
# Backend linting
cd backend
flake8 .

# Frontend linting
cd frontend
npm run lint
```

### Testing

```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
cd frontend
npm run test
```

## 🚀 Deployment

### Backend (Railway/Render/Heroku)

1. Create `Procfile`:
```
web: gunicorn app:app
```

2. Set environment variables:
```
USE_LOCAL_NLP=true
FLASK_ENV=production
FLASK_DEBUG=False
```

3. For Gemini API (optional):
```
USE_LOCAL_NLP=false
GEMINI_API_KEY=your_production_key
```

### Frontend (Vercel/Netlify)

1. Update API URL in `src/App.jsx`:
```javascript
const API_BASE_URL = 'https://your-backend-url.com'
```

2. Build and deploy:
```bash
npm run build
# Deploy dist/ folder
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **Tesseract OCR Issues**
```bash
# Verify installation
tesseract --version

# Windows: Add to PATH or specify in ocr_processor.py
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

#### 2. **Local NLP Model Loading**
- **First run**: Models download automatically (~2-3GB)
- **Memory issues**: Use CPU-only PyTorch for limited RAM
- **GPU issues**: Install CUDA-compatible PyTorch

#### 3. **CORS Errors**
```python
# backend/app.py
CORS(app, origins=['http://localhost:3000'])
```

#### 4. **File Upload Issues**
- Max size: 16MB
- Supported formats: PDF, PNG, JPG, JPEG, GIF, BMP, TIFF
- Check file permissions

#### 5. **Translation Errors**
- Verify target language is supported
- Check text chunking for very long documents
- Monitor memory usage with local models

### Performance Optimization

1. **OCR**: Use smaller images for faster processing
2. **NLP Models**: GPU acceleration with CUDA
3. **Memory**: Adjust chunk sizes for large documents
4. **API**: Implement request caching for repeated translations

### Error Debugging

Enable detailed logging:
```python
# backend/app.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

Check browser console for frontend errors.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

**Getting Help:**
1. Check this README and troubleshooting section
2. Review the [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
3. Search existing GitHub issues
4. Create a new issue with:
   - Operating system and versions
   - Error messages and logs
   - Steps to reproduce

**Common Support Topics:**
- OCR accuracy improvement
- Adding new languages
- Performance optimization
- Deployment configuration

## 📈 Changelog

### v1.2.0 (Latest)
- ✅ **Fixed**: Local NLP model integration with proper tokenizer access
- ✅ **Enhanced**: Smart text chunking for long documents
- ✅ **Added**: Comprehensive error handling and logging
- ✅ **Improved**: Language selector robustness
- ✅ **Updated**: Documentation and troubleshooting guide

### v1.1.0
- ✅ **Added**: Local NLP model support (NLLB, DistilBART, DistilGPT2)
- ✅ **Enhanced**: Multi-language translation capabilities
- ✅ **Fixed**: CORS configuration and endpoint routing
- ✅ **Improved**: UI responsiveness and error handling

### v1.0.0
- 🎉 **Initial Release**: Full OCR, translation, and comparison features
- 🎨 **UI**: React frontend with Tailwind CSS
- 🔧 **Backend**: Flask API with Gemini integration
- 📁 **Support**: Multiple file formats and languages

---

**Built with ❤️ for legal document processing**

*Need help? Check our [troubleshooting guide](#🐛-troubleshooting) or [create an issue](https://github.com/your-repo/issues).* 