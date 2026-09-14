"""Expand handbook rows to senior-DE depth (intermediate + advanced) using track metadata."""

from __future__ import annotations

from typing import Any

MIN_INTERMEDIATE_CHARS = 720
MIN_ADVANCED_CHARS = 720

_COURSE_DE_LENS: dict[str, str] = {
    "0": "bronze ingestion with schema contracts and golden-set DQ",
    "1": "gateway routing, token accounting, and deterministic I/O boundaries",
    "2": "orchestrated state machines with HITL approval steps",
    "3": "audited tool RPC (MCP) with least-privilege data access",
    "4": "hybrid retrieval pipelines measured like index tuning",
    "5": "document bronze layer: parse → chunk → jsonl contracts",
    "6": "graph validation slice alongside vector retrieval",
    "7": "golden-set regression harness for nondeterministic outputs",
    "8": "CI merge gates on eval regressions (same muscle as DQ in Airflow)",
    "9": "policy enforcement and distributed traces on agent paths",
    "10": "integration wiring: gateway + graph + tools + retrieval + evals",
    "11": "deployable services with health checks and platform docs",
    "12": "lineage from chunk → model call → persisted field",
    "13": "time-boxed frontier spikes with measured tradeoff tables",
    "14": "public architecture narrative backed by repo metrics",
    "15": "system-design drills using your capstone as the reference system",
}

_TYPE_ROLLOUT: dict[str, list[str]] = {
    "Video": [
        "Skim the **Theory → Foundations** tab first; the lecture is Step 2, not Step 1.",
        "Pause every ~20 minutes and write one bullet: **what to log**, **what to test**, **what to block in code review**.",
        "Map one scene from the video to a function or module in your portfolio repo (even a stub with a TODO and test).",
        "End with a 5-line ADR snippet in `docs/adr/` or README: decision, alternatives, consequences.",
    ],
    "Read": [
        "Open the primary doc with your repo beside it—implement or adjust **one** config, test, or module per major section.",
        "Copy exact API names and defaults into code comments only when they affect behavior (timeouts, retries, limits).",
        "Add a `TROUBLESHOOTING.md` line for each failure mode the doc mentions that you have seen in logs.",
        "Cross-check the official doc against your gateway/graph version pins in `pyproject.toml` or lockfile.",
    ],
    "Build": [
        "Branch from main; keep the change scoped to this syllabus line’s acceptance criteria.",
        "Add or extend pytest coverage for the new path—no merge without a failing-then-passing test if behavior changed.",
        "Update README with a copy-paste command a reviewer can run in under 10 minutes.",
        "If the build touches schemas or tools, bump a version field and note it in the PR body.",
    ],
    "Prove": [
        "Collect evidence in one place: release tag, CI run URL, benchmark table path, or demo GIF.",
        "Paste the link in **Lab & Prove**; verify a peer can reproduce from README alone.",
        "Redact secrets; use synthetic or public data only in screenshots and logs.",
        "Explicitly map evidence to the course prove rubric row (quote the checklist item).",
    ],
    "Capstone": [
        "Treat this as a **release gate**, not a note-taking exercise—artifact must exist in git.",
        "Run the full smoke path: ingest → extract/retrieve → validate → respond (whatever applies this month).",
        "Attach metrics: latency, cost, eval pass rate, or recall@k—pick what the month optimizes.",
    ],
    "Frontier": [
        "Time-box to a spike (≤1 weekend); ship a README section with **go / no-go** and one metric.",
        "Do not fork the capstone—add a module or flag behind `ENABLE_FRONTIER=1`.",
    ],
    "Do": [
        "Operational task: document commands, env vars, and rollback in `RUNBOOK.md`.",
        "Verify idempotency if the task touches data or deploy state.",
    ],
}


def _de_table(course: str, ltype: str) -> str:
    lens = _COURSE_DE_LENS.get(course, "production platform increment on the capstone repo")
    return (
        "| Data engineering concept | This topic’s AI platform mirror |\n"
        "| --- | --- |\n"
        f"| Pipeline stage ownership | You own **{lens}** for this month |\n"
        "| Data contract | Pydantic / JSON Schema at the model boundary |\n"
        "| DQ / regression | Golden set + pytest (+ eval CI later) |\n"
        "| Observability | Structured logs; traces in Course 9+ |\n"
        f"| Lesson type **{ltype}** | Follow the rollout checklist below in repo, not only in notes |\n"
    )


def _rollout_checklist(lesson: dict, entry: dict) -> str:
    ltype = lesson.get("type") or "Read"
    steps = _TYPE_ROLLOUT.get(ltype, _TYPE_ROLLOUT["Read"])
    lines = ["### Rollout checklist (repo, not notebook)", ""]
    for i, step in enumerate(steps, 1):
        lines.append(f"{i}. {step}")
    action = (entry.get("capstone_action") or "").strip()
    if action:
        lines.append(f"{len(steps) + 1}. **Capstone hook:** {action}")
    return "\n".join(lines)


def _primary_source_drill(lesson: dict) -> str:
    url = (lesson.get("url") or "").strip()
    title = lesson.get("lesson") or "Primary source"
    if not url.startswith("http"):
        return (
            "### Primary source\n\n"
            "No external URL on this row—use the **Lab & Prove** tab and course overview map as the source of truth."
        )
    return (
        "### Primary source (read with intent)\n\n"
        f"- **Link:** [{title}]({url})\n"
        "- Highlight every **limit**, **default**, and **retry** the doc mentions; mirror them in code.\n"
        "- If the doc is a video index or channel, pick **one** item tied to this topic and log title + URL in `DEVLOG.md`.\n"
        "- Prefer official docs over random blog posts when both exist; blogs are for analogies only.\n"
    )


