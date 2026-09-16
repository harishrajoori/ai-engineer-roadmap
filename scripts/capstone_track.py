"""Course 10 scope labels: wire existing modules vs caching evidence vs reference vs demo."""

from __future__ import annotations

import re

CAPSTONE_SCOPE_LEGEND = [
    {
        "track": "wire",
        "label": "Wire",
        "subtitle": "Integration",
        "hint": "Connect modules you already built in Months 1–9—no new frameworks.",
    },
    {
        "track": "caching",
        "label": "Caching",
        "subtitle": "New evidence",
        "hint": "Prompt caching table and TTFT metrics for the alpha prove gate.",
    },
    {
        "track": "reference",
        "label": "Reference",
        "subtitle": "Skim",
        "hint": "Revisit or skim docs/video—skip if you are time-boxed after wiring.",
    },
    {
        "track": "demo",
        "label": "Demo",
        "subtitle": "Prove",
        "hint": "Tag alpha, one-command demo, README caching section.",
    },
    {
        "track": "defer",
        "label": "Defer",
        "subtitle": "Optional",
        "hint": "Document as Phase 2 in README—do not block alpha.",
    },
]


def infer_capstone_track(
    course: int,
    section: str,
    title: str,
    *,
    required: str = "Yes",
) -> str | None:
    """Return track id for Course 10 lessons; None for other courses."""
    if int(course) != 10:
        return None

    sec = (section or "").lower().strip()
    text = (title or "").lower()

    if sec == "practical gate":
        return "caching"
    if sec == "prove":
        return "demo"
    if sec == "watch" or sec == "read":
        return "reference"
    if sec == "build":
        return "wire"
    if sec == "capstone checklist":
        if not required or required.lower() == "no" or re.search(r"\(optional", text):
            return "defer"
        return "wire"

    return "reference"


def attach_capstone_tracks(lessons: list[dict]) -> None:
    for row in lessons:
        track = infer_capstone_track(
            int(row.get("course", -1)),
            str(row.get("section") or ""),
            str(row.get("lesson") or ""),
            required=str(row.get("required") or "Yes"),
        )
        if track:
            row["capstone_track"] = track


def capstone_scope_summary(lessons: list[dict]) -> dict:
    """Counts per track for courses_ref course 10."""
    counts: dict[str, int] = {}
    for row in lessons:
        if int(row.get("course", -1)) != 10:
            continue
        track = row.get("capstone_track")
        if track:
            counts[track] = counts.get(track, 0) + 1
    return {
        "legend": CAPSTONE_SCOPE_LEGEND,
        "counts": counts,
        "total_topics": sum(counts.values()),
    }
