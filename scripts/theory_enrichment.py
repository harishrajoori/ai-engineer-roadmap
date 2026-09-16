"""Inject diagrams into study-guide theory; lab content lives only on lab_plan."""

from __future__ import annotations

from topic_diagrams import diagram_markdown_block
from topic_hints import get_topic_hint
from topic_plain_english import advanced_plain_english_block


def enrich_theory_levels(lesson: dict) -> None:
    """Append architecture diagrams to intermediate only; keep Lab & Practice on the Lab tab."""
    levels = lesson.get("theory_levels")
    if not levels:
        return

    diagrams = diagram_markdown_block(lesson)

    for key in ("beginner", "intermediate", "advanced"):
        body = (levels.get(key) or "").strip()
        if not body:
            continue
        if "## Lab & Practice" in body:
            body = body.split("## Lab & Practice")[0].rstrip()
        levels[key] = body

    intermediate = (levels.get("intermediate") or "").strip()
    if intermediate and "## Architecture (visual)" not in intermediate:
        levels["intermediate"] = f"{intermediate}\n\n{diagrams}"
    lesson["theory_summary"] = levels.get("intermediate") or lesson.get("theory_summary") or ""

    beg_len = len((levels.get("beginner") or ""))
    adv_body = (levels.get("advanced") or "").strip()
    if "## Lab & Practice" in adv_body:
        adv_body = adv_body.split("## Lab & Practice")[0].rstrip()
    adv_len = len(adv_body)
    if beg_len and adv_len < beg_len:
        hint = get_topic_hint(lesson)
        levels["advanced"] = adv_body + "\n\n" + advanced_plain_english_block(hint)
        if len(levels["advanced"]) < beg_len:
            levels["advanced"] += (
                "\n\n### Platform depth addendum\n\n"
                "Re-read rollout and failure-mode sections with gateway metrics and golden-set labels open. "
                "Staff reviewers expect explicit tradeoffs on cost, latency, schema strictness, and audit—not a lecture recap."
            )
    elif adv_body:
        levels["advanced"] = adv_body
