"""Generate per-topic theory summaries for the studio Overview tab."""

from __future__ import annotations

SECTION_DISPLAY: dict[str, str] = {
    "video_spine": "Free program spine",
    "watch": "Watch",
    "read": "Read",
    "build": "Build",
    "prove": "Prove & certify",
    "do": "Practice",
    "syllabus": "Syllabus",
    "video": "Video",
    "capstone checklist": "Capstone",
    "practical gate": "Practical gate",
    "pick one or two tracks": "Frontier tracks",
}

STAFF_LENS: dict[str, list[str]] = {
    "Video": [
        "Treat the model as an untrusted function: bound latency (TTFT, P99), token cost, and failure modes.",
        "After watching, write three bullets: what breaks in production, what you would log, what you would test.",
    ],
    "Read": [
        "Extract APIs, invariants, and anti-patterns — not trivia.",
        "Map reading to a decision: adopt now, experiment, or defer with rationale.",
    ],
    "Build": [
        "Ship the smallest artifact that proves the pattern (repo tag, CI check, or demo GIF).",
        "Prefer typed contracts (Pydantic), explicit retries, and golden-set regression tests.",
    ],
    "Prove": [
        "Prove = observable evidence: URL + README metric, screenshot, or CI badge — not self-assessment.",
        "Paste the artifact link in Lab & Prove; reviewers should reproduce in under 10 minutes.",
    ],
}


def section_label(section: str) -> str:
    key = (section or "syllabus").lower()
    return SECTION_DISPLAY.get(key, section.replace("_", " ").title())


def build_theory_summary(
    lesson: dict,
    course_outcomes: list[str],
    coverage_note: str | None = None,
) -> str:
    title = lesson.get("lesson") or "Topic"
    course = lesson.get("course")
    course_title = lesson.get("course_title") or f"Course {course}"
    section = section_label(lesson.get("section") or "")
    ltype = lesson.get("type") or "Do"
    req = "Required" if lesson.get("required") == "Yes" else "Optional"
    duration = lesson.get("duration") or "Time-box as needed"

    lines: list[str] = []
    lines.append(f"# {title}")
    lines.append("")
    lines.append(
        f"**Course {course}** · {course_title}  \n"
        f"**Syllabus block:** {section} · **Activity:** {ltype} · **{req}** · **{duration}**"
    )
    lines.append("")

    if coverage_note:
        lines.append(f"> **Shared resource:** {coverage_note}")
        lines.append("")

    digest = lesson.get("digest") or {}
    takeaways = [t for t in (digest.get("takeaways") or []) if t]
    rules = [r for r in (digest.get("rules") or []) if r]
    pitfalls = [p for p in (digest.get("pitfalls") or []) if p]
    concepts = [c for c in (lesson.get("course_concepts") or []) if c]

    lines.append("## What this topic is about")
    lines.append(_topic_blurb(ltype, title, lesson.get("url") or ""))
    lines.append("")

    if takeaways:
        lines.append("## Key takeaways (studio version)")
        for t in takeaways:
            lines.append(f"- {t}")
        lines.append("")
    elif concepts:
        lines.append("## Concepts to connect to this topic")
        for c in concepts[:6]:
            lines.append(f"- {c}")
        lines.append("")

    if course_outcomes:
        lines.append("## Course outcomes this supports")
        for o in course_outcomes[:5]:
            lines.append(f"- {o}")
        lines.append("")

    if rules:
        lines.append("## Engineering rules")
        for r in rules:
            lines.append(f"- {r}")
        lines.append("")

    if pitfalls:
        lines.append("## Common pitfalls")
        for p in pitfalls:
            lines.append(f"- {p}")
        lines.append("")

    staff = STAFF_LENS.get(ltype, STAFF_LENS["Read"])
    lines.append("## Staff / platform engineer lens")
    for s in staff:
        lines.append(f"- {s}")
    lines.append("")

    prove_criteria = lesson.get("prove_criteria")
    if prove_criteria:
        lines.append("## Prove criteria (from syllabus)")
        lines.append(f"- {prove_criteria}")
        lines.append("")

    lines.append("## Where to go deeper")
    lines.append(
        "- **Lecture** tab — primary video or external course player for this item.  \n"
        "- **More resources** tab — supplemental free links (beginner → advanced).  \n"
        "- **Resources** panel (right) — same stack sorted by level with descriptions.  \n"
        "- **AI Mentor** — ask for tradeoffs, interview defense, or ELI5 on this topic."
    )
    lines.append("")

    if lesson.get("url"):
        lines.append(f"[Open primary syllabus link ↗]({lesson['url']})")

    return "\n".join(lines)


def _topic_blurb(ltype: str, title: str, url: str) -> str:
    if ltype == "Video":
        if "deeplearning.ai/short-courses" in url:
            return (
                f"This is a **DeepLearning.AI short course** (~1–3 h of video in the browser). "
                f"Complete the modules that match **{title}**, then mark this topic done — not the entire DL.AI catalog."
            )
        if "deeplearning.ai/courses" in url:
            return (
                f"This is a **course hub** (many modules — not one long video). Time-box the units you need for "
                f"**{title}**; pair with Karpathy or Applied LLMs rather than trying to finish everything."
            )
        if "deeplearning.ai" in url:
            return (
                f"Open **{title}** in the browser. It is not a single embeddable lecture — use the syllabus headings "
                f"that match this checkbox."
            )
        return (
            f"Watch with a notebook: for **{title}**, capture architecture diagrams, failure modes, "
            f"and one production constraint you would enforce in your platform."
        )
    if ltype == "Read":
        return (
            f"Read for decisions, not coverage. For **{title}**, end with: what API/pattern you would standardize, "
            f"and what you would ban in code review."
        )
    if ltype == "Build":
        return (
            f"Build milestone for **{title}**: smallest repo or module change that demonstrates the pattern "
            f"with tests or a README metric."
        )
    if ltype == "Prove":
        return (
            f"Prove gate for **{title}**: publish evidence (GitHub, Colab, dashboard) that a reviewer can verify. "
            f"Link it under **Lab & Prove**."
        )
    return f"Complete **{title}** per the syllabus, then mark the topic done when you can explain it aloud."
