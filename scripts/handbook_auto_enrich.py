"""Pad thin handbook rows with long plain-English depth (no repeated boilerplate tables)."""

from __future__ import annotations

from typing import Any

from topic_plain_english import expand_thin_handbook_advanced, expand_thin_handbook_intermediate

MIN_INTERMEDIATE_CHARS = 720
MIN_ADVANCED_CHARS = 720

_ENRICH_MARKERS: tuple[str, ...] = (
    "### Implementation depth — order",
    "### Platform judgment — order",
    "| Data engineering concept |",
    "### Rollout checklist (repo, not notebook)",
    "### Metrics and alerts (platform depth)",
)


def _strip_enrich_boilerplate(text: str) -> str:
    out = (text or "").strip()
    for marker in _ENRICH_MARKERS:
        idx = out.find(marker)
        if idx >= 0:
            out = out[:idx].rstrip()
    return out


def _ensure_length(existing: str, minimum: int, supplement: str) -> str:
    base = (existing or "").strip()
    if len(base) >= minimum:
        return base
    if base and supplement.strip() not in base:
        return f"{base}\n\n{supplement}".strip()
    if base:
        return base
    return supplement


def enrich_entry(order: int, entry: dict[str, Any], lesson: dict[str, Any]) -> dict[str, Any]:
    out = dict(entry)
    lesson = lesson or {"order": order, "course": "0", "type": "Read", "lesson": f"Topic {order}"}

    out["intermediate_deep_dive"] = _strip_enrich_boilerplate(out.get("intermediate_deep_dive") or "")
    out["advanced_extra"] = _strip_enrich_boilerplate(out.get("advanced_extra") or "")

    inter_sup = expand_thin_handbook_intermediate(out, lesson)
    adv_sup = expand_thin_handbook_advanced(out)

    out["intermediate_deep_dive"] = _ensure_length(
        out["intermediate_deep_dive"], MIN_INTERMEDIATE_CHARS, inter_sup
    )
    out["advanced_extra"] = _ensure_length(out["advanced_extra"], MIN_ADVANCED_CHARS, adv_sup)
    return out


def enrich_all(
    merged: dict[int, dict[str, Any]], lessons_by_order: dict[int, dict[str, Any]]
) -> dict[int, dict[str, Any]]:
    return {order: enrich_entry(order, entry, lessons_by_order.get(order, {})) for order, entry in merged.items()}
