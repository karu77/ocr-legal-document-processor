#!/bin/bash

echo "========================================"
echo "  OCR Legal Document Processor"
echo "========================================"
echo

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please run: python setup.py"
    exit 1
fi

# Check if backend virtual environment exists
if [ ! -d backend/venv ]; then
    echo "Error: Backend virtual environment not found!"
    echo "Please run: python setup.py"
    exit 1
fi

# Check if frontend node_modules exists
if [ ! -d frontend/node_modules ]; then
    echo "Error: Frontend dependencies not installed!"
    echo "Please run: python setup.py"
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
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Start frontend
echo "Starting React frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo "========================================"
echo "Both servers are running:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo "========================================"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for processes
wait
