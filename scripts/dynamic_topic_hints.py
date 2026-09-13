"""Fill and enrich topic hints for every lesson (all audiences)."""

from __future__ import annotations

import re
from typing import Any

from curriculum_enrichment import concept_map_for_course, prove_pack_for_course
from enrichment_utils import lesson_stable_key, normalize_lesson_title, token_set

# Glossary concept ids to attach when title/url matches these tokens
_CONCEPT_KEYWORDS: list[tuple[str, str]] = [
    (r"litellm|gateway|router|proxy", "litellm"),
    (r"instructor|pydantic|schema|structured", "structured_output"),
    (r"langgraph|langchain|agent|orchestr", "langgraph"),
    (r"mcp|tool", "mcp"),
    (r"eval|golden|ragas|deepeval|hamel", "golden_set"),
    (r"retriev|rag|embed|vector|hybrid|bm25|qdrant|pgvector", "rag"),
    (r"chunk|docling|llamaparse|pars", "embedding"),
    (r"graph|cypher|neo4j|graphrag", "agent"),
    (r"opa|policy|rego", "audit_log"),
    (r"langfuse|trace|otel|observ", "ttft"),
    (r"checkpoint|interrupt|hitl", "hitl"),
    (r"vllm|dspy|cache|caching", "fallback"),
    (r"karpathy|transformer|attention|llm", "inference"),
    (r"deploy|kubernetes|helm|argo", "gateway"),
    (r"lineage|openlineage", "audit_log"),
]

_DOMAIN_BLURBS: list[tuple[str, str, list[str]]] = [
    (
        r"deeplearning\.ai|short-courses",
        "DeepLearning.AI short course in the browser—complete only the modules that match this syllabus line.",
        ["inference", "structured_output"],
    ),
    (
        r"anthropic\.com",
        "Anthropic engineering writing on agents, prompts, and production patterns.",
        ["agent", "sampling"],
    ),
    (
        r"langchain|langgraph",
        "LangChain ecosystem docs and courses on graphs, tools, and agent runtime.",
        ["langgraph", "agent"],
    ),
    (
        r"modelcontextprotocol|mcp\.",
        "Model Context Protocol—how agents discover and call tools safely.",
        ["mcp", "tool_schema"],
    ),
    (
        r"confident-ai|deepeval",
        "DeepEval: pytest-style LLM evaluations for CI pipelines.",
        ["golden_set", "eval_harness"],
    ),
    (
        r"ragas\.io|ragas",
        "Ragas metrics for RAG quality (faithfulness, context precision).",
        ["golden_set", "rag"],
    ),
    (
        r"qdrant|pinecone|weaviate|pgvector",
        "Vector or hybrid retrieval storage—where embeddings are indexed and queried.",
        ["embedding", "rag"],
    ),
    (
        r"neo4j|graphacademy|cypher",
        "Graph database concepts for relationship-heavy validation (not always full GraphRAG).",
        ["agent"],
    ),
    (
        r"openpolicyagent|opa",
        "Open Policy Agent—policy-as-code to allow/deny tool and write operations.",
        ["audit_log"],
    ),
    (
        r"langfuse",
        "LLM observability: traces, costs, and debugging multi-step runs.",
        ["ttft"],
    ),
    (
        r"openlineage",
        "OpenLineage standard for job/run/dataset lineage events.",
        ["audit_log"],
    ),
    (
        r"kubernetes\.io|helm\.sh|argo-cd",
        "Kubernetes deployment patterns for serving agents and gateways.",
        ["gateway"],
    ),
    (
        r"youtube\.com|youtu\.be",
        "Video lesson—use the Theory tab first, then watch with the “watch for” checklist.",
        ["inference"],
    ),
    (
        r"github\.com",
        "Open-source repo or hub—skim README, focus on the pattern named in the syllabus.",
        ["structured_output"],
    ),
    (
        r"3blue1brown",
        "Visual intuition for neural nets and attention (optional math depth).",
        ["attention", "inference"],
    ),
    (
        r"statquest",
        "Gentle statistics/ML intuition videos—search the index for attention or embeddings.",
        ["embedding"],
    ),
    (
        r"chiphuyen|aie-book",
        "Chip Huyen’s AI engineering material—production framing, not research papers.",
        ["gateway", "eval_harness"],
    ),
    (
        r"docs\.vllm|vllm\.ai",
        "vLLM: high-throughput local or server inference for open models.",
        ["inference", "ttft"],
    ),
    (
        r"dspy",
        "DSPy: programmatic prompt optimization and compiled pipelines.",
        ["structured_output"],
    ),
    (
        r"unsloth|peft|huggingface\.co/docs/peft",
        "Parameter-efficient fine-tuning (LoRA/QLoRA)—when to fine-tune vs prompt.",
        ["inference"],
    ),
    (
        r"e2b\.dev",
        "Sandboxed code execution environments for tool-using agents.",
        ["agent", "mcp"],
    ),
    (
        r"guardrails|nemo",
        "Safety and policy rails around model outputs and tool use.",
        ["audit_log"],
    ),
    (
        r"ai\.engineer|youtube\.com/@ai",
        "Industry talks on shipping LLM systems—pick talks aligned with your capstone story.",
        ["gateway"],
    ),
]


