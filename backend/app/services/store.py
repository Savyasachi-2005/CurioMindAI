from typing import List, Dict

# Very simple in-memory store for MVP
_notes: List[Dict[str, str]] = []

def add_note(question: str, explanation: str) -> None:
    _notes.append({"question": question, "explanation": explanation})

def get_notes() -> List[Dict[str, str]]:
    return list(_notes)

def clear_notes() -> None:
    _notes.clear()
