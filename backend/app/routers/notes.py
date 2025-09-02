from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from typing import List
from ..models.schemas import NoteAddRequest, Note
from ..services.store import add_note, get_notes
from ..services.pdf import notes_to_pdf

router = APIRouter()

@router.post("/notes/add")
def notes_add(req: NoteAddRequest):
    add_note(req.question, req.explanation)
    return {"status": "added"}

@router.get("/notes", response_model=List[Note])
def notes_list():
    return get_notes()

@router.get("/notes/pdf")
async def notes_pdf():
    buffer = notes_to_pdf(get_notes())
    return StreamingResponse(buffer, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=curiomindai-notes.pdf"
    })