def infer_concepts(title: str, url: str, ltype: str) -> list[str]:
    blob = f"{title} {url} {ltype}".lower()
    found: list[str] = []
    for pattern, cid in _CONCEPT_KEYWORDS:
        if re.search(pattern, blob):
            if cid not in found:
                found.append(cid)
    if not found:
        if ltype == "Video":
            found = ["inference"]
        elif ltype in ("Build", "Prove"):
            found = ["golden_set", "eval_harness"]
        else:
            found = ["structured_output"]
    return found[:6]


def domain_blurb(title: str, url: str) -> tuple[str, list[str]]:
    blob = f"{title} {url}".lower()
    for pattern, blurb, concepts in _DOMAIN_BLURBS:
        if re.search(pattern, blob):
            return blurb, concepts
    return "", []


def relevant_concept_map_lines(title: str, course: int | str, limit: int = 4) -> list[str]:
    cmap = concept_map_for_course(course)
    if not cmap:
        return []
    title_tokens = token_set(title)
    scored: list[tuple[int, str]] = []
    for line in cmap:
        lt = token_set(line)
        score = len(title_tokens & lt)
        scored.append((score, line))
    scored.sort(key=lambda x: (-x[0], x[1]))
    if scored[0][0] > 0:
        return [s[1] for s in scored[:limit]]
    return cmap[:limit]


