"""Stable keys and sanity checks for lesson enrichment merge."""

from __future__ import annotations

import re
from typing import Any

_WORD_RE = re.compile(r"[a-z0-9]+")


def normalize_lesson_title(title: str) -> str:
    t = (title or "").lower()
    t = re.sub(r"\*\(optional\)\*\s*", "", t, flags=re.I)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def lesson_stable_key(row: dict) -> str:
    course = row.get("course", "")
    url = (row.get("url") or "").strip().lower()
    title = normalize_lesson_title(row.get("lesson") or "")
    section = (row.get("section") or "syllabus").lower()
    if url.startswith("http"):
        return f"c{course}|u|{url}"
    return f"c{course}|t|{title}|{section}"


def token_set(text: str) -> set[str]:
    return {w for w in _WORD_RE.findall((text or "").lower()) if len(w) > 2}


def digest_matches_lesson(lesson: dict, digest: dict) -> bool:
    if not digest:
        return False
    title = lesson.get("lesson") or ""
    url = (lesson.get("url") or "").lower()
    d_title = (digest.get("title") or "").lower()

    # URL-strong signals
    if "litellm" in url or "litellm" in normalize_lesson_title(title):
        return "litellm" in d_title or "gateway" in d_title
    if "instructor" in url or "instructor" in normalize_lesson_title(title):
        return "instructor" in d_title
    if "pydantic" in url or "pydantic" in normalize_lesson_title(title):
        return "pydantic" in d_title
    if "langgraph" in normalize_lesson_title(title) or "langgraph" in url:
        return "langgraph" in d_title or "langgraph" in " ".join(digest.get("takeaways") or []).lower()
    if "applied-llms" in url:
        return "applied" in d_title or "llm" in d_title

    # YouTube: require title token overlap
    if "youtube.com" in url or "youtu.be" in url:
        lt = token_set(title)
        dt = token_set(d_title)
        if lt and dt and len(lt & dt) >= 1:
            return True
        # Karpathy / channel hubs — digest unlikely to match; reject generic gateway digests
        if "litellm" in d_title or "gateway" in d_title:
            return False
        return len(lt & dt) >= 2 if lt else False

    # Generic overlap fallback
    lt = token_set(title)
    dt = token_set(d_title)
    if not dt:
        return False
    overlap = len(lt & dt)
    return overlap >= 2 or (overlap >= 1 and len(lt) <= 4)


def sanitize_lesson_enrichment(row: dict, youtube_id_from_url: Any) -> None:
    """Drop mis-merged enrichment; always align YouTube id with URL."""
    digest = row.get("digest")
    if digest and not digest_matches_lesson(row, digest):
        row.pop("digest", None)

    url = (row.get("url") or "").strip()
    yid = youtube_id_from_url(url) if callable(youtube_id_from_url) else ""
    if yid:
        row["youtube_id"] = yid
    elif "youtube_id" in row:
        row.pop("youtube_id", None)

    # Per-topic theory should not carry whole-course lists from bad order-based merges
    row.pop("course_concepts", None)
    row.pop("course_prompts", None)


def handbook_matches_lesson(entry: dict[str, Any], lesson: dict) -> bool:
    """Handbook rows are keyed by lesson order; skip overlay when syllabus drift misaligns text."""
    if not entry:
        return False
    one = (entry.get("one_liner") or "").strip()
    if not one:
        return True
    title = normalize_lesson_title(lesson.get("lesson") or "")
    ltype = (lesson.get("type") or "").lower()
    if re.search(r"prove month \d+", one.lower()):
        if ltype != "prove" and not title.lower().startswith("prove"):
            return False
    lt = token_set(title)
    ht = token_set(one)
    if not lt:
        return True
    overlap = len(lt & ht)
    if overlap >= 2:
        return True
    if overlap >= 1 and len(lt) <= 5:
        return True
    if ltype == "prove" and "prove" in one.lower():
        return True
    if re.search(r"month \d+:", one.lower()) and overlap < 1:
        return False
    return overlap >= 1


def index_lessons_by_key(lessons: list[dict]) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for row in lessons:
        out[lesson_stable_key(row)] = row
    return out