def _failure_expansion(entry: dict) -> str:
    fms = entry.get("failure_modes") or []
    if not fms:
        return ""
    lines = ["### Failure modes to rehearse in tests", ""]
    for fm in fms:
        lines.append(f"- {fm}")
    lines.append(
        "\nFor each item above, add either a pytest case, a chaos/injection test, or a runbook step—"
        "documentation alone is not a control."
    )
    return "\n".join(lines)


def _metrics_block(course: str, ltype: str) -> str:
    return (
        "### Metrics and alerts (platform depth)\n\n"
        "| Metric | Why it matters | Starter threshold (tune on your golden set) |\n"
        "| --- | --- | --- |\n"
        "| `schema_pass_rate` | Contract enforcement | ≥ 95% on golden set before expanding scope |\n"
        "| `p95_latency_ms` | User-facing SLO | Track per model route after Course 1 |\n"
        "| `cost_usd_per_1k_records` | FinOps | Alert on 2× weekly median |\n"
        "| `retry_rate` | Prompt/model health | Investigate if > 15% on extraction |\n"
        f"| Course **{course}** focus | Align dashboard to month prove gate | See course acceptance checklist |\n"
    )


def _security_block(ltype: str) -> str:
    return (
        "### Security and data handling\n\n"
        "- Classify inputs before they leave your VPC (even in a personal repo, practice the habit).\n"
        "- Never log raw prompts containing secrets; hash or truncate identifiers.\n"
        "- Treat tool calls and SQL/API reads as **production writes** for audit purposes.\n"
        f"- For **{ltype}** rows, note in README which data classes are allowed in demos.\n"
    )


def _build_intermediate(order: int, lesson: dict, entry: dict) -> str:
    course = str(lesson.get("course", "?"))
    title = lesson.get("lesson") or f"Topic {order}"
    one = (entry.get("one_liner") or title).strip()
    parts = [
        f"### Implementation depth — order {order}: {title}",
        "",
        one,
        "",
        _de_table(course, lesson.get("type") or "Read"),
        "",
        _rollout_checklist(lesson, entry),
        "",
        _primary_source_drill(lesson),
    ]
    extra = _failure_expansion(entry)
    if extra:
        parts.extend(["", extra])
    return "\n".join(parts)


def _build_advanced(order: int, lesson: dict, entry: dict) -> str:
    course = str(lesson.get("course", "?"))
    why = (entry.get("why_now") or "").strip()
    mental = (entry.get("mental_model") or "").strip()
    parts = [
        f"### Platform judgment — order {order}",
        "",
        why or "This topic exists to harden the capstone for senior review—not to add buzzwords.",
        "",
    ]
    if mental:
        parts.extend(["**Architecture anchor:** " + mental, ""])
    parts.extend(
        [
            _metrics_block(course, lesson.get("type") or "Read"),
            "",
            _security_block(lesson.get("type") or "Read"),
            "",
            "### Tradeoffs (default stance until evals prove otherwise)",
            "",
            "| Decision | Default for 7+ YOE DE | When to revisit |",
            "| --- | --- | --- |",
            "| Build vs buy | API model + gateway + harness | Self-host only with TTFT/cost proof |",
            "| Strict schema vs fuzzy parse | Fail closed at boundary | Relax only inside trusted zones |",
            "| Single agent vs multi-agent | One graph until evals plateau | Split when tool domains are isolated |",
            "| Vector-only RAG | Hybrid + benchmarks (Course 4+) | After measured recall@k gains |",
            "",
        ]
    )
    prompts = entry.get("interview_prompts") or []
    if prompts:
        parts.append("### Staff-level interview prompts (answer with your repo as evidence)")
        parts.append("")
        for p in prompts:
            parts.append(f"- {p}")
    done = (entry.get("done_when") or "").strip()
    if done:
        parts.extend(["", f"**Done when (advanced):** {done}"])
    return "\n".join(parts)


def _ensure_length(existing: str, minimum: int, supplement: str) -> str:
    text = (existing or "").strip()
    if len(text) >= minimum:
        return text
    if text:
        return f"{text}\n\n{supplement}"
    return supplement


def enrich_entry(order: int, entry: dict[str, Any], lesson: dict[str, Any]) -> dict[str, Any]:
    """Return handbook row with intermediate/advanced sections at senior depth."""
    out = dict(entry)
    lesson = lesson or {"order": order, "course": "0", "type": "Read", "lesson": f"Topic {order}"}
    inter_sup = _build_intermediate(order, lesson, out)
    adv_sup = _build_advanced(order, lesson, out)
    out["intermediate_deep_dive"] = _ensure_length(
        out.get("intermediate_deep_dive") or "",
        MIN_INTERMEDIATE_CHARS,
        inter_sup,
    )
    out["advanced_extra"] = _ensure_length(
        out.get("advanced_extra") or "",
        MIN_ADVANCED_CHARS,
        adv_sup,
    )
    return out


def enrich_all(merged: dict[int, dict[str, Any]], lessons_by_order: dict[int, dict[str, Any]]) -> dict[int, dict[str, Any]]:
    return {order: enrich_entry(order, entry, lessons_by_order.get(order, {})) for order, entry in merged.items()}
