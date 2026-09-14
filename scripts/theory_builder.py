"""Generate per-topic theory summaries for the studio Overview tab."""

from __future__ import annotations

from curriculum_enrichment import glossary_by_id, prove_pack_for_course
from enrichment_utils import digest_matches_lesson
from topic_hints import get_topic_hint
from topic_plain_english import intermediate_plain_english_block

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
    title = _display_title(lesson)
    course = lesson.get("course")
    course_title = lesson.get("course_title") or f"Course {course}"
    section = section_label(lesson.get("section") or "")
    ltype = lesson.get("type") or "Do"
    req = "Required" if lesson.get("required") == "Yes" else "Optional"
    duration = lesson.get("duration") or "Time-box as needed"
    primary_url = (lesson.get("url") or "").strip()

    lines: list[str] = []
    lines.append(f"# {title}")
    lines.append("")
    lines.append("## At a glance")
    lines.append("")
    lines.append("| | |")
    lines.append("| --- | --- |")
    lines.append(f"| **Course** | {course} — {course_title} |")
    lines.append(f"| **Syllabus block** | {section} |")
    lines.append(f"| **Activity** | {ltype} · {req} |")
    lines.append(f"| **Time-box** | {duration} |")
    if primary_url.startswith("http"):
        lines.append(f"| **Primary source** | [Open link ↗]({primary_url}) |")
    lines.append("")

    if coverage_note:
        lines.append(f"> **Shared resource:** {coverage_note}")
        lines.append("")

    hint = get_topic_hint(lesson)
    _append_five_layer_study_guide(lines, hint, glossary_by_id())
    if hint.get("intermediate_deep_dive"):
        lines.append("## Deep dive (this topic)")
        lines.append("")
        lines.append(hint["intermediate_deep_dive"])
        lines.append("")
    lines.append(intermediate_plain_english_block(hint, include_dive=not hint.get("intermediate_deep_dive")))
    if hint.get("mental_model"):
        lines.append("## Mental model")
        lines.append("")
        lines.append(hint["mental_model"])
        lines.append("")
    if hint.get("failure_modes"):
        lines.append("## Watch for failures")
        lines.append("")
        for fm in hint["failure_modes"]:
            lines.append(f"- {fm}")
        lines.append("")
    if ltype == "Prove" or lesson.get("prove_criteria"):
        _append_prove_acceptance(lines, prove_pack_for_course(course or ""), lesson.get("prove_criteria"))

    digest = lesson.get("digest") or {}
    use_digest = bool(digest) and digest_matches_lesson(lesson, digest)
    takeaways = [t for t in (digest.get("takeaways") or []) if t] if use_digest else []
    rules = [r for r in (digest.get("rules") or []) if r] if use_digest else []
    pitfalls = [p for p in (digest.get("pitfalls") or []) if p] if use_digest else []

    lines.append("## What this topic is about")
    lines.append("")
    if hint.get("one_liner"):
        lines.append(hint["one_liner"])
        lines.append("")
    lines.append(_topic_blurb(ltype, title, primary_url, lesson.get("prove_criteria")))
    lines.append("")
    if hint.get("why_now"):
        lines.append("**Why now:** " + hint["why_now"])
        lines.append("")

    if takeaways:
        lines.append("## Key takeaways")
        lines.append("")
        for t in takeaways:
            lines.append(f"- {t}")
        lines.append("")

    if course_outcomes:
        lines.append("## How this fits the course")
        lines.append("")
        lines.append("These **course outcomes** are what you are building toward this month:")
        lines.append("")
        for o in course_outcomes[:6]:
            lines.append(f"- {o}")
        lines.append("")

    if rules:
        lines.append("## Engineering rules")
        lines.append("")
        for r in rules:
            lines.append(f"- {r}")
        lines.append("")

    if pitfalls:
        lines.append("## Common pitfalls")
        lines.append("")
        for p in pitfalls:
            lines.append(f"- {p}")
        lines.append("")

    prove_criteria = lesson.get("prove_criteria")
    if prove_criteria:
        lines.append("## Prove criteria (syllabus)")
        lines.append("")
        lines.append(f"**{prove_criteria}**")
        lines.append("")
        lines.append(
            "_Save your artifact URL under **Lab & Prove** and mark complete when a reviewer could verify in under 10 minutes._"
        )
        lines.append("")

    if not hint.get("intermediate_deep_dive"):
        staff = STAFF_LENS.get(ltype, STAFF_LENS["Read"])
        lines.append("## Staff / platform engineer lens")
        lines.append("")
        for s in staff:
            lines.append(f"- {s}")
        lines.append("")

    lines.append("## Step-by-step (time-boxed)")
    lines.append("")
    for i, step in enumerate(_study_steps(ltype, title), start=1):
        lines.append(f"{i}. {step}")
    lines.append("")

    related = lesson.get("related_topics") or []
    if related:
        lines.append("## Same source, other syllabus angles")
        lines.append("")
        lines.append(
            "The track lists this URL more than once with different emphasis. You only need **one** pass; "
            "use the angle that matches this topic title."
        )
        lines.append("")
        for rel in related:
            lines.append(
                f"- **{rel.get('lesson')}** — {rel.get('section_label', 'Syllabus')} "
                f"(checklist #{rel.get('order')}, course {rel.get('course')})"
            )
        lines.append("")

    resources = lesson.get("resources") or []
    extra = [r for r in resources if (r.get("url") or "").strip() != primary_url]
    if extra:
        lines.append("## Additional free resources")
        lines.append("")
        for r in extra[:8]:
            url = (r.get("url") or "").strip()
            label = r.get("title") or "Resource"
            desc = r.get("description") or r.get("type", "link")
            if url.startswith("http"):
                lines.append(f"- [{label}]({url}) — {desc}")
            else:
                lines.append(f"- {label}")
        lines.append("")

    lines.append("## How you know you are done")
    lines.append("")
    for item in _completion_checklist(ltype, lesson):
        lines.append(f"- [ ] {item}")
    lines.append("")

    if primary_url.startswith("http"):
        lines.append(f"[Open primary source ↗]({primary_url})")

    return "\n".join(lines)


