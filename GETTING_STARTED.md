# Getting Started - OCR Legal Document Processor

Welcome! This guide will get you up and running in just a few minutes.

## 🚀 One-Click Setup (Recommended)

The easiest way to get started is with our automated setup:

```bash
# Clone the repository
git clone <repository-url>
cd ocrd

# Run the one-click setup and launch
python quick-start.py
```

This script will:
- ✅ Check all system requirements
- ✅ Install all dependencies automatically  
- ✅ Set up the environment
- ✅ Start both servers
- ✅ Open the application in your browser

## 📋 Prerequisites

Before running the setup, make sure you have:

1. **Python 3.8+** - [Download here](https://www.python.org/downloads/)
2. **Node.js 16+** - [Download here](https://nodejs.org/)
3. **Tesseract OCR** - [Installation guide](#tesseract-installation)

### Tesseract Installation

#### Windows
1. Download from [UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
2. Install and add to PATH

#### macOS
```bash
brew install tesseract
```

#### Ubuntu/Debian
```bash
sudo apt install tesseract-ocr
```

## 🛠️ Manual Setup (Alternative)

If you prefer manual setup:

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env file (optional - works with defaults)
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start the Application
```bash
# Windows:
start-dev.bat

# macOS/Linux:
./start-dev.sh
```

## 🎯 First Use

1. **Open your browser** to `http://localhost:3000`
2. **Upload a document** (PDF or image)
3. **Click "Extract Text (OCR)"** to extract text
4. **Try other features** like translation, summarization, etc.

## 💡 Configuration Options

### Local NLP vs Gemini API

**Local NLP (Default - Free)**
- ✅ Completely free and private
- ✅ Works offline
- ⚠️ Slower processing (1-3 minutes)
- ⚠️ Requires 8GB+ RAM

**Gemini API (Fast)**
- ✅ Very fast (5-10 seconds)
- ✅ Consistent performance  
- ⚠️ Requires API key and billing
- ⚠️ Sends data to Google

To switch to Gemini API:
1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Edit `.env`: Set `USE_LOCAL_NLP=false`
3. Add your API key: `GEMINI_API_KEY=your_key_here`

## 🔧 Troubleshooting

### Common Issues

**"Tesseract not found"**
- Install Tesseract OCR and add to PATH
- Restart terminal after installation

**"Node.js not found"**
- Install Node.js 16+ from nodejs.org
- Restart terminal after installation

**"Python version too old"**
- Install Python 3.8+ from python.org
- Use `python3` command if needed

**Slow performance**
- Check [Performance Guide](PERFORMANCE_GUIDE.md)
- Consider GPU acceleration or Gemini API

### Getting Help

1. **Run diagnostics**: `python check-system.py`
2. **Check the logs** in terminal for error messages
3. **Read the full documentation** in [README.md](README.md)
4. **Review troubleshooting** in the main documentation

## 📚 Next Steps

- **Explore Features**: Try all the AI-powered tools
- **Optimize Performance**: Read the [Performance Guide](PERFORMANCE_GUIDE.md)
- **Customize Settings**: Edit `.env` for your needs
- **Deploy**: Check deployment instructions in README.md

## 🎉 You're Ready!

Your OCR Legal Document Processor is now ready to use. Upload a document and start exploring the AI-powered features!

---

**Need more help?** Check the comprehensive [README.md](README.md) or run `python check-system.py` for detailed diagnostics. 