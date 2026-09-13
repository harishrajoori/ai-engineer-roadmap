"""Beginner / intermediate / advanced theory markdown per topic."""

from __future__ import annotations

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
    lines.append("> **Beginner path** — no prior AI background assumed. Read this, then use the **Lecture** tab when you feel oriented.")
    lines.append("")

    lines.append("## What is this, in plain English?")
    lines.append("")
    lines.append(hint.get("one_liner") or f"This topic supports **{title}** in your capstone track.")
    lines.append("")
    if hint.get("why_now"):
        lines.append("**Why it shows up now:** " + hint["why_now"])
        lines.append("")

    if hint.get("beginner_extra"):
        lines.append(hint["beginner_extra"])
        lines.append("")

    concepts = hint.get("concepts") or []
    if concepts:
        lines.append("## Words you will hear (simple meanings)")
        lines.append("")
        for cid in concepts[:6]:
            entry = gmap.get(cid)
            if entry:
                lines.append(f"- **{entry['term']}** — {entry['definition']}")
                lines.append(f"  - *Like in data engineering:* {entry.get('de_analogy', '')}")
            else:
                lines.append(f"- **{cid}**")
        lines.append("")

    lines.append("## Best order for this topic")
    lines.append("")
    lines.append("1. Stay on **Beginner** (this page) until the ideas feel familiar.")
    lines.append("2. Tap **Intermediate** for the full study guide and prove rubric.")
    lines.append("3. Open the **Lecture** tab for video or the external course—pause and take notes.")
    lines.append("4. Use **Lab & Prove** when you have something to link.")
    lines.append("")

    if ltype == "Video" and hint.get("watch_for"):
        lines.append("## When you watch, look for")
        lines.append("")
        for w in hint["watch_for"]:
            lines.append(f"- {w}")
        lines.append("")

    if ltype == "Read" and hint.get("read_sections"):
        lines.append("## When you read, skim these parts first")
        lines.append("")
        for s in hint["read_sections"]:
            lines.append(f"- {s}")
        lines.append("")

    if course_outcomes:
        lines.append("## How this month fits together")
        lines.append("")
        lines.append(f"Course **{course}** is building toward:")
        for o in course_outcomes[:3]:
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
    gmap = glossary_by_id()
    concept_map = concept_map_for_course(course or "")
    prove_pack = prove_pack_for_course(course or "")
    lines: list[str] = []

    lines.append(f"# {title}")
    lines.append("")
    lines.append("> **Advanced path** — staff / platform framing: SLOs, failure modes, tradeoffs, interview depth.")
    lines.append("")

    lines.append("## System design lens")
    lines.append("")
    if ltype == "Video":
        lines.append(
            "- Bound **TTFT**, **P99 latency**, and **cost per 1k tokens** for this capability.\n"
            "- Treat model output as **untrusted** until schema/invariant checks pass.\n"
            "- Log: `model`, `prompt_tokens`, `completion_tokens`, `latency_ms`, `usd_estimate`, `run_id`."
        )
    elif ltype == "Read":
        lines.append(
            "- Extract **adopt / experiment / defer** with explicit owners and review date.\n"
            "- Document **breaking changes** if this API becomes a platform standard.\n"
            "- Pair reading with a **golden-set case** that would break if you mis-implement."
        )
    elif ltype == "Build":
        lines.append(
            "- Smallest change that proves the pattern; **typed contracts** and **regression tests** required.\n"
            "- PR description must state blast radius and rollback plan."
        )
    else:
        lines.append(
            "- Evidence must be **reproducible in <10 minutes** by a reviewer.\n"
            "- Align artifact with course **prove pack** acceptance table."
        )
    lines.append("")

    if concept_map:
        lines.append("## Course concept map (staff depth)")
        lines.append("")
        for item in concept_map[:8]:
            lines.append(f"- {item}")
        lines.append("")

    lines.append("## Tradeoffs and anti-patterns")
    lines.append("")
    lines.append(_advanced_tradeoffs(ltype, hint, title))
    lines.append("")

    lines.append("## Interview prompts")
    lines.append("")
    for q in _interview_questions(ltype, hint, title):
        lines.append(f"- {q}")
    lines.append("")

    if hint.get("capstone_action"):
        lines.append("## Capstone implementation note")
        lines.append("")
        lines.append(hint["capstone_action"])
        lines.append("")

    acceptance = prove_pack.get("acceptance") or []
    if acceptance and (ltype == "Prove" or lesson.get("prove_criteria")):
        lines.append("## Prove bar (non-negotiable)")
        lines.append("")
        for row in acceptance:
            if row.get("required"):
                lines.append(f"- {row.get('criterion')}")
        lines.append("")

    concepts = hint.get("concepts") or []
    if concepts:
        lines.append("## Term precision")
        lines.append("")
        for cid in concepts:
            entry = gmap.get(cid)
            if entry:
                lines.append(f"- **{entry['term']}** — {entry['definition']}")
        lines.append("")

    return "\n".join(lines)


