# Re-export FastAPI app for uvicorn: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
from .app.main import app  # noqa: F401