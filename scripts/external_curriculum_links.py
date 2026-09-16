"""Append optional third-party curriculum links into lesson resource stacks."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from enrichment_utils import lesson_stable_key

REPO_ROOT = Path(__file__).resolve().parent.parent
LINKS_PATH = REPO_ROOT / "data" / "external_curriculum_links.json"

_cache: dict[str, Any] | None = None


_APPLIED_LLMS_TOC_FRAGMENTS: tuple[str, ...] = (
    "#toc-tactical-nuts-bolts-of-working-with-llms",
    "#toc-structure-your-inputs-and-outputs",
    "#toc-step-by-step-multi-turn-flows-can-give-large-boosts",
    "#toc-information-retrieval-rag",
    "#toc-evaluation-monitoring",
    "#toc-create-a-few-assertion-based-unit-tests-from-real-inputoutput-samples",
    "#toc-hallucinations-are-a-stubborn-problem",
)

_INSTRUCTOR_KEY_ALIASES: tuple[tuple[str, str], ...] = (
    (
        "c0|u|https://python.useinstructor.com/",
        "c0|u|https://python.useinstructor.com/getting-started/",
    ),
    (
        "c1|u|https://python.useinstructor.com/getting-started/",
        "c0|u|https://python.useinstructor.com/getting-started/",
    ),
)


def _expand_by_lesson_key(by_key: dict[str, list]) -> dict[str, list]:
    """Mirror base handbook keys onto TOC fragment URLs (explicit lookup, not only fallback)."""
    out = dict(by_key)
    for key, extras in by_key.items():
        lower = key.lower()
        if "|u|https://applied-llms.org/" in lower and "#" not in lower:
            for frag in _APPLIED_LLMS_TOC_FRAGMENTS:
                frag_key = key.replace(
                    "https://applied-llms.org/",
                    f"https://applied-llms.org/{frag}",
                ).replace(
                    "http://applied-llms.org/",
                    f"http://applied-llms.org/{frag}",
                )
                if frag_key not in out:
                    out[frag_key] = list(extras)
    for alias, source in _INSTRUCTOR_KEY_ALIASES:
        if source in by_key and alias not in out:
            out[alias] = list(by_key[source])
    return out


def load_external_curriculum_links() -> dict[str, Any]:
    global _cache
    if _cache is not None:
        return _cache
    if not LINKS_PATH.exists():
        _cache = {"by_lesson_key": {}}
        return _cache
    raw = json.loads(LINKS_PATH.read_text(encoding="utf-8"))
    by_key = raw.get("by_lesson_key") or {}
    raw["by_lesson_key"] = _expand_by_lesson_key(by_key)
    _cache = raw
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


def _external_link_keys(row: dict) -> list[str]:
    """Stable keys for lookup — include bare URL when primary uses a TOC fragment."""
    keys = [lesson_stable_key(row)]
    url = (row.get("url") or "").strip()
    if "#" not in url:
        return keys
    base = url.split("#", 1)[0].rstrip("/")
    for variant in (base, f"{base}/"):
        alt = {**row, "url": variant}
        k = lesson_stable_key(alt)
        if k not in keys:
            keys.append(k)
    return keys


def append_external_resources(row: dict) -> None:
    """Merge mapped extras into row['resources'] without duplicating URLs."""
    by_key = load_external_curriculum_links().get("by_lesson_key") or {}
    extras: list[dict] = []
    for key in _external_link_keys(row):
        chunk = by_key.get(key)
        if chunk:
            extras.extend(chunk)
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
