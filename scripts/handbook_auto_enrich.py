"""Expand handbook rows — terse staff-engineer depth (no repeated boilerplate tables)."""

from __future__ import annotations

from typing import Any

MIN_INTERMEDIATE_CHARS = 520
MIN_ADVANCED_CHARS = 520

_ENRICH_MARKERS: tuple[str, ...] = (
    "### Implementation depth — order",
    "### Platform judgment — order",
    "| Data engineering concept |",
    "### Rollout checklist (repo, not notebook)",
    "### Metrics and alerts (platform depth)",
)

_COURSE_DE_LENS: dict[str, str] = {
    "0": "bronze ingestion with schema contracts and golden-set DQ",
    "1": "gateway routing, token accounting, and deterministic I/O boundaries",
    "2": "orchestrated state machines with HITL approval steps",
    "3": "audited tool RPC (MCP) with least-privilege data access",
    "4": "hybrid retrieval pipelines measured like index tuning",
    "5": "document bronze layer: parse → chunk → jsonl contracts",
    "6": "graph validation slice alongside vector retrieval",
    "7": "golden-set regression harness for nondeterministic outputs",
    "8": "CI merge gates on eval regressions",
    "9": "policy enforcement and distributed traces on agent paths",
    "10": "integration: gateway + graph + tools + retrieval + evals",
    "11": "deployable services with health checks and platform docs",
    "12": "lineage from chunk → model call → persisted field",
    "13": "time-boxed frontier spikes with measured tradeoff tables",
    "14": "public architecture narrative backed by repo metrics",
    "15": "system-design drills using your capstone as reference",
}

_TYPE_ACTIONS: dict[str, str] = {
    "Video": "Foundations → Lecture. Ship one code or test change tied to the video; log metric + test + review gate in `DEVLOG.md`.",
    "Read": "Mirror one doc section in repo (config, validator, or test). Pin versions in `pyproject.toml`.",
    "Build": "Feature branch, pytest proof, README command under 10 minutes for reviewers.",
    "Prove": "Tag/CI/benchmark URL in Lab & Prove; map to rubric line in PR description.",
    "Capstone": "End-to-end smoke with numbers (latency, cost, eval %, recall@k).",
    "Frontier": "Spike ≤1 weekend; README go/no-go + one metric; behind feature flag.",
    "Do": "RUNBOOK.md with commands, rollback, idempotency notes.",
}


def _strip_enrich_boilerplate(text: str) -> str:
    out = (text or "").strip()
    for marker in _ENRICH_MARKERS:
        idx = out.find(marker)
        if idx >= 0:
            out = out[:idx].rstrip()
    return out


def _build_intermediate(order: int, lesson: dict, entry: dict) -> str:
    course = str(lesson.get("course", "?"))
    ltype = lesson.get("type") or "Read"
    title = lesson.get("lesson") or f"Topic {order}"
    lens = _COURSE_DE_LENS.get(course, "capstone increment")
    action = _TYPE_ACTIONS.get(ltype, _TYPE_ACTIONS["Read"])
    cap = (entry.get("capstone_action") or "").strip()
    lines = [
        f"**Order {order} · {title}**",
        "",
        f"**Scope this month:** {lens}.",
        f"**Execution:** {action}",
    ]
    if cap:
        lines.append(f"**Prove hook:** {cap}")
    fms = entry.get("failure_modes") or []
    if fms:
        lines.append("")
        lines.append("**Test in CI:** " + "; ".join(fms[:3]))
    return "\n".join(lines)


def _build_advanced(order: int, lesson: dict, entry: dict) -> str:
    mental = (entry.get("mental_model") or "").strip()
    why = (entry.get("why_now") or "").strip()
    parts = [why] if why else []
    if mental:
        parts.append(f"**Invariant:** {mental}")
    parts.append(
        "**Defaults:** fail-closed schema at boundary; gateway owns routing and spend; "
        "no tool write without policy + audit; block merge on eval regression."
    )
    prompts = entry.get("interview_prompts") or []
    if prompts:
        parts.append("**Staff prompts:** " + " | ".join(prompts[:2]))
    done = (entry.get("done_when") or "").strip()
    if done:
        parts.append(f"**Done:** {done}")
    return "\n\n".join(parts)


def _ensure_length(existing: str, minimum: int, supplement: str) -> str:
    base = (existing or "").strip()
    if len(base) >= minimum:
        return base
    if base:
        return f"{base}\n\n{supplement}"
    return supplement


def enrich_entry(order: int, entry: dict[str, Any], lesson: dict[str, Any]) -> dict[str, Any]:
    out = dict(entry)
    lesson = lesson or {"order": order, "course": "0", "type": "Read", "lesson": f"Topic {order}"}

    out["intermediate_deep_dive"] = _strip_enrich_boilerplate(out.get("intermediate_deep_dive") or "")
    out["advanced_extra"] = _strip_enrich_boilerplate(out.get("advanced_extra") or "")

    inter_sup = _build_intermediate(order, lesson, out)
    adv_sup = _build_advanced(order, lesson, out)

    out["intermediate_deep_dive"] = _ensure_length(out["intermediate_deep_dive"], MIN_INTERMEDIATE_CHARS, inter_sup)
    out["advanced_extra"] = _ensure_length(out["advanced_extra"], MIN_ADVANCED_CHARS, adv_sup)
    return out


def enrich_all(merged: dict[int, dict[str, Any]], lessons_by_order: dict[int, dict[str, Any]]) -> dict[int, dict[str, Any]]:
    return {order: enrich_entry(order, entry, lessons_by_order.get(order, {})) for order, entry in merged.items()}
