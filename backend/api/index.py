# Vercel Serverless Function entrypoint for FastAPI
import sys
import os

# Insert backend directory to path so app can be imported properly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
