"""Inject diagrams into study-guide theory; lab content lives only on lab_plan."""

from __future__ import annotations

from topic_diagrams import beginner_diagram_block, diagram_markdown_block
from topic_hints import get_topic_hint
from topic_plain_english import advanced_plain_english_block

# Advanced should be topic-specific (advanced_narrative / handbook), not padded with identical blocks.
_ADVANCED_MIN_CHARS = 900


def _strip_lab_section(body: str) -> str:
    text = (body or "").strip()
    if "## Lab & Practice" in text:
        text = text.split("## Lab & Practice")[0].rstrip()
    return text


def enrich_theory_levels(lesson: dict) -> None:
    """Add diagrams to beginner + intermediate and guarantee advanced depth.

    - Beginner gets one plain-English diagram (fixes the "missing mermaid in
      beginner" gap for every lesson).
    - Intermediate keeps the fuller architecture + sequence block.
    - Advanced is extended until it is at least as long as beginner and clears
      the shallow-advanced length target, using real platform-depth prose.
    """
    levels = lesson.get("theory_levels")
    if not levels:
        return

    # Strip any stray Lab & Practice from every tier; labs live on the Lab tab.
    for key in ("beginner", "intermediate", "advanced"):
        body = _strip_lab_section(levels.get(key) or "")
        if body:
            levels[key] = body

    # Beginner: one light diagram with a plain-English caption.
    beginner = (levels.get("beginner") or "").strip()
    if beginner and "```mermaid" not in beginner:
        levels["beginner"] = f"{beginner}\n\n{beginner_diagram_block(lesson)}".rstrip()

    # Intermediate: fuller architecture + optional sequence diagram.
    intermediate = (levels.get("intermediate") or "").strip()
    if intermediate and "## Architecture (visual)" not in intermediate:
        levels["intermediate"] = f"{intermediate}\n\n{diagram_markdown_block(lesson)}"
    lesson["theory_summary"] = levels.get("intermediate") or lesson.get("theory_summary") or ""

    # Advanced: guarantee it is never shorter than beginner and is genuinely deep.
    beg_len = len(levels.get("beginner") or "")
    target = max(beg_len, _ADVANCED_MIN_CHARS)
    adv_body = (levels.get("advanced") or "").strip()

    hint = get_topic_hint(lesson)
    if len(adv_body) < target and not (hint.get("advanced_extra") or "").strip():
        block = advanced_plain_english_block(hint).strip()
        if block and block not in adv_body:
            adv_body = f"{adv_body}\n\n{block}".strip()

    levels["advanced"] = adv_body
