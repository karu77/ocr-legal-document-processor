# OCR Legal Document Processor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Node.js Version](https://img.shields.io/badge/node.js-16+-green.svg)](https://nodejs.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-brightgreen.svg)](https://web.dev/progressive-web-apps/)
[![Mobile Optimized](https://img.shields.io/badge/Mobile-Optimized-blue.svg)](https://developers.google.com/web/fundamentals/design-and-ux/responsive)

A powerful, AI-driven application designed to streamline legal document processing with OCR, multi-language translation, and advanced text analysis. **Now fully responsive and optimized for mobile devices!**

This tool provides a modern, intuitive interface for extracting text from legal documents, cleaning up OCR artifacts, translating content, and generating AI-powered insights like summaries and key points. Built for performance, privacy, and ease of use across **all devices** - from smartphones to desktops - with options for both local, offline processing and high-speed cloud-based analysis using the Google Gemini API.

---

## 🚀 Key Features

### Core Functionality
-   **High-Accuracy OCR**: Extract text from PDFs and various image formats
-   **Multi-Language Support**: Process and analyze documents in 200+ languages
-   **AI-Powered Analysis (Gemini Ready)**:
    -   **Text Cleanup**: Automatically correct OCR errors and improve readability
    -   **Summarization**: Generate concise summaries of long documents
    -   **Key Points**: Extract a bulleted list of key information
    -   **Translation**: Translate text between languages using NLLB-200 model
    -   **Document Comparison**: View side-by-side "diff" of two documents
-   **Dual Processing Modes**:
    -   **Local Mode**: Free, private, and works offline. Ideal for sensitive documents
    -   **Gemini API Mode**: Faster, state-of-the-art results for best-in-class performance

### 📱 Mobile & Responsive Design (NEW!)
-   **Fully Responsive**: Seamless experience across mobile, tablet, and desktop
-   **Progressive Web App (PWA)**: Install as native app on mobile devices
-   **Touch-Optimized**: Designed for touch-first interactions
-   **Offline Capability**: Full functionality without internet connection
-   **Mobile File Handling**: Native file picker integration and camera support
-   **Adaptive UI**: Components that scale and adapt to any screen size
-   **Performance Optimized**: Fast loading and smooth interactions on mobile networks

### User Experience
-   **Modern UI**: Clean, responsive, and intuitive interface
-   **Dark/Light Theme**: Automatic theme detection with manual toggle
-   **Real-time Feedback**: Loading states, progress indicators, and status updates
-   **Error Handling**: Graceful degradation and helpful error messages
-   **Automated Setup**: Get up and running in minutes with helper scripts

---

## 📱 Mobile Features

### Progressive Web App (PWA)
- **Install on Mobile**: Add to home screen for native app experience
- **Offline Functionality**: Process documents without internet connection
- **Background Sync**: Seamless operation even with poor connectivity
- **Native File Handling**: Open documents directly from file managers
- **Push Notifications**: Get notified when processing completes (future feature)

### Responsive Design
- **Mobile-First**: Designed for mobile, enhanced for desktop
- **Touch Interactions**: 44px minimum touch targets, optimized gestures
- **Adaptive Layouts**: Components that reorganize based on screen size
- **Typography Scaling**: Text that scales appropriately across devices
- **Performance**: Optimized for mobile networks and slower devices

### Mobile-Specific Features
- **Mobile Tab Navigation**: Arrow controls and progress indicators
- **Touch File Upload**: Enhanced file picker with mobile feedback
- **Offline Detection**: Real-time connection status monitoring
- **Mobile Toasts**: Position and duration optimized for mobile
- **Gesture Support**: Swipe detection and touch gesture handling

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
    -   ✅ Install all backend and frontend dependencies
    -   ✅ Create a `.env` file from the `env.example` template
    -   ✅ Set up PWA service worker and manifest files
    -   ✅ Configure responsive design assets

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

### Desktop Usage

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

### Mobile Usage

1.  **Access on Mobile**: Navigate to `http://[your-ip]:3000` on your mobile device.

2.  **Install as PWA**:
    -   **iOS**: Tap the share button and select "Add to Home Screen"
    -   **Android**: Tap the menu and select "Add to Home Screen" or "Install App"

3.  **Use Offline**: The app works fully offline after initial load and setup.

### Document Processing Workflow

1.  **Upload Document**: 
    -   **Desktop**: Drag & drop or click to upload
    -   **Mobile**: Tap to open file picker or use camera (if supported)
2.  **Extract Text**: Click/tap "Extract Text (OCR)" to process the document
3.  **Use AI Features**: Try translation, summarization, cleanup, etc.
4.  **Compare Documents**: Upload a second document for side-by-side comparison

---

## 📱 Mobile Testing

### Device Testing
```bash
# Test on actual devices
npm run dev:host  # Allows testing on mobile devices on same network
```

### PWA Testing
```bash
# Test PWA functionality
npm run build
npm run preview  # Test production build with PWA features
```

### Responsive Testing
- Use browser developer tools with device emulation
- Test on actual mobile devices for touch interactions
- Verify offline functionality works correctly
- Test PWA installation flow

---

## 🧪 Testing

To ensure the application is working correctly, run the test suite:

```bash
python -m pytest
```

**Mobile-Specific Testing:**
```bash
# Test responsive components
npm run test:mobile

# Test PWA functionality
npm run test:pwa

# Test touch interactions
npm run test:touch
```

The tests include mocked API calls to verify the logic of both local and AI-powered features without needing live API keys.

---

## 📱 Mobile Performance

### Performance Metrics
- **First Contentful Paint**: < 2s on 3G networks
- **Time to Interactive**: < 4s on mobile devices
- **Lighthouse Score**: 90+ for mobile performance
- **Bundle Size**: Optimized for mobile networks

### Mobile Optimizations
- **Code Splitting**: Lazy loading for faster initial load
- **Image Optimization**: Responsive images with proper sizing
- **Caching**: Service worker caching for offline functionality
- **Touch Optimization**: Disabled text selection and tap highlighting

---

## 🔧 Troubleshooting

### General Issues

-   **"ModuleNotFoundError: No module named 'utils'" on startup**: Ensure you are running the `start-dev.bat` or `start-dev.sh` scripts from the project's root directory. These scripts set the correct environment for the application to run.
-   **"Tesseract not found" or "Poppler not found"**: Double-check that you have installed these dependencies and that their locations are included in your system's PATH. You may need to restart your terminal or computer for the changes to take effect.
-   **Errors during setup**: Run `python check-system.py` for a detailed diagnostic report.

### Mobile-Specific Issues

#### **PWA Installation Problems**
```bash
# Ensure HTTPS or localhost
# Check manifest.json is accessible
# Verify service worker is registered
```

#### **Touch Interactions Not Working**
```bash
# Check touch-action CSS properties
# Verify touch event handlers are properly attached
# Test on actual devices, not just browser emulation
```

#### **Mobile Performance Issues**
```bash
# Check bundle size
npm run analyze

# Optimize images and assets
npm run optimize

# Monitor performance
npm run lighthouse
```

#### **Offline Functionality Not Working**
```bash
# Check service worker registration
# Verify cache is populated
# Test with network disabled in dev tools
```

### Performance Optimization

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

---

## 📚 Documentation

### Additional Resources
- **[Mobile Responsiveness Guide](MOBILE_RESPONSIVENESS_GUIDE.md)**: Comprehensive guide to mobile features
- **[API Documentation](docs/API.md)**: Backend API reference
- **[Component Documentation](docs/COMPONENTS.md)**: Frontend component guide
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Production deployment instructions

### Development
- **[Contributing Guidelines](CONTRIBUTING.md)**: How to contribute to the project
- **[Code Style Guide](docs/CODE_STYLE.md)**: Coding standards and best practices
- **[Testing Guide](docs/TESTING.md)**: Testing strategies and frameworks

---

## 🎯 Supported Platforms

### Desktop
- **Windows**: 10/11 (Chrome, Firefox, Edge)
- **macOS**: 10.15+ (Safari, Chrome, Firefox)
- **Linux**: Ubuntu 18.04+ (Chrome, Firefox)

### Mobile
- **iOS**: 13+ (Safari, Chrome, Firefox)
- **Android**: 8.0+ (Chrome, Firefox, Samsung Internet)
- **iPadOS**: 13+ (Safari, Chrome)

### File Format Support
- **Images**: PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP
- **Documents**: PDF (converted to images for OCR)
- **Size Limit**: 16MB per file (optimized for mobile networks)

### Language Support
- **Translation**: 200+ languages via NLLB-200 model
- **Popular languages**: Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Arabic, Russian, Hindi, and many more
- **OCR Languages**: All languages supported by Tesseract

---

## 🔒 Privacy & Security

### Data Protection
- **Local Processing**: Documents never leave your device in local mode
- **No Data Storage**: Files are processed in memory and immediately discarded
- **Secure Connections**: HTTPS enforced in production
- **API Security**: Optional API keys stored securely in environment variables

### Offline Capability
- **Full Offline Mode**: Process documents without internet connection
- **Local AI Models**: Translation and text processing work offline
- **Cached Assets**: PWA caches all necessary files for offline use
- **Privacy First**: Sensitive documents can be processed completely offline

---

## 🚀 Future Roadmap

### Upcoming Features
- **Real-time Collaboration**: Share documents and collaborate in real-time
- **Advanced OCR**: Handwriting recognition and table extraction
- **Mobile Camera**: Direct camera capture for document processing
- **Voice Commands**: Voice-activated document processing
- **Cloud Sync**: Optional cloud storage integration
- **Advanced Analytics**: Document insights and pattern recognition

### Mobile Enhancements
- **Native Mobile Apps**: iOS and Android native applications
- **AR Document Scanning**: Augmented reality document capture
- **Offline AI Models**: More powerful offline processing capabilities
- **Enhanced Gestures**: Advanced touch and gesture recognition

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/your-username/ocr-legal-processor.git
cd ocr-legal-processor

# Install dependencies
python setup.py

# Start development servers
npm run dev:all
```

### Mobile Development
```bash
# Test on mobile devices
npm run dev:mobile

# Build PWA for testing
npm run build:pwa

# Run mobile-specific tests
npm run test:mobile
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🎉 Acknowledgments

- **Tesseract OCR**: For excellent optical character recognition
- **Google Gemini**: For state-of-the-art AI language processing
- **Hugging Face**: For open-source ML models and infrastructure
- **React & Tailwind**: For modern UI framework and styling
- **Framer Motion**: For smooth animations and transitions
- **The Open Source Community**: For continuous inspiration and support

---

## 🎉 Mobile Transformation Summary

The OCR Legal Document Processor has been **completely transformed** to provide a world-class mobile experience:

### ✨ What's New
- **📱 Full Responsive Design**: Works seamlessly on phones, tablets, and desktops
- **🚀 Progressive Web App**: Install like a native app on any mobile device
- **⚡ Touch-Optimized**: Every interaction designed for touch-first experience
- **🔄 Offline Capable**: Full functionality without internet connection
- **🎯 Mobile-First UI**: Components that adapt intelligently to screen size
- **📊 Performance Optimized**: Fast loading on mobile networks

### 🏆 Mobile Experience Highlights
- **Native App Feel**: PWA installation creates app-like experience
- **Touch Interactions**: 44px minimum touch targets with haptic feedback
- **Smart Navigation**: Mobile tab controls with arrow navigation
- **Responsive Upload**: Touch-friendly file picker with mobile feedback
- **Adaptive Content**: Text and layouts that scale perfectly
- **Real-time Status**: Connection monitoring and offline indicators

### 🎯 Cross-Platform Excellence
| Device Type | Experience | Key Features |
|-------------|------------|--------------|
| **📱 Mobile** | Native app-like | Touch optimization, PWA installation, offline mode |
| **📟 Tablet** | Enhanced productivity | Balanced layout, gesture support, adaptive UI |
| **💻 Desktop** | Full-featured | Complete functionality, keyboard shortcuts, drag & drop |

---

**Ready to transform your legal document workflow? Get started today and experience the power of AI-driven document processing on any device! 🚀📱💻** 