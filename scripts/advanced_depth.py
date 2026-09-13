"""Topic-specific advanced (platform-depth) theory sections — not generic boilerplate."""

from __future__ import annotations

import re
from typing import Any

from enrichment_utils import digest_matches_lesson


def _blob(lesson: dict) -> str:
    return f"{lesson.get('lesson') or ''} {(lesson.get('url') or '')}".lower()


def advanced_narrative(lesson: dict, hint: dict) -> str:
    """2–4 paragraphs of topic-specific platform depth."""
    if hint.get("advanced_extra"):
        return hint["advanced_extra"].strip()

    b = _blob(lesson)
    title = lesson.get("lesson") or "this topic"

    if "karpathy" in b and "intro" in b:
        return (
            "Treat the intro lecture as your **operating picture** for every later design review: "
            "pretraining vs inference, next-token prediction, and why scale changes behavior but not "
            "the need for validation. In platform terms, the model is a **stateless inference service** "
            "with variable latency and cost; your job is to wrap it with timeouts, budgets, and schema gates. "
            "When you size a gateway later (Course 1), map Karpathy’s ‘context window’ explanation directly "
            "to max prompt size policy and truncation strategy for log extraction."
        )
    if "karpathy" in b and ("deep" in b or "7xtg" in b):
        return (
            "Use the deep dive to connect **transformer inference** to dollars: KV cache, batching, and "
            "sequence length drive memory and TTFT. For extraction workloads, prefer **short structured "
            "outputs** over long chain-of-thought in production. Document which layers of the stack you "
            "**own** (gateway, prompts, evals) vs which you **buy** (frontier API)."
        )
    if "pydantic" in b and "deeplearning" in b:
        return (
            "The short course is about **contracts at the boundary**: model output must validate before "
            "it touches bronze tables. Advanced framing: version your schemas, migrate with dual-write "
            "or shadow validation, and never silently coerce invalid fields—fail closed and retry with "
            "a repair prompt or fallback model."
        )
    if "instructor" in b or "useinstructor" in b:
        return (
            "Instructor is your **adapter** between probabilistic text and deterministic types. "
            "Platform pattern: wrap `completion` in a function with `max_retries`, cap token spend per "
            "record, and emit structured logs on each `ValidationError`. Pair with a golden set where "
            "**semantic** errors (wrong amount) are labeled separately from **schema** errors."
        )
    if "litellm" in b:
        return (
            "LiteLLM is the **control plane** for model routing: budgets, fallbacks, and uniform logging. "
            "Design for **multi-tenant** use even in a solo repo—per-request metadata (job_id, pipeline, "
            "tenant) must flow into logs for cost chargeback. Alert on fallback rate spikes; they often "
            "indicate quality or availability regression, not healthy resilience."
        )
    if "langgraph" in b:
        return (
            "LangGraph models **long-running work** with explicit state. Compare to Airflow: checkpoints "
            "are your idempotency keys; interrupts are human approval tasks. Size state payloads; "
            "large JSON in graph memory is an ops incident waiting to happen. Define SLAs for HITL steps."
        )
    if "mcp" in b or "modelcontextprotocol" in b:
        return (
            "MCP is an **RPC surface for agents**. Security model: least-privilege tools, schema versioning, "
            "and append-only audit. Treat tool calls like **write operations** to production—even "
            "'read' tools can exfiltrate if queries are unconstrained."
        )
    if "hamel" in b or "eval" in b:
        return (
            "Evals are **regression tests for non-deterministic components**. Tier metrics: schema pass rate, "
            "task success on golden set, and cost/latency envelopes. Advanced teams block release on "
            "**composite** gates, not a single accuracy number."
        )
    if "retriev" in b or "rag" in b or "hybrid" in b:
        return (
            "Retrieval is a **data pipeline**: chunk quality dominates model choice. Measure recall@k on "
            "labeled questions; report confidence and no-answer paths. Hybrid fusion is an ops knob—"
            "document when you disable dense-only fallback."
        )
    if lesson.get("type") == "Prove":
        return (
            "Prove gates are **SLOs for learning**: evidence must be reproducible, versioned, and scoped. "
            "In staff interviews, walk reviewers through clone → command → artifact in one narrative."
        )

    return (
        f"For **{title}**, articulate how it changes your capstone’s **blast radius**: what breaks if "
        "this component fails, what you log, what you roll back, and which metric proves the month’s "
        "work is real—not checkbox complete."
    )


