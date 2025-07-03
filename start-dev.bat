
@echo off
ECHO.
ECHO ========================================================
ECHO  Starting OCR Legal Document Processor
ECHO ========================================================
ECHO.
ECHO This will open two new command prompt windows:
ECHO   1. Flask Backend Server
ECHO   2. React Frontend Server
ECHO.
ECHO To stop the application, simply close both of those new windows.
ECHO.

REM Start backend in a new window and keep it open
ECHO Starting Flask backend...
start "Flask Backend" cmd /k "cd backend && .\venv\Scripts\activate && flask run"

REM Start frontend in a new window and keep it open
ECHO Starting React frontend...
start "React Frontend" cmd /k "cd frontend && npm run dev"

ECHO.
ECHO Servers are starting up in new windows...
