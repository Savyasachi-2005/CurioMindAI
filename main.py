# Allow `uvicorn main:app` by re-exporting the backend app
from backend.app.main import app  # noqa: F401
