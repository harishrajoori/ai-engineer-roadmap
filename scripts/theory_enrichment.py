"""Inject diagrams + lab sections into generated theory_levels for every topic."""

from __future__ import annotations

from topic_diagrams import diagram_markdown_block
from topic_hints import get_topic_hint
from topic_lab_practice import lab_practice_markdown
from topic_plain_english import advanced_plain_english_block


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

    beg_len = len((levels.get("beginner") or ""))
    adv_body = (levels.get("advanced") or "").strip()
    adv_len = len(adv_body)
    if beg_len and adv_len < beg_len:
        hint = get_topic_hint(lesson)
        levels["advanced"] = adv_body + "\n\n" + advanced_plain_english_block(hint)
        if len(levels["advanced"]) < beg_len:
            levels["advanced"] += (
                "\n\n### Platform depth addendum\n\n"
                "Re-read **Rollout and implementation depth** with gateway metrics and golden-set labels open. "
                "Staff reviewers expect explicit tradeoffs on cost, latency, schema strictness, and audit—not a lecture recap."
            )
