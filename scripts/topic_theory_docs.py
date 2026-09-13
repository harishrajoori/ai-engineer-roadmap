"""Load authored studio theory guides from docs/topic_theory/."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
THEORY_DIR = REPO_ROOT / "docs" / "topic_theory"

_STUDIO_RE = re.compile(r"^(\d{3})-.+\.studio\.md$", re.I)
_BEGINNER_RE = re.compile(r"^(\d{3})-.+\.beginner\.md$", re.I)
_ADVANCED_RE = re.compile(r"^(\d{3})-.+\.advanced\.md$", re.I)
_FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)


def _parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    m = _FRONTMATTER_RE.match(text)
    if not m:
        return {}, text.strip()
    meta: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if ":" not in line:
            continue
        key, val = line.split(":", 1)
        meta[key.strip().lower()] = val.strip()
    body = text[m.end() :].strip()
    return meta, body


def _scan_theory_files() -> dict[int, dict[str, str]]:
    """order -> {studio, beginner, advanced} markdown bodies (no frontmatter)."""
    by_order: dict[int, dict[str, str]] = {}
    if not THEORY_DIR.is_dir():
        return by_order

    for path in sorted(THEORY_DIR.glob("*.md")):
        name = path.name
        if name.upper() == "README.MD":
            continue
        order: int | None = None
        slot: str | None = None
        if m := _STUDIO_RE.match(name):
            order, slot = int(m.group(1)), "studio"
        elif m := _BEGINNER_RE.match(name):
            order, slot = int(m.group(1)), "beginner"
        elif m := _ADVANCED_RE.match(name):
            order, slot = int(m.group(1)), "advanced"
        else:
            continue
        raw = path.read_text(encoding="utf-8")
        _meta, body = _parse_frontmatter(raw)
        by_order.setdefault(order, {})[slot] = body

    return by_order


_cache: dict[int, dict[str, str]] | None = None


def theory_docs_by_order() -> dict[int, dict[str, str]]:
    global _cache
    if _cache is None:
        _cache = _scan_theory_files()
    return _cache


def apply_studio_theory_docs(lesson: dict) -> None:
    """Override theory_levels when docs/topic_theory/{order}-*.studio.md exists."""
    try:
        order = int(lesson.get("order"))
    except (TypeError, ValueError):
        return

    docs = theory_docs_by_order().get(order)
    if not docs or not docs.get("studio"):
        lesson.pop("theory_studio_guide", None)
        return

    levels = dict(lesson.get("theory_levels") or {})
    levels["intermediate"] = docs["studio"]
    if docs.get("beginner"):
        levels["beginner"] = docs["beginner"]
    if docs.get("advanced"):
        levels["advanced"] = docs["advanced"]

    lesson["theory_levels"] = levels
    lesson["theory_summary"] = docs["studio"]
    lesson["theory_studio_guide"] = True


def list_studio_guide_orders() -> list[int]:
    return sorted(
        o for o, slots in theory_docs_by_order().items() if (slots.get("studio") or "").strip()
    )


def validate_studio_orders(lesson_orders: set[int]) -> list[str]:
    issues: list[str] = []
    for order in list_studio_guide_orders():
        if order not in lesson_orders:
            issues.append(f"docs/topic_theory file order {order:03d} has no matching lesson")
    return issues
