# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
1. **Python 3.8+** and **Node.js 16+** installed
2. **Tesseract OCR** installed ([Download for Windows](https://github.com/UB-Mannheim/tesseract/wiki))
3. **Google Gemini API key** ([Get it here](https://aistudio.google.com/app/apikey))

### Setup Steps

#### 1. Environment Setup
```bash
# Copy environment file
cp env.example .env

# Edit .env and add your Gemini API key:
# GEMINI_API_KEY=your_actual_api_key_here
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
```

#### 4. Run the Application

**Option A: Use the startup scripts**
```bash
# Windows:
start-dev.bat

# macOS/Linux:
./start-dev.sh
```

**Option B: Manual startup**
```bash
# Terminal 1 - Backend:
cd backend
python app.py

# Terminal 2 - Frontend:
cd frontend
npm run dev
```

### 📱 Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 🧪 Test the Application
1. Upload a PDF or image file
2. Click "Extract Text (OCR)"
3. Try other features like translation, summarization, etc.

### 🆘 Common Issues

**Tesseract not found:**
- Windows: Make sure Tesseract is in your PATH
- macOS: `brew install tesseract`
- Linux: `sudo apt install tesseract-ocr`

**Gemini API errors:**
- Verify your API key in the `.env` file
- Check API quota limits

**CORS errors:**
- Make sure both servers are running
- Check the frontend is using the correct backend URL

### 📚 Next Steps
- Read the full [README.md](README.md) for detailed documentation
- Check the API endpoints for integration
- See deployment instructions for production setup 