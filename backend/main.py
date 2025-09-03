from app.main import app# re-export for uvicorn: `uvicorn main:app --reload --port 8000`
from fastapi import FastAPI
app=FastAPI(title="CurioMindAI API")