def failure_modes(lesson: dict, hint: dict) -> list[str]:
    if hint.get("failure_modes"):
        return list(hint["failure_modes"])
    b = _blob(lesson)
    ltype = lesson.get("type") or "Read"
    modes: list[str] = []

    digest = lesson.get("digest") or {}
    if digest_matches_lesson(lesson, digest):
        modes.extend([p for p in (digest.get("pitfalls") or []) if p][:4])

    if "litellm" in b or "gateway" in b:
        modes.extend(
            [
                "Fallback model serves 100% of traffic silently—quality drifts undetected.",
                "429 storms without client-side backoff take down the worker pool.",
                "Prompt+response logged with PII for debugging.",
            ]
        )
    elif "instructor" in b or "pydantic" in b:
        modes.extend(
            [
                "Retries exhaust budget on systematically bad prompts.",
                "JSON parses but business invariants fail (silent wrong totals).",
                "Schema loosened in prod to ‘stop alerts’ without versioning.",
            ]
        )
    elif ltype == "Video":
        modes.extend(
            [
                "Team watches 10h playlist; no golden set or gateway metric moves.",
                "Concepts understood but no written production guardrails.",
            ]
        )
    elif ltype == "Prove":
        modes.extend(
            [
                "URL points to private repo or non-reproducible demo.",
                "README metric cannot be recomputed from committed commands.",
            ]
        )
    else:
        modes.extend(
            [
                "Reading without a repo commit—no adopt/defer decision recorded.",
                "Pattern copied without test on representative failure cases.",
            ]
        )

    seen: set[str] = set()
    out: list[str] = []
    for m in modes:
        key = m[:80]
        if key not in seen:
            seen.add(key)
            out.append(m)
    return out[:6]


def metrics_and_alerts(lesson: dict) -> list[str]:
    b = _blob(lesson)
    if "litellm" in b or lesson.get("course") == 1:
        return [
            "`usd_per_request_p99`, `prompt_tokens`, `completion_tokens`, `latency_ms_p99`",
            "Alert: fallback_rate > 5% over 15m",
            "Alert: validation_error_rate spike vs 7d baseline",
        ]
    if "langgraph" in b:
        return [
            "`graph_step_latency_p99`, `checkpoint_bytes`, `interrupt_count`",
            "Alert: run stuck in interrupt > SLA",
        ]
    if "retriev" in b or "rag" in b:
        return [
            "`recall_at_5`, `no_answer_rate`, `chunk_tokens_p95`",
            "Alert: retrieval latency p99 over budget",
        ]
    if lesson.get("type") == "Prove":
        return [
            "Reviewer time-to-reproduce (target < 10 min)",
            "CI badge or metric visible in README",
        ]
    return [
        "Task success rate on golden set (tier 1)",
        "Schema validation pass rate (tier 0)",
        "Cost per 1k successful extractions",
    ]


def interview_depth(lesson: dict, hint: dict) -> list[str]:
    if hint.get("interview_prompts"):
        return list(hint["interview_prompts"])[:8]
    title = (lesson.get("lesson") or "this topic")[:70]
    ltype = lesson.get("type") or "Read"
    b = _blob(lesson)
    qs = [
        f"Draw a box diagram: where does **{title}** sit between data landing and warehouse load?",
        "What is your rollback plan if a model upgrade drops golden-set pass rate by 5%?",
        "How do you prove schema validity ≠ semantic correctness with one example?",
    ]
    if "gateway" in b or "litellm" in b:
        qs.extend(
            [
                "How do you allocate model budget per team without shared API keys?",
                "When is fallback worse than failing fast?",
            ]
        )
    if "mcp" in b:
        qs.extend(
            [
                "How do you audit tool calls for compliance without logging secrets?",
                "stdio vs SSE MCP: threat model difference in one minute.",
            ]
        )
    if ltype == "Prove":
        qs.insert(0, "Walk me through reproducing your prove artifact from a clean laptop.")
    if hint.get("concepts") and "golden_set" in hint["concepts"]:
        qs.append("How many golden cases minimum before you trust CI on prompts?")
    return qs[:8]


def decision_record_rows(lesson: dict) -> list[tuple[str, str, str]]:
    title = lesson.get("lesson") or "Topic"
    return [
        ("Adopt now", "…", f"Why {title} is in scope this month"),
        ("Experiment", "…", "What you will measure in two weeks"),
        ("Defer", "…", "What risk you accept by waiting"),
    ]


def digest_staff_synthesis(lesson: dict) -> tuple[list[str], list[str]]:
    digest = lesson.get("digest") or {}
    if not digest_matches_lesson(lesson, digest):
        return [], []
    rules = [r for r in (digest.get("rules") or []) if r]
    takeaways = [t for t in (digest.get("takeaways") or []) if t]
    return takeaways[:5], rules[:5]
