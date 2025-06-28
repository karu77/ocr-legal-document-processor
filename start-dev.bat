@echo off
echo Starting OCR Legal Document Processor...
echo.

REM Check if .env file exists
if not exist .env (
    echo Error: .env file not found!
    echo Please copy env.example to .env and add your Gemini API key.
    pause
    exit /b
)

REM Start backend in new window
echo Starting Flask backend...
start cmd /k "cd backend && python app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting React frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Press any key to exit...
pause >nul 