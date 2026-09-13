"""Append optional third-party curriculum links into lesson resource stacks."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from enrichment_utils import lesson_stable_key

REPO_ROOT = Path(__file__).resolve().parent.parent
LINKS_PATH = REPO_ROOT / "data" / "external_curriculum_links.json"

_cache: dict[str, Any] | None = None


def load_external_curriculum_links() -> dict[str, Any]:
    global _cache
    if _cache is not None:
        return _cache
    if not LINKS_PATH.exists():
        _cache = {"by_lesson_key": {}}
        return _cache
    _cache = json.loads(LINKS_PATH.read_text(encoding="utf-8"))
    return _cache


def provider_meta() -> dict[str, str]:
    data = load_external_curriculum_links()
    provider = data.get("provider") or {}
    return {
        "id": str(provider.get("id") or ""),
        "title": str(provider.get("title") or "External curriculum"),
        "site": str(provider.get("site") or ""),
        "repo": str(provider.get("repo") or ""),
    }


def _normalize_resource(entry: dict) -> dict | None:
    url = (entry.get("url") or "").strip()
    if not url.startswith("http"):
        return None
    title = (entry.get("title") or "External resource").strip()
    return {
        "title": title,
        "url": url,
        "type": entry.get("type") or "guide",
        "level": entry.get("level") or "intermediate",
        "description": (entry.get("description") or "").strip()
        or "Optional deep dive from an external open curriculum.",
        "source": "external_curriculum",
    }


def append_external_resources(row: dict) -> None:
    """Merge mapped extras into row['resources'] without duplicating URLs."""
    by_key = load_external_curriculum_links().get("by_lesson_key") or {}
    key = lesson_stable_key(row)
    extras = by_key.get(key)
    if not extras:
        return

    resources = list(row.get("resources") or [])
    seen = {(r.get("url") or "").strip().lower() for r in resources}

    for raw in extras:
        if not isinstance(raw, dict):
            continue
        normalized = _normalize_resource(raw)
        if not normalized:
            continue
        url_key = normalized["url"].lower()
        if url_key in seen:
            continue
        resources.append(normalized)
        seen.add(url_key)

    row["resources"] = resources
