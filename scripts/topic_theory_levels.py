"""Beginner / intermediate / advanced theory markdown per topic.

Level contracts (enforced by structure, validated in CI):
- Beginner: plain English, glossary terms, watch/read checklist, no prove rubric dump.
- Intermediate: full study guide (five layers), prove acceptance, steps — operational default.
- Advanced: platform depth ONLY — narrative, failure modes, metrics, ADR, interview depth;
  must NOT repeat beginner glossary or intermediate step lists.
"""

from __future__ import annotations

from advanced_depth import (
    advanced_narrative,
    decision_record_rows,
    digest_staff_synthesis,
    failure_modes,
    interview_depth,
    metrics_and_alerts,
)
from curriculum_enrichment import concept_map_for_course, glossary_by_id, prove_pack_for_course
from topic_hints import get_topic_hint


def build_beginner_markdown(lesson: dict, course_outcomes: list[str]) -> str:
    title = lesson.get("lesson") or "Topic"
    course = lesson.get("course")
    ltype = lesson.get("type") or "Read"
    hint = get_topic_hint(lesson)
    gmap = glossary_by_id()
    lines: list[str] = []

    lines.append(f"# {title}")
    lines.append("")
    lines.append(
        "> **Foundations** — plain language first. When this makes sense, open **Lecture**. "
        "Switch to **Study guide** for the full checklist and prove rubric."
    )
    lines.append("")

    lines.append("## What is this, in plain English?")
    lines.append("")
    lines.append(hint.get("one_liner") or f"This topic supports **{title}** in your capstone track.")
    lines.append("")
    if hint.get("why_now"):
        lines.append("**Why it shows up now:** " + hint["why_now"])
        lines.append("")

    if hint.get("mental_model"):
        lines.append("## Mental model")
        lines.append("")
        lines.append(hint["mental_model"])
        lines.append("")

    if hint.get("beginner_extra"):
        lines.append(hint["beginner_extra"])
        lines.append("")

    concepts = hint.get("concepts") or []
    concept_limit = 3 if hint.get("intermediate_deep_dive") else 5
    if concepts:
        lines.append("## Words you will hear")
        lines.append("")
        for cid in concepts[:concept_limit]:
            entry = gmap.get(cid)
            if entry:
                lines.append(f"- **{entry['term']}** — {entry['definition']}")
                if entry.get("de_analogy"):
                    lines.append(f"  - *Data pipeline analogy:* {entry['de_analogy']}")
            else:
                lines.append(f"- **{cid}**")
        lines.append("")

    if ltype == "Video" and hint.get("watch_for"):
        lines.append("## While you watch")
        lines.append("")
        for w in hint["watch_for"]:
            lines.append(f"- {w}")
        lines.append("")

    if ltype == "Read" and hint.get("read_sections"):
        lines.append("## While you read")
        lines.append("")
        for s in hint["read_sections"]:
            lines.append(f"- {s}")
        lines.append("")

    if course_outcomes:
        lines.append("## This month you are working toward")
        lines.append("")
        for o in course_outcomes[:2]:
            lines.append(f"- {o}")
        lines.append("")

    lines.append("## Ready for the lecture when")
    lines.append("")
    lines.append(hint.get("done_when") or "You can explain the main idea in one or two sentences without jargon.")
    lines.append("")

    return "\n".join(lines)


