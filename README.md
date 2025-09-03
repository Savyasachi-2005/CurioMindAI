# CurioMindAI

## Backend (FastAPI)

- Entrypoint: `backend/main.py` (re-exports `app` from `backend/app/main.py`)
- Requirements: `backend/requirements.txt`

### Local dev

1. Create a virtualenv and install deps:

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r backend\requirements.txt
```

2. Run the API:

```powershell
uvicorn backend.main:app --reload --port 8000
```

API health: `http://localhost:8000/ping`

### Deploy on Render

Render detects `requirements.txt` at repo root. This repo includes a thin root file that points to backend requirements and a `render.yaml` for infra.

- Root `requirements.txt` includes: `-r backend/requirements.txt`
- Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/ping`

If you previously saw “Could not open requirements file: requirements.txt”, ensure the root `requirements.txt` exists (it does now) and that Render is using the repo root.

If Render tries `uvicorn main:app ...` and fails with "Could not import module 'main'", change the start to `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.

To customize Python version on Render, set env var `PYTHON_VERSION` (render.yaml pins 3.11.9). Locally you can use any 3.10–3.13, but 3.11 is recommended.

## Frontend (Vite + React)

- Located in `frontend/`
- Start in dev:

```powershell
cd frontend; npm install; npm run dev
```

In production, set `VITE_API_URL` to your backend base URL so fetches go to the right host.