import os
from typing import Optional, List
import json
import httpx


GEMINI_ENDPOINT = (
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
)


def _build_prompt(question: str, age: int, length: str) -> str:
    guides = {
        'Short': 'Keep it very brief (2-3 sentences).',
        'Medium': 'Keep it concise (1 short paragraph).',
        'Detailed': 'Give more detail (2 short paragraphs).',
    }
    return (
        f"Explain this to a child aged {age}.\n"
        f"Style: friendly, clear, simple words.\n"
        f"Length: {length}. {guides.get(length, '')}\n"
        f"Topic / Question: {question}"
    )


def _max_output_tokens(length: str) -> int:
    return {
        'Short': 180,
        'Medium': 400,
        'Detailed': 800,
    }.get(length, 400)


def generate_with_gemini(question: str, age: int, length: str) -> Optional[str]:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return None

    payload = {
        "contents": [
            {"parts": [{"text": _build_prompt(question, age, length)}]}
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "maxOutputTokens": _max_output_tokens(length),
        },
    }

    headers = {
        "Content-Type": "application/json",
        # Use header style as requested
        "X-goog-api-key": api_key,
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(GEMINI_ENDPOINT, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            # Parse response: candidates[0].content.parts[0].text
            candidates = data.get("candidates") or []
            if not candidates:
                return None
            content = candidates[0].get("content") or {}
            parts = content.get("parts") or []
            if not parts:
                return None
            text = parts[0].get("text")
            if not text:
                return None
            return text.strip()
    except Exception:
        return None


def translate_with_gemini(text: str, target_lang: str) -> Optional[str]:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return None

    prompt = (
        "Translate this explanation into the target language."
        " Keep the meaning and friendly tone, use simple words for children.\n"
        f"Target language code: {target_lang}\n"
        f"Text: {text}"
    )

    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": os.getenv('GEMINI_API_KEY', ''),
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(GEMINI_ENDPOINT, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            candidates = data.get("candidates") or []
            if not candidates:
                return None
            content = candidates[0].get("content") or {}
            parts = content.get("parts") or []
            if not parts:
                return None
            text = parts[0].get("text")
            if not text:
                return None
            return text.strip()
    except Exception:
        return None


def generate_related_with_gemini(question: str, age: int, length: str, target_lang: str) -> Optional[List[str]]:
    """Generate 3–5 contextually relevant follow-up questions as a JSON array of strings.

    Returns None on failure.
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return None

    prompt = (
    "You are helping a child learn. Based on the user's question, propose 3 to 5 "
    "contextually relevant follow-up questions the child might ask next.\n"
    f"User's question: {question}\n"
    f"Child age: {age}. Detail level requested: {length}.\n"
    "Requirements:\n"
    "- Each must be a natural question, curious and child-friendly.\n"
    "- Focus on deeper or related aspects of the SAME topic, not templates.\n"
    "- Do NOT repeat or rephrase the original question.\n"
    "- Ensure they explore connected ideas (history, importance, impact, examples).\n"
    "- No numbering, no explanations, no prose.\n"
    f"- Write them in language code: {target_lang}.\n"
    "Return EXACTLY a JSON array of strings with 3 to 5 items. No code fences."
    )


    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "maxOutputTokens": 200,
        },
    }

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": os.getenv('GEMINI_API_KEY', ''),
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(GEMINI_ENDPOINT, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            candidates = data.get("candidates") or []
            if not candidates:
                return None
            content = candidates[0].get("content") or {}
            parts = content.get("parts") or []
            if not parts:
                return None
            text = parts[0].get("text") or ""
            s = text.strip()
            # Try to parse a JSON array; if wrapped in code fences, extract content
            if '```' in s:
                # pick content between first and last fence
                segs = s.split('```')
                if len(segs) >= 3:
                    s = segs[1] if not segs[1].lower().startswith('json') else segs[2]
                s = s.strip()
            # Extract the first [...] block
            start = s.find('[')
            end = s.rfind(']')
            if start != -1 and end != -1 and end > start:
                s = s[start:end+1]
            arr: List[str] = []
            try:
                parsed = json.loads(s)
                if isinstance(parsed, list):
                    arr = [str(x).strip() for x in parsed if isinstance(x, (str, int, float))]
            except Exception:
                # fallback: extract question-like sentences ending with '?'
                import re
                qs = re.findall(r"([^\n?.!]{3,}?\?)", s)
                arr = [q.strip().strip('"\'`').strip() for q in qs]
            # Post-process
            uniq: List[str] = []
            for q in arr:
                q = q.strip()
                if not q:
                    continue
                if q not in uniq:
                    uniq.append(q)
            if not uniq:
                return None
            return uniq[:5]
    except Exception:
        return None