def build_advanced_markdown(lesson: dict, course_outcomes: list[str]) -> str:
    title = lesson.get("lesson") or "Topic"
    course = lesson.get("course")
    ltype = lesson.get("type") or "Read"
    hint = get_topic_hint(lesson)
    prove_pack = prove_pack_for_course(course or "")
    lines: list[str] = []

    lines.append(f"# {title}")
    lines.append("")
    lines.append(
        "> **Platform depth** — engineering judgment: tradeoffs, metrics, failures, interviews. "
        "Read **Study guide** first if you have not done the checklist."
    )
    lines.append("")

    lines.append("## Platform narrative (this topic)")
    lines.append("")
    lines.append(advanced_narrative(lesson, hint))
    lines.append("")

    if hint.get("intermediate_deep_dive"):
        lines.append("## Rollout and implementation depth")
        lines.append("")
        lines.append(hint["intermediate_deep_dive"])
        lines.append("")

    if hint.get("mental_model"):
        lines.append("## Architecture anchor")
        lines.append("")
        lines.append(hint["mental_model"])
        lines.append("")

    takeaways, rules = digest_staff_synthesis(lesson)
    if takeaways:
        lines.append("## Synthesis from curated notes")
        lines.append("")
        for t in takeaways:
            lines.append(f"- {t}")
        lines.append("")

    if rules:
        lines.append("## Engineering rules to enforce")
        lines.append("")
        for r in rules:
            lines.append(f"- {r}")
        lines.append("")

    cmap = concept_map_for_course(course or "")
    if cmap:
        lines.append("## How this topic fits the month’s architecture")
        lines.append("")
        for item in _relevant_map_lines(title, cmap)[:5]:
            lines.append(f"- {item}")
        lines.append("")

    focus = hint.get("watch_for") or hint.get("read_sections") or []
    if focus:
        lines.append("## Primary source focus")
        lines.append("")
        for item in focus[:6]:
            lines.append(f"- {item}")
        lines.append("")

    fms = failure_modes(lesson, hint)
    if fms:
        lines.append("## Failure modes to design for")
        lines.append("")
        for fm in fms:
            lines.append(f"- {fm}")
        lines.append("")

    lines.append("## Metrics and alerts")
    lines.append("")
    for m in metrics_and_alerts(lesson):
        lines.append(f"- {m}")
        lines.append("")

    lines.append("## Tradeoffs (explicit)")
    lines.append("")
    lines.append(_advanced_tradeoffs(ltype, hint, title))
    lines.append("")

    lines.append("## Decision record (fill before you ship)")
    lines.append("")
    lines.append("| Stance | Your choice | Rationale |")
    lines.append("| --- | --- | --- |")
    for stance, choice, rationale in decision_record_rows(lesson):
        lines.append(f"| {stance} | {choice} | {rationale} |")
    lines.append("")

    lines.append("## Interview depth")
    lines.append("")
    for q in interview_depth(lesson, hint):
        lines.append(f"- {q}")
    lines.append("")

    if hint.get("capstone_action"):
        lines.append("## Capstone implementation")
        lines.append("")
        lines.append(hint["capstone_action"])
        lines.append("")

    if hint.get("done_when"):
        lines.append("## Advanced done bar")
        lines.append("")
        lines.append(hint["done_when"])
        lines.append("")

    acceptance = prove_pack.get("acceptance") or []
    if acceptance and (ltype == "Prove" or lesson.get("prove_criteria")):
        lines.append("## Prove bar")
        lines.append("")
        for row in acceptance:
            if row.get("required"):
                lines.append(f"- {row.get('criterion')}")
        lines.append("")

    return "\n".join(lines)


def _relevant_map_lines(title: str, cmap: list[str]) -> list[str]:
    tokens = set(title.lower().split())
    scored = []
    for line in cmap:
        lt = set(line.lower().split())
        scored.append((len(tokens & lt), line))
    scored.sort(key=lambda x: (-x[0], x[1]))
    if scored and scored[0][0] > 0:
        return [s[1] for s in scored]
    return cmap


def _advanced_tradeoffs(ltype: str, hint: dict, title: str) -> str:
    blob = f"{title} {hint.get('one_liner') or ''}".lower()
    if "litellm" in blob or "gateway" in blob:
        return (
            "| Option | Upside | Downside |\n"
            "| --- | --- | --- |\n"
            "| Central LiteLLM proxy | Uniform logs, budgets, fallbacks | Single point of failure; needs HA |\n"
            "| Per-service API keys | Team velocity | No cost attribution; secret sprawl |"
        )
    if "instructor" in blob or "pydantic" in blob:
        return (
            "| Option | Upside | Downside |\n"
            "| --- | --- | --- |\n"
            "| Retry on ValidationError | Higher pass rate | Cost/latency multiply |\n"
            "| Low temperature + no retry | Cheaper, stable | May under-recover on hard rows |"
        )
    if "langgraph" in blob:
        return (
            "| Option | Upside | Downside |\n"
            "| --- | --- | --- |\n"
            "| SQLite checkpointer | Fast local dev | Not for multi-worker prod |\n"
            "| Postgres checkpointer | Durable shared state | Ops + migration burden |"
        )
    if ltype == "Video":
        return (
            "- **Depth vs shipping:** more videos rarely beat one golden-set iteration.\n"
            "- **Generalist model vs fine-tune:** default generalist + schema until evals prove otherwise."
        )
    return (
        "- **Build vs buy:** API model + gateway before self-hosting weights.\n"
        "- **Strict schema vs fuzzy parsing:** always strict at the boundary; relax only inside trusted zones."
    )


def attach_theory_levels(lesson: dict, course_outcomes: list[str], coverage_note: str | None, intermediate_md: str) -> None:
    lesson["theory_levels"] = {
        "beginner": build_beginner_markdown(lesson, course_outcomes),
        "intermediate": intermediate_md,
        "advanced": build_advanced_markdown(lesson, course_outcomes),
    }
    lesson["theory_summary"] = intermediate_md
    lesson["study_order"] = "theory_then_lecture"
