#!/usr/bin/env python3
"""
Dedicated script to run the Flask backend server.
This avoids module import issues when using 'flask run' command.
"""

import sys
import os

# Add the current directory to Python path to ensure local imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Now import and run the Flask app
from app import app

if __name__ == '__main__':
    print("🚀 Starting OCR Legal Document Processor Backend...")
    print("📍 Backend will be available at: http://localhost:5000")
    print("🔗 API Health Check: http://localhost:5000/health")
    print("🌍 CORS enabled for frontend connection")
    print("-" * 50)
    
    # Run the Flask development server
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    ) 