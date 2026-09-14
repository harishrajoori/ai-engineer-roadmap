"""Per-lesson-order implementation links (deep GitHub paths) for topics catalog matching misses."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
OVERRIDES_PATH = REPO_ROOT / "data" / "topic_implementation_overrides.json"

SOURCE = "topic_order_override"
DEFAULT_MATCH_SCORE = 16


@lru_cache(maxsize=1)
def _by_order() -> dict[int, list[dict[str, Any]]]:
    if not OVERRIDES_PATH.exists():
        return {}
    raw = json.loads(OVERRIDES_PATH.read_text(encoding="utf-8"))
    out: dict[int, list[dict[str, Any]]] = {}
    for key, rows in (raw.get("by_order") or {}).items():
        order = int(key)
        items: list[dict[str, Any]] = []
        for row in rows or []:
            if not isinstance(row, dict):
                continue
            url = (row.get("url") or "").strip()
            if not url.startswith("http"):
                continue
            items.append(
                {
                    "title": (row.get("title") or "Implementation reference").strip(),
                    "url": url,
                    "type": "implementation",
                    "level": row.get("level") or "intermediate",
                    "description": (row.get("description") or "Topic-scoped code path for this syllabus row.").strip(),
                    "source": SOURCE,
                    "repo_id": (row.get("repo_id") or f"order-{order}-override").strip(),
                    "match_score": int(row.get("match_score") or DEFAULT_MATCH_SCORE),
                }
            )
        if items:
            out[order] = items
    return out


def resources_for_lesson(lesson: dict) -> list[dict[str, Any]]:
    order = lesson.get("order")
    if order is None:
        return []
    return list(_by_order().get(int(order)) or [])
