from pydantic import BaseModel, Field
from typing import List, Literal

LanguageCode = Literal['en','hi','kn','ta','te','ml','bn','gu','mr','ur']


class ExplainRequest(BaseModel):
    question: str = Field(..., min_length=1)
    age: int = Field(..., ge=5, le=18)
    length: Literal['Short', 'Medium', 'Detailed']
    language: LanguageCode = 'en'

class ExplainResponse(BaseModel):
    answer: str
    related: List[str]

class NoteAddRequest(BaseModel):
    question: str
    explanation: str

class Note(BaseModel):
    question: str
    explanation: str

class NotesPayload(BaseModel):
    notes: List[Note]