def _advanced_tradeoffs(ltype: str, hint: dict, title: str) -> str:
    if "litellm" in title.lower() or "gateway" in (hint.get("one_liner") or "").lower():
        return (
            "- **Central gateway** vs per-team API keys: ops win vs velocity.\n"
            "- **Fallback chains** can mask quality drift—alert when fallback rate > threshold.\n"
            "- Anti-pattern: logging prompts with PII to debug 429s."
        )
    if "instructor" in title.lower() or "pydantic" in title.lower():
        return (
            "- **Retries on validation** vs lower temperature: balance cost and determinism.\n"
            "- Anti-pattern: accepting JSON that parses but violates business invariants.\n"
            "- Anti-pattern: unbounded retry loops without max spend cap."
        )
    if "langgraph" in title.lower():
        return (
            "- **Checkpoint storage** cost vs recovery time—pick SQLite for dev, Postgres for shared envs.\n"
            "- Anti-pattern: giant state blobs in graph memory.\n"
            "- HITL interrupts need SLA and ownership—don't block batch pipelines indefinitely."
        )
    if "mcp" in title.lower():
        return (
            "- **stdio MCP** for local dev vs **SSE** for remote—security boundary differs.\n"
            "- Anti-pattern: tools without audit logs in regulated contexts.\n"
            "- Version tool schemas; breaking changes need consumer migration plan."
        )
    if ltype == "Video":
        return (
            "- Anti-pattern: watching entire playlists when syllabus only needs one module.\n"
            "- Anti-pattern: no written takeaway—video alone does not ship to prod."
        )
    return (
        "- Anti-pattern: checkbox complete without artifact or metric.\n"
        "- Anti-pattern: copying tutorial code without golden-set regression."
    )


def _interview_questions(ltype: str, hint: dict, title: str) -> list[str]:
    base = [
        f"How would you explain **{title[:60]}** to a data platform team in 90 seconds?",
        "What would you log on failure, and what alert would you page on?",
    ]
    if ltype == "Prove":
        base.insert(0, "What evidence would convince you this prove gate is satisfied in a code review?")
    if "eval" in title.lower() or "golden" in str(hint.get("concepts")):
        base.append("How do you separate schema validity from semantic correctness?")
    if "rag" in title.lower() or "retrieval" in title.lower():
        base.append("When does hybrid retrieval beat dense-only, and how do you measure it?")
    return base[:5]


def attach_theory_levels(lesson: dict, course_outcomes: list[str], coverage_note: str | None, intermediate_md: str) -> None:
    lesson["theory_levels"] = {
        "beginner": build_beginner_markdown(lesson, course_outcomes),
        "intermediate": intermediate_md,
        "advanced": build_advanced_markdown(lesson, course_outcomes),
    }
    lesson["theory_summary"] = intermediate_md
    lesson["study_order"] = "theory_then_lecture"
