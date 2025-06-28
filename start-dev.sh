#!/bin/bash

echo "Starting OCR Legal Document Processor..."
echo

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy env.example to .env and add your Gemini API key."
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    echo
    echo "Shutting down servers..."
    jobs -p | xargs -r kill
    exit 0
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Start backend
echo "Starting Flask backend..."
cd backend
source venv/bin/activate 2>/dev/null || echo "Virtual environment not found, using system Python"
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting React frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo "Both servers are running:"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for processes
wait 