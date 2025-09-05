from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import explain, notes
from .routers import export as export_router
from dotenv import load_dotenv

app = FastAPI(title="CurioMindAI API")

# CORS: allow explicit origins (wildcard cannot be used with credentials)
ALLOWED_ORIGINS = [
    "https://curio-mind-ai.vercel.app",  # Vercel production
    "http://localhost:5173",             # Vite dev
    "http://127.0.0.1:5173",
    "http://localhost:3000",             # alt dev ports
    "http://127.0.0.1:3000",
    "http://localhost:4173",             # Vite preview
    "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://curio-mind-ai-.*\\.vercel\\.app$",  # preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

@app.get("/ping")
async def ping():
    return {"status": "ok"}

app.include_router(explain.router)
app.include_router(notes.router)
app.include_router(export_router.router)
