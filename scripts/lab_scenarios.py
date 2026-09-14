"""DE-focused lab scenarios and copy-paste code blocks for the Lab & Prove tab."""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
SCENARIOS_PATH = REPO_ROOT / "data" / "lab_scenarios.json"

_cache: dict[str, Any] | None = None


def load_lab_scenarios() -> dict[str, Any]:
    global _cache
    if _cache is not None:
        return _cache
    if not SCENARIOS_PATH.exists():
        _cache = {"by_course": {}, "by_order": {}}
        return _cache
    _cache = json.loads(SCENARIOS_PATH.read_text(encoding="utf-8"))
    return _cache


def resolve_de_lab(lesson: dict) -> dict[str, Any]:
    """Course baseline + per-order override for topic-specific code."""
    data = load_lab_scenarios()
    by_course = data.get("by_course") or {}
    by_order = data.get("by_order") or {}

    course = str(lesson.get("course", ""))
    try:
        order = str(int(lesson.get("order")))
    except (TypeError, ValueError):
        order = ""

    base = copy.deepcopy(by_course.get(course) or {})
    override = copy.deepcopy(by_order.get(order) or {}) if order else {}

    if not base and not override:
        return {}

    if override.get("scenario_title"):
        base["scenario_title"] = override["scenario_title"]
    if override.get("scenario_markdown"):
        base["scenario_markdown"] = override["scenario_markdown"]

    snippets = list(base.get("code_snippets") or [])
    if override.get("replace_snippets"):
        snippets = list(override.get("code_snippets") or [])
    elif override.get("code_snippets"):
        snippets = snippets + list(override["code_snippets"])

    if snippets:
        base["code_snippets"] = snippets

    if not base.get("scenario_markdown"):
        return {}

    base.setdefault("scenario_title", f"Data engineering scenario — Course {course}")
    return base