def complete_hint(lesson: dict, override: dict[str, Any] | None) -> dict[str, Any]:
    """Merge manual override with dynamic fields so every lesson has a full hint."""
    override = dict(override or {})
    title = lesson.get("lesson") or "Topic"
    url = (lesson.get("url") or "").strip()
    ltype = lesson.get("type") or "Read"
    course = lesson.get("course", 0)
    section = (lesson.get("section") or "").lower()
    outcomes = lesson.get("_course_outcomes") or []  # optional inject from builder
    prove_criteria = lesson.get("prove_criteria")
    pack = prove_pack_for_course(course)

    hint: dict[str, Any] = {}

    blurb, domain_concepts = domain_blurb(title, url)
    concepts = override.get("concepts") or infer_concepts(title, url, ltype)
    if domain_concepts:
        for c in domain_concepts:
            if c not in concepts:
                concepts.insert(0, c)
        concepts = concepts[:6]

    hint["concepts"] = concepts

    if override.get("one_liner"):
        hint["one_liner"] = override["one_liner"]
    elif not url:
        hint["one_liner"] = _no_url_one_liner(title, ltype, prove_criteria, pack)
    elif blurb:
        hint["one_liner"] = f"{blurb} Syllabus focus: **{title}**."
    else:
        hint["one_liner"] = (
            f"**{title}** — {ltype.lower()} material for Course {course} on the reconciliation capstone track."
        )

    if override.get("why_now"):
        hint["why_now"] = override["why_now"]
    else:
        cmap_lines = relevant_concept_map_lines(title, course, 2)
        outcome_bit = outcomes[0] if outcomes else ""
        if cmap_lines:
            hint["why_now"] = (
                f"Course {course} is wiring **{cmap_lines[0].split(':')[0].split('—')[0][:80]}** "
                f"into your repo. {outcome_bit}"
            ).strip()
        elif outcome_bit:
            hint["why_now"] = f"This month’s outcome: {outcome_bit}"
        else:
            hint["why_now"] = (
                f"Placed in Course {course} so each capability stacks into one portfolio narrative—not a loose reading list."
            )

    if override.get("watch_for"):
        hint["watch_for"] = override["watch_for"]
    elif ltype == "Video" or section == "watch":
        hint["watch_for"] = [
            "Definitions in plain language (pause and write them down)",
            "One production constraint the speaker mentions",
            "One failure mode or ‘don’t do this’ moment",
            "How this connects to typed extraction, agents, or evals",
        ]

    if override.get("read_sections"):
        hint["read_sections"] = override["read_sections"]
    elif ltype == "Read" or section == "read":
        hint["read_sections"] = [
            f"Sections that match **{title}** in the doc TOC",
            "API or config tables you would copy into your repo",
            "Limits, quotas, and error codes",
        ]

    if override.get("capstone_action"):
        hint["capstone_action"] = override["capstone_action"]
    else:
        hint["capstone_action"] = _capstone_action(title, ltype, prove_criteria, pack, cmap_lines)

    if override.get("done_when"):
        hint["done_when"] = override["done_when"]
    else:
        hint["done_when"] = _done_when(title, ltype, prove_criteria, pack)

    for key in ("watch_for", "read_sections", "beginner_extra", "advanced_extra"):
        if key in override:
            hint[key] = override[key]

    return hint


def _no_url_one_liner(title: str, ltype: str, prove_criteria: str | None, pack: dict) -> str:
    if ltype == "Prove":
        crit = prove_criteria or pack.get("title") or "course prove gate"
        return f"**Prove gate** — ship verifiable evidence: {crit}"
    if ltype == "Build":
        return f"**Build milestone** — implement in your capstone repo: {title}"
    if ltype == "Capstone":
        return f"**Capstone layer** — integrate into the end-to-end platform: {title}"
    return f"**{title}** — complete the syllabus milestone for this course."


def _capstone_action(
    title: str,
    ltype: str,
    prove_criteria: str | None,
    pack: dict,
    cmap_lines: list[str],
) -> str:
    if ltype == "Prove" and prove_criteria:
        return f"Publish artifact satisfying: {prove_criteria}. Paste URL in **Lab & Prove**."
    if ltype == "Prove":
        acc = [a["criterion"] for a in (pack.get("acceptance") or []) if a.get("required")]
        if acc:
            return f"Meet prove pack: {acc[0]}"
    if ltype in ("Build", "Capstone"):
        return f"In your repo: {title}. Commit with tests or README metrics."
    if cmap_lines:
        return f"Connect this reading to: {cmap_lines[0]}"
    return "Add a short README note: what you adopted from this topic."


def _done_when(title: str, ltype: str, prove_criteria: str | None, pack: dict) -> str:
    if ltype == "Prove":
        return prove_criteria or "Course overview **Prove acceptance** table is satisfied and URL is saved."
    if ltype == "Build":
        return "A reviewer can follow README steps and see the change in under 10 minutes."
    if ltype == "Video":
        return "You can explain the main idea aloud and you have 3 bullets (log / test / guardrail)."
    if ltype == "Read":
        return "You wrote adopt vs defer for one pattern, and linked repo evidence if you built something."
    return "You can place this topic on the capstone architecture diagram for your course month."
