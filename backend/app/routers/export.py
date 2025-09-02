from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from ..services.store import get_notes
from ..services.pdf import notes_to_pdf, notes_to_docx

router = APIRouter()

@router.get("/export")
async def export(format: str = Query("pdf", pattern="^(pdf|docx)$")):
    notes = get_notes()
    if format == 'pdf':
        buffer = notes_to_pdf(notes)
        return StreamingResponse(buffer, media_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=curiomindai-notes.pdf"
        })
    else:
        buffer = notes_to_docx(notes)
        return StreamingResponse(buffer, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={
            "Content-Disposition": "attachment; filename=curiomindai-notes.docx"
        })
