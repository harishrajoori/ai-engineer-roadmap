"""Curated per-topic theory and walkthrough depth (keyed by lesson order 1–141)."""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from enrichment_utils import handbook_matches_lesson, lesson_stable_key
from topic_handbook.entries import HANDBOOK_BY_KEY, HANDBOOK_BY_ORDER


def handbook_entry(lesson: dict) -> dict[str, Any]:
    stable = lesson_stable_key(lesson)
    keyed = HANDBOOK_BY_KEY.get(stable)
    if keyed:
        return dict(keyed)
    order = lesson.get("order")
    if order is None:
        return {}
    entry = HANDBOOK_BY_ORDER.get(int(order)) or {}
    if entry and handbook_matches_lesson(entry, lesson):
        return dict(entry)
    return {}


def merge_handbook_into_hint(lesson: dict, hint: dict[str, Any]) -> dict[str, Any]:
    """Overlay curated fields onto the dynamic hint (handbook wins when set)."""
    entry = handbook_entry(lesson)
    if not entry or not handbook_matches_lesson(entry, lesson):
        return hint
    out = dict(hint)
    scalar_keys = (
        "one_liner",
        "why_now",
        "beginner_extra",
        "intermediate_deep_dive",
        "advanced_extra",
        "mental_model",
        "capstone_action",
        "done_when",
    )
    for key in scalar_keys:
        if entry.get(key):
            out[key] = entry[key]
    list_keys = ("watch_for", "read_sections", "failure_modes", "interview_prompts", "concepts")
    for key in list_keys:
        if entry.get(key):
            out[key] = entry[key]
    return out


@lru_cache(maxsize=1)
def handbook_coverage() -> tuple[int, int]:
    return len(HANDBOOK_BY_ORDER), max(HANDBOOK_BY_ORDER.keys()) if HANDBOOK_BY_ORDER else 0