def _append_five_layer_study_guide(
    lines: list[str],
    hint: dict,
    gmap: dict[str, dict],
) -> None:
    lines.append("## Study guide (five layers)")
    lines.append("")
    if hint.get("one_liner"):
        lines.append("### 1. In one sentence")
        lines.append("")
        lines.append(hint["one_liner"])
        lines.append("")
    if hint.get("why_now"):
        lines.append("### 2. Why now in the track")
        lines.append("")
        lines.append(hint["why_now"])
        lines.append("")
    concepts = hint.get("concepts") or []
    if concepts:
        lines.append("### 3. Core concepts")
        lines.append("")
        for cid in concepts:
            entry = gmap.get(cid)
            if entry:
                lines.append(
                    f"- **{entry.get('term', cid)}** — {entry.get('definition', '')} "
                    f"_DE angle:_ {entry.get('de_analogy', '')}"
                )
            else:
                lines.append(f"- **{cid}**")
        lines.append("")
    if hint.get("capstone_action"):
        lines.append("### 4. On the capstone repo")
        lines.append("")
        lines.append(hint["capstone_action"])
        lines.append("")
    if hint.get("done_when"):
        lines.append("### 5. Done when")
        lines.append("")
        lines.append(hint["done_when"])
        lines.append("")
    watch = hint.get("watch_for") or []
    if watch:
        lines.append("### Watch for")
        lines.append("")
        for w in watch:
            lines.append(f"- {w}")
        lines.append("")
    read_sec = hint.get("read_sections") or []
    if read_sec:
        lines.append("### Read these sections")
        lines.append("")
        for s in read_sec:
            lines.append(f"- {s}")
        lines.append("")


