@echo off
cls
ECHO.
ECHO ========================================================
ECHO  Starting OCR Legal Document Processor
ECHO ========================================================
ECHO.
ECHO This will open exactly TWO new command prompt windows:
ECHO   1. Flask Backend Server (Port 5000)
ECHO   2. React Frontend Server (Port 3000)
ECHO.
ECHO To stop the application, close both server windows.
ECHO.

REM Check if backend virtual environment exists
if not exist "backend\venv\Scripts\activate.bat" (
    ECHO ERROR: Backend virtual environment not found!
    ECHO Please run setup.py first to install dependencies.
    pause
    exit /b 1
)

REM Check if frontend dependencies exist
if not exist "frontend\node_modules" (
    ECHO ERROR: Frontend dependencies not found!
    ECHO Please run setup.py first to install dependencies.
    pause
    exit /b 1
)

REM Start backend server in new window
ECHO [1/2] Starting Flask backend server...
start "OCR Backend Server" /D "%~dp0backend" cmd /k "venv\Scripts\activate.bat && python run_backend.py"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend server in new window  
ECHO [2/2] Starting React frontend server...
start "OCR Frontend Server" /D "%~dp0frontend" cmd /k "npm run dev"

ECHO.
ECHO ========================================================
ECHO  Servers are starting in separate windows...
ECHO  
ECHO  Backend:  http://localhost:5000
ECHO  Frontend: http://localhost:3000
ECHO ========================================================
ECHO.
ECHO You can close this window now.
ECHO The servers will continue running in their own windows.
ECHO.
pause
