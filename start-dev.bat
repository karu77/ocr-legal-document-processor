@echo off
echo Starting OCR Legal Document Processor...

:: Start backend server
start cmd /k "cd backend && python app.py"

:: Wait for 2 seconds to let backend initialize
timeout /t 2 /nobreak > nul

:: Start frontend server
start cmd /k "cd frontend && npm run dev"

echo Servers started! Access the application at http://localhost:3001 