def _append_prove_acceptance(
    lines: list[str],
    prove_pack: dict,
    prove_criteria: str | None,
) -> None:
    if not prove_pack and not prove_criteria:
        return
    lines.append("## Prove acceptance (rubric)")
    lines.append("")
    if prove_criteria:
        lines.append(f"**Syllabus line:** {prove_criteria}")
        lines.append("")
    title = prove_pack.get("title")
    if title:
        lines.append(f"**{title}**")
        lines.append("")
    acceptance = prove_pack.get("acceptance") or []
    if acceptance:
        lines.append("| Criterion | Required |")
        lines.append("| --- | --- |")
        for row in acceptance:
            req = "Yes" if row.get("required") else "Optional"
            lines.append(f"| {row.get('criterion', '')} | {req} |")
        lines.append("")
    example = (prove_pack.get("readme_example") or "").strip()
    if example:
        lines.append("**Example README snippet**")
        lines.append("")
        lines.append("```markdown")
        lines.append(example)
        lines.append("```")
        lines.append("")
    commands = prove_pack.get("commands") or []
    if commands:
        lines.append("**Suggested commands**")
        lines.append("")
        for cmd in commands:
            lines.append(f"- `{cmd}`")
        lines.append("")


def _display_title(lesson: dict) -> str:
    title = lesson.get("lesson") or "Topic"
    if title == "Prove gate" and lesson.get("prove_criteria"):
        return f"Prove: {lesson['prove_criteria']}"
    return title


def _study_steps(ltype: str, title: str) -> list[str]:
    if ltype == "Video":
        return [
            f"Skim the syllabus heading for **{title}** and note the timestamp or module name you need.",
            "Watch at 1× with pauses; capture architecture sketches, failure modes, and one production constraint.",
            "Write three bullets: what to log, what to test, what you would ban in code review.",
            "Mark complete when this topic's objective is met (not the entire playlist or course).",
        ]
    if ltype == "Read":
        return [
            f"Open the primary doc for **{title}**; scan headings and jump to sections tied to this course month.",
            "Extract APIs, invariants, and anti-patterns — not trivia.",
            "Decide adopt now / experiment / defer with one sentence of rationale.",
            "Link any code spike or ADR in Lab & Prove if you built something.",
        ]
    if ltype == "Build":
        return [
            f"Define the smallest artifact that proves **{title}** (repo change, test, or README metric).",
            "Implement with typed contracts and a regression test or golden sample.",
            "Paste the GitHub (or demo) URL under Lab & Prove.",
            "Mark complete when a reviewer could reproduce in under 10 minutes.",
        ]
    if ltype == "Prove":
        return [
            "Publish observable evidence: URL, screenshot, CI badge, or benchmark table.",
            "Paste the artifact link in Lab & Prove.",
            "Mark complete when the prove gate in the course overview is satisfied.",
        ]
    return [
        f"Clarify the outcome for **{title}** in one sentence.",
        "Complete the linked material or milestone.",
        "Capture notes in the Mentor/Notes panel if useful.",
        "Mark complete when the syllabus intent is met.",
    ]


def _completion_checklist(ltype: str, lesson: dict) -> list[str]:
    items: list[str] = []
    if lesson.get("prove_criteria"):
        items.append(lesson["prove_criteria"])
    if ltype == "Prove":
        items.append("Artifact URL saved in Lab & Prove")
    if ltype == "Build":
        items.append("Code or doc change merged with a test or README metric")
    if ltype == "Video":
        items.append("Three production bullets written (log / test / guardrail)")
    if ltype == "Read":
        items.append("One adopt/defer decision documented")
    if not items:
        items.append("You can explain this topic in a staff-level interview answer")
    return items


def _topic_blurb(ltype: str, title: str, url: str, prove_criteria: str | None) -> str:
    if ltype == "Prove" and prove_criteria:
        return (
            f"This is a **prove gate**, not a lecture. Your job is to ship **observable evidence** for: "
            f"**{prove_criteria}**. Link the artifact under **Lab & Prove** when ready."
        )
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
    return f"Complete **{title}** per the syllabus, then mark the topic done when you can explain it aloud."
