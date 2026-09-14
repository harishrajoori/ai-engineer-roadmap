"""Inject diagrams + lab sections into generated theory_levels for every topic."""

from __future__ import annotations

from topic_diagrams import diagram_markdown_block
from topic_lab_practice import lab_practice_markdown


def enrich_theory_levels(lesson: dict) -> None:
    """Append architecture diagrams and lab practice to all theory depths."""
    levels = lesson.get("theory_levels")
    if not levels:
        return

    diagrams = diagram_markdown_block(lesson)
    lab = lab_practice_markdown(lesson)

    for key in ("beginner", "intermediate", "advanced"):
        body = (levels.get(key) or "").strip()
        if not body:
            continue
        if "## Architecture (visual)" not in body:
            body = f"{body}\n\n{diagrams}"
        if "## Lab & Practice" not in body:
            body = f"{body}\n\n{lab}"
        levels[key] = body

    if lesson.get("theory_summary") and "## Architecture (visual)" not in lesson["theory_summary"]:
        lesson["theory_summary"] = f"{lesson['theory_summary'].strip()}\n\n{diagrams}\n\n{lab}"
