# 🔐 Authentication System Setup Guide

This guide will help you set up and use the new authentication system for the OCR Legal Document Processor.

## 🆕 New Features Added

### ✅ Complete Feature List:
1. **✅ Multilingual Support** - 50+ languages with advanced language selector
2. **✅ Document Scanning (OCR)** - Support for PDF and images using Tesseract
3. **✅ Language Translation** - Using Gemini API and local NLP models
4. **✅ AI Verification/Validation** - Text cleanup and enhancement
5. **✅ Document Comparison** - Side-by-side comparison with diff highlighting
6. **✅ Document Summary** - AI-powered text summarization
7. **✅ Bullet Points Conversion** - Extract key points from documents
8. **🆕 Login/Signup with MongoDB** - Complete user authentication system

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
python setup-auth.py
```

### Option 2: Manual Setup

#### Step 1: Install Dependencies
```bash
# Backend dependencies
pip install -r backend/requirements.txt

# Frontend dependencies
cd frontend
npm install
cd ..
```

#### Step 2: Setup MongoDB

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start the MongoDB service
3. Or use MongoDB Atlas (cloud) for easier setup

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Step 3: Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env file and update:
# - GEMINI_API_KEY=your_api_key_here
# - JWT_SECRET_KEY=your_super_secret_jwt_key
# - MONGODB_URI=mongodb://localhost:27017/
```

#### Step 4: Start the Application
```bash
# Windows
start-with-auth.bat

# Unix/Linux/macOS
./start-with-auth.sh
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with these variables:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
DB_NAME=ocr_legal_processor

# JWT Authentication
JWT_SECRET_KEY=your-super-secret-jwt-key

# Optional: Local NLP (free alternative to Gemini)
USE_LOCAL_NLP=false
```

### MongoDB Setup Options

#### Option 1: Local MongoDB
```bash
# Install MongoDB locally
# Windows: Download installer from mongodb.com
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath ./data/db
```

#### Option 2: MongoDB Atlas (Cloud)
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env` file

#### Option 3: Docker MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🎯 API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | User registration |
| `/auth/login` | POST | User login |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/profile` | GET | Get user profile |
| `/auth/profile` | PUT | Update user profile |

### Document Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/documents` | GET | Get user documents | ✅ |
| `/documents` | POST | Save processed document | ✅ |
| `/ocr` | POST | OCR processing | ❌ |
| `/translate` | POST | Text translation | ❌ |
| `/summarize` | POST | Text summarization | ❌ |

## 📱 Frontend Features

### New UI Components
- **Login Form** - Modern login interface
- **Signup Form** - User registration with password strength indicator
- **Navigation Bar** - User profile and authentication controls
- **Auth Modal** - Seamless login/signup experience

### User Experience
- **Persistent Login** - Stay logged in across sessions
- **Token Refresh** - Automatic token renewal
- **Document History** - View previously processed documents
- **Profile Management** - Update user information

## 🔒 Security Features

### Authentication
- **JWT Tokens** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Token Expiration** - Access tokens expire in 24 hours
- **Refresh Tokens** - Long-lived tokens for seamless experience

### Data Protection
- **User Isolation** - Each user can only access their own documents
- **Input Validation** - Server-side validation for all inputs
- **Error Handling** - Secure error messages without sensitive data

## 🧪 Testing the Authentication

### 1. User Registration
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword123",
    "full_name": "Test User"
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_username": "testuser",
    "password": "securepassword123"
  }'
```

### 3. Access Protected Endpoint
```bash
curl -X GET http://localhost:5000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎨 Frontend Usage

### 1. Access the Application
Open http://localhost:5173 in your browser

### 2. Sign Up
- Click "Sign In" button in the top navigation
- Switch to "Sign Up" tab
- Fill in your details (password strength indicator will guide you)
- Click "Create Account"

### 3. Sign In
- Enter your email/username and password
- Click "Sign In"
- You're now authenticated!

### 4. Use Features
- Upload documents and process them as before
- Your processed documents are now saved to your account
- Access your document history when logged in

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
pymongo.errors.ServerSelectionTimeoutError
```
**Solution:**
- Ensure MongoDB is running: `mongod --dbpath ./data/db`
- Check MongoDB URI in `.env` file
- For Windows: Make sure MongoDB service is started

#### Authentication Token Error
```
{"error": "Authentication token required"}
```
**Solution:**
- Make sure you're logged in
- Check if token has expired (refresh the page)
- Clear browser localStorage and login again

#### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Ensure backend is running on port 5000
- Check if Flask-CORS is installed: `pip install Flask-CORS`

#### Port Already in Use
```
OSError: [Errno 48] Address already in use
```
**Solution:**
- Kill existing processes: `pkill -f "python app.py"`
- Or use different ports in the configuration

### Debugging Tips

1. **Check Logs:**
   ```bash
   # Backend logs
   cd backend && python app.py
   
   # Frontend logs
   cd frontend && npm run dev
   ```

2. **Verify Database:**
   ```bash
   mongo
   use ocr_legal_processor
   db.users.find()
   ```

3. **Test API Directly:**
   Use Postman or curl to test endpoints directly

## 🚀 Production Deployment

### Security Checklist
- [ ] Change `JWT_SECRET_KEY` to a strong, random value
- [ ] Use HTTPS in production
- [ ] Set secure MongoDB credentials
- [ ] Enable MongoDB authentication
- [ ] Update CORS origins for your domain
- [ ] Set `FLASK_ENV=production`

### Environment Variables for Production
```env
FLASK_ENV=production
JWT_SECRET_KEY=your-super-long-random-secret-key-for-production
MONGODB_URI=mongodb://username:password@your-mongo-server:27017/ocr_legal_processor
CORS_ORIGINS=https://yourdomain.com
```

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/) - Learn about JWT tokens
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://reactjs.org/docs/)

## 🤝 Support

If you encounter any issues:

1. Check this guide thoroughly
2. Look at the error messages in browser console and terminal
3. Ensure all dependencies are installed correctly
4. Verify MongoDB is running and accessible

Happy document processing! 🎉 