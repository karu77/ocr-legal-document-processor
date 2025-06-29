@echo off
echo ========================================
echo  OCR Legal Document Processor
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo Error: .env file not found!
    echo Please run setup.py first.
    pause
    exit /b
)

REM Check if backend virtual environment exists
if not exist backend\venv (
    echo Error: Backend virtual environment not found!
    echo Please run setup.py first.
    pause
    exit /b
)

REM Check if frontend node_modules exists
if not exist frontend\node_modules (
    echo Error: Frontend dependencies not installed!
    echo Please run setup.py first.
    pause
    exit /b
)

echo Starting Flask backend...
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate && python app.py"

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo Starting React frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo ========================================
echo.
echo Press any key to exit...
pause >nul
