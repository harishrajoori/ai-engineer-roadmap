"""Per-topic depth for five-layer theory cards (URL match, then type fallback)."""

from __future__ import annotations

import re
from typing import Any

from dynamic_topic_hints import complete_hint
from enrichment_utils import normalize_lesson_title
from topic_handbook import merge_handbook_into_hint

# Keys: normalized URL (lowercase, no trailing slash) or "type:Video" / "course:0|type:Read"
_HINTS: dict[str, dict[str, Any]] = {
    "https://www.youtube.com/watch?v=zjkbmfhnj_g": {
        "one_liner": "A plain-language tour of what LLMs are, how they are trained, and how inference works.",
        "why_now": "Before writing extraction code, you need a mental picture of tokens, context limits, and why models hallucinate.",
        "concepts": ["token", "context_window", "inference", "hallucination"],
        "watch_for": ["How text becomes tokens", "What the model sees at inference time", "Limits of memorization vs reasoning"],
        "capstone_action": "In README, add 3 bullets: one failure mode, one thing you would log, one test you would add.",
        "done_when": "You can explain to a data engineer what an LLM is without saying “AI magic.”",
        "beginner_extra": (
            "An LLM does not “look up” your warehouse. It predicts the next piece of text from patterns "
            "learned during training. That is why it can sound right and still be wrong—like a bad join "
            "that returns a plausible row."
        ),
        "advanced_extra": (
            "Platform framing after this video: inference is a **stateless, rate-limited API** with "
            "unbounded tail latency. Your extraction service should set max tokens, timeout, and "
            "post-validate every response. Pretraining vs fine-tuning vs prompting: you will almost "
            "always ship **prompt + schema** first; defer training until golden-set metrics plateau."
        ),
    },
    "https://www.youtube.com/watch?v=7xtgnnlpymi": {
        "one_liner": "Deep dive into transformers, KV cache, and how chat models run in production.",
        "why_now": "Course 1 connects gateway cost and latency to what actually happens inside the model stack.",
        "concepts": ["transformer", "token", "ttft", "attention", "inference"],
        "watch_for": ["Transformer block at a high level", "Why context length matters for cost", "Sampling knobs (temperature)"],
        "beginner_extra": (
            "Read the studio **Foundations** and **Visual guide** before pressing play. "
            "Prefill (whole prompt) drives TTFT; decode (one token at a time) drives completion tokens. "
            "KV cache is why generation gets cheaper per step after the first token—not magic memory."
        ),
        "capstone_action": "Log `prompt_tokens`, `completion_tokens`, and wall-clock latency for one CLI call.",
        "done_when": "You can relate P99 latency to token volume in one paragraph.",
        "advanced_extra": (
            "Use the deep dive to connect **transformer inference** to dollars: KV cache, batching, and "
            "sequence length drive memory and TTFT. For extraction workloads, prefer **short structured "
            "outputs** over long chain-of-thought in production. Document which layers of the stack you "
            "**own** (gateway, prompts, evals) vs which you **buy** (frontier API). Optional code depth: "
            "docs/OPTIONAL_MODEL_DEPTH.md."
        ),
    },
    "https://python.useinstructor.com": {
        "one_liner": "Library that forces LLM outputs into Pydantic models with retries on validation errors.",
        "why_now": "Boot week: your reconciler must return typed JSON, not free-form text.",
        "concepts": ["structured_output", "pydantic", "golden_set"],
        "read_sections": ["Quick start", "Retries", "Partial validation"],
        "capstone_action": "Implement `extract(record) -> LogEvent` with max 3 retries on `ValidationError`.",
        "done_when": "Golden set reports valid JSON % on `data/golden/`.",
    },
    "https://docs.pydantic.dev/latest/concepts/models/": {
        "one_liner": "Data validation and settings layer—your schema contract for LLM outputs.",
        "why_now": "Same role as warehouse column types: reject bad shapes before they hit downstream tables.",
        "concepts": ["pydantic", "structured_output", "invariant"],
        "read_sections": ["Models", "Validators", "Model validators"],
        "capstone_action": "Add one `@model_validator` for a business rule (e.g. non-negative amount).",
        "done_when": "Invalid rows fail fast with a clear validation error message.",
    },
    "https://docs.litellm.ai/docs/completion/reliable_completions": {
        "one_liner": "Fallback chains and reliability patterns when a provider rate-limits or errors.",
        "why_now": "After single-model extraction works, production needs failover—not a 3am pages for 429s.",
        "concepts": ["litellm", "fallback", "gateway"],
        "read_sections": ["Reliable completions", "Fallbacks", "Timeouts"],
        "capstone_action": "Configure primary + fallback model list; log which model served each request.",
        "done_when": "README shows one forced failure switching to fallback successfully.",
    },
    "https://hamel.dev/blog/posts/evals": {
        "one_liner": "How to think about evals: golden sets, tiers, and what to measure before launch.",
        "why_now": "Introduces the eval mindset used again in Courses 7–8 (harness + CI).",
        "concepts": ["golden_set", "eval_harness", "regression"],
        "read_sections": ["Why evals", "Building a golden set", "What not to do"],
        "capstone_action": "Create `data/golden/` with ≥10 labeled log snippets and expected JSON.",
        "done_when": "`scripts/score.py` prints valid % and you trust the labels.",
    },
    "https://applied-llms.org": {
        "one_liner": "Open handbook for production LLM systems—architecture patterns, not math homework.",
        "why_now": "Re-read different sections each month; it anchors staff-level tradeoff language.",
        "concepts": ["gateway", "rag", "eval_harness", "agent"],
        "read_sections": ["Pick sections listed in the syllabus checkbox title"],
        "capstone_action": "One ADR-style note in README: pattern adopted, pattern deferred.",
        "done_when": "You can cite one Applied LLMs idea in a design review sentence.",
    },
    "https://langchain-ai.github.io/langgraph": {
        "one_liner": "State-machine orchestration for agents: nodes, edges, checkpoints, human interrupts.",
        "why_now": "Course 2 wraps your reconciler in a graph with HITL on validation failure.",
        "concepts": ["langgraph", "checkpoint", "hitl", "agent"],
        "read_sections": ["Concepts", "Persistence", "Interrupts"],
        "capstone_action": "Package `reconciler-agent` with SQLite/Postgres checkpointer and `interrupt()` on fail path.",
        "done_when": "README GIF or steps: fail → interrupt → human fix → resume.",
    },
    "https://www.deeplearning.ai/short-courses/pydantic-for-llm-workflows": {
        "one_liner": "Short course on using Pydantic models so LLM outputs are typed JSON you can trust in pipelines.",
        "why_now": "Right after Karpathy intro—connects ‘messy text out’ to ‘schema-shaped data’ like a warehouse contract.",
        "concepts": ["pydantic", "structured_output", "invariant"],
        "watch_for": ["Defining a model", "Validation errors", "When to retry vs fix the prompt"],
        "capstone_action": "Mirror one pattern from the course in your `extract()` function.",
        "done_when": "You can draw input log → Pydantic model → JSON on a napkin.",
    },
    "https://modelcontextprotocol.io/introduction": {
        "one_liner": "Open protocol for tools, resources, and prompts exposed to models via MCP servers.",
        "why_now": "Course 3—same idea as an internal API catalog, but for agent tools.",
        "concepts": ["mcp", "tool_schema", "audit_log"],
        "read_sections": ["Introduction", "Tools", "Security"],
        "capstone_action": "Ship an MCP server with audit log line per tool call (who, what, args hash).",
        "done_when": "Demo: agent calls your tool; log row is inspectable.",
    },
}

