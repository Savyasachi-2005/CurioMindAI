from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import explain, notes
from .routers import export as export_router
from dotenv import load_dotenv

app = FastAPI(title="CurioMindAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
