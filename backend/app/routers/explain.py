from fastapi import APIRouter
from ..models.schemas import ExplainRequest, ExplainResponse
from ..services.ai import generate_with_gemini, translate_with_gemini, generate_related_with_gemini

router = APIRouter()

@router.post("/explain", response_model=ExplainResponse)
def explain(req: ExplainRequest):
    # Try AI first; if not configured or fails, fallback to simple template
    ai_text = generate_with_gemini(req.question, req.age, req.length)
    if ai_text:
        answer_text = ai_text
        if req.language != 'en':
            t = translate_with_gemini(ai_text, req.language)
            if t:
                answer_text = t
        related = generate_related_with_gemini(req.question, req.age, req.length, req.language) or []
        return ExplainResponse(answer=answer_text, related=related[:5] if related else [])

    # Fallback simple templated answer (if AI for answer failed)
    age = req.age
    base = req.question.strip()
    length = req.length

    if age <= 7:
        tone = "like you're 5"
    elif age <= 12:
        tone = "like you're 10"
    else:
        tone = "like you're 15"

    detail = {
        'Short': 'in a tiny nutshell',
        'Medium': 'with a bit more detail',
        'Detailed': 'with lots of friendly detail',
    }[length]

    explanation = (
        f"Explaining {tone}, {detail}: "
        f"{base}. Think of it as a simple story with easy words and clear steps."
    )
    if req.language != 'en':
        t = translate_with_gemini(explanation, req.language)
        if t:
            explanation = t
    # Try AI-based related; if it fails, return empty list (no manual heuristics)
    related = generate_related_with_gemini(req.question, req.age, req.length, req.language) or []
    return ExplainResponse(answer=explanation, related=related)