# Type defaults: concepts + checklists only — one_liner/why_now come from complete_hint(title, url).
_TYPE_FALLBACK: dict[str, dict[str, Any]] = {
    "Video": {
        "concepts": ["inference"],
        "watch_for": ["Definitions", "Failure modes", "What would you monitor in prod"],
    },
    "Read": {
        "concepts": ["structured_output"],
        "read_sections": ["Table of contents → syllabus-named sections only"],
    },
    "Build": {
        "concepts": ["golden_set", "eval_harness"],
    },
    "Prove": {
        "concepts": ["golden_set", "regression"],
    },
}


def _norm_url(url: str) -> str:
    u = (url or "").strip().lower().rstrip("/")
    # youtube watch URLs: normalize v= param only
    m = re.search(r"v=([a-z0-9_-]{11})", u)
    if m:
        return f"https://www.youtube.com/watch?v={m.group(1)}"
    return u


def _lookup_override(lesson: dict) -> dict[str, Any]:
    url = _norm_url(lesson.get("url") or "")
    if url and url in _HINTS:
        return dict(_HINTS[url])
    if url:
        for key, hint in _HINTS.items():
            if key in url or url in key:
                return dict(hint)

    title = normalize_lesson_title(lesson.get("lesson") or "")
    if "instructor" in title:
        return dict(_HINTS["https://python.useinstructor.com"])
    if "litellm" in title:
        return dict(_HINTS["https://docs.litellm.ai/docs/completion/reliable_completions"])
    if "langgraph" in title or "langchain academy" in title:
        return dict(_HINTS["https://langchain-ai.github.io/langgraph"])
    if "karpathy" in title and "deep" in title:
        return dict(_HINTS["https://www.youtube.com/watch?v=7xtgnnlpymi"])
    if "karpathy" in title and "intro" in title:
        return dict(_HINTS["https://www.youtube.com/watch?v=zjkbmfhnj_g"])
    if "pydantic" in title and "deeplearning" in title:
        return dict(_HINTS["https://www.deeplearning.ai/short-courses/pydantic-for-llm-workflows"])
    if "hamel" in title:
        return dict(_HINTS["https://hamel.dev/blog/posts/evals"])
    if "applied llm" in title:
        return dict(_HINTS["https://applied-llms.org"])

    ltype = lesson.get("type") or "Read"
    base = dict(_TYPE_FALLBACK.get(ltype, _TYPE_FALLBACK["Read"]))
    return base


def get_topic_hint(lesson: dict) -> dict[str, Any]:
    override = _lookup_override(lesson)
    hint = complete_hint(lesson, override)
    return merge_handbook_into_hint(lesson, hint)
