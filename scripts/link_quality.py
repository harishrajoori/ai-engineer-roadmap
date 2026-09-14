"""Curriculum link quality rules (paid hosts, shallow landing pages, read vs repo)."""

from __future__ import annotations

from urllib.parse import urlparse

# Host fragments that usually require purchase (must be syllabus-optional).
PAID_HOST_FRAGMENTS: tuple[str, ...] = (
    "learnwith.campusx.in",
    "coursera.org",
    "udemy.com",
    "pluralsight.com",
    "linkedin.com/learning",
)

# Exact URLs that are only marketing/catalog homepages — not acceptable as primary targets.
SHALLOW_PRIMARY_URLS: dict[str, str] = {
    "https://graphacademy.neo4j.com/": "https://graphacademy.neo4j.com/courses/neo4j-fundamentals/",
    "http://graphacademy.neo4j.com/": "https://graphacademy.neo4j.com/courses/neo4j-fundamentals/",
    "https://academy.langchain.com/": "https://academy.langchain.com/courses/intro-to-langgraph/",
    "https://docs.litellm.ai/": "https://docs.litellm.ai/docs/",
    "https://python.useinstructor.com/": "https://python.useinstructor.com/getting-started/",
    "https://langchain-ai.github.io/langgraph/": "https://langchain-ai.github.io/langgraph/concepts/why-langgraph/",
    "https://www.3blue1brown.com/topics/neural-networks": "https://www.3blue1brown.com/topics/neural-networks#chapter1",
}

_ALLOWED_GITHUB_FRAGMENTS: tuple[str, ...] = (
    "readme",
    "installation",
    "getting-started",
    "-installation",
)

# Applied to lesson + resource URLs at generation time (and should match track markdown).
URL_FIXES: dict[str, str] = {
    **SHALLOW_PRIMARY_URLS,
    "https://github.com/DS4SD/docling#documentation": "https://docling-project.github.io/docling/",
    "https://github.com/DS4SD/docling": "https://docling-project.github.io/docling/",
    "https://github.com/microsoft/graphrag": "https://microsoft.github.io/graphrag/",
    "https://github.com/jlowin/fastmcp": "https://gofastmcp.com/getting-started/welcome",
    "https://github.com/dottxt-ai/outlines": "https://dottxt-ai.github.io/outlines/latest/",
    "https://docs.vllm.ai/en/latest/features/prefix_caching.html": "https://docs.vllm.ai/en/latest/design/automatic_prefix_caching/",
    "https://python.useinstructor.com/concepts/retries/": "https://python.useinstructor.com/concepts/retries",
    "https://spec.modelcontextprotocol.io/": "https://modelcontextprotocol.io/specification/2025-11-25",
    "https://cohere.com/llmu/hybrid-search": "https://www.pinecone.io/learn/hybrid-search-intro/",
    "https://github.com/hands-on-llm/hands-on-large-language-models": "https://github.com/HandsOnLLM/Hands-On-Large-Language-Models",
    "https://www.kaggle.com/whitepaper-agents": "https://ai.google.dev/gemini-api/docs/agents",
    "https://temporal.io/blog/reliable-ai-agents-with-temporal": "https://docs.temporal.io/ai",
    "https://github.com/meta-llama/llama-guard": "https://github.com/meta-llama/PurpleLlama",
    "https://www.confident-ai.com/blog/how-to-set-up-llm-ci-cd-pipelines-with-deepeval": "https://docs.confident-ai.com/docs/evaluation-end-to-end-ci-cd",
    "https://staffeng.com/guides/system-design-interview/": "https://staffeng.com/guides/",
    "https://aws.amazon.com/blogs/big-data/governing-generative-ai-data-with-amazon-datazone-and-aws-lake-formation/": "https://aws.amazon.com/blogs/big-data/category/analytics/amazon-datazone/",
    "https://github.com/chiphuyen/aie-book": "https://github.com/chiphuyen/aie-book#readme",
    "https://github.com/stanfordnlp/dspy": "https://github.com/stanfordnlp/dspy#installation",
    "https://github.com/zilliztech/gptcache": "https://github.com/zilliztech/GPTCache#-installation",
    "https://github.com/NVIDIA/NeMo-Guardrails": "https://github.com/NVIDIA/NeMo-Guardrails#getting-started",
    "https://github.com/pgvector/pgvector": "https://github.com/pgvector/pgvector#installation",
}

# For Read topics: prefer official docs over raw GitHub when both exist.
READ_URL_CANONICAL: dict[str, str] = {
    "https://github.com/microsoft/graphrag": "https://microsoft.github.io/graphrag/",
    "https://github.com/DS4SD/docling": "https://docling-project.github.io/docling/",
    "https://github.com/DS4SD/docling#documentation": "https://docling-project.github.io/docling/",
    "https://github.com/docling-project/docling": "https://docling-project.github.io/docling/",
    "https://github.com/jlowin/fastmcp": "https://gofastmcp.com/getting-started/welcome",
    "https://github.com/dottxt-ai/outlines": "https://dottxt-ai.github.io/outlines/latest/",
}

# GitHub repo URL → companion docs (added as resource when primary is canonicalized).
READ_COMPANION_REPO: dict[str, str] = {
    "https://microsoft.github.io/graphrag/": "https://github.com/microsoft/graphrag",
    "https://docling-project.github.io/docling/": "https://github.com/docling-project/docling",
}


def normalize_url(url: str) -> str:
    return (url or "").strip().rstrip("/")


def is_paid_host(url: str) -> bool:
    u = (url or "").lower()
    return any(fragment in u for fragment in PAID_HOST_FRAGMENTS)


def is_github_url(url: str) -> bool:
    return "github.com" in (url or "").lower()


def canonical_read_url(url: str) -> str:
    raw = (url or "").strip()
    fixed = SHALLOW_PRIMARY_URLS.get(raw) or SHALLOW_PRIMARY_URLS.get(raw + "/")
    if fixed:
        return fixed
    return READ_URL_CANONICAL.get(raw, raw)


def access_note_for_url(url: str, required: str, optional_in_title: bool) -> str | None:
    if is_paid_host(url):
        if required == "Yes" and not optional_in_title:
            return "PAID_HOST_MARKED_REQUIRED"
        return (
            "Paid / enrollment platform — optional only. Free alternatives are listed in theory "
            "and in the official docs for this month."
        )
    return None


def validate_lesson_links(lesson: dict) -> list[str]:
    """Return human-readable issues for this lesson."""
    issues: list[str] = []
    order = lesson.get("order")
    title = lesson.get("lesson") or ""
    url = (lesson.get("url") or "").strip()
    ltype = lesson.get("type") or ""
    required = lesson.get("required") or "Yes"
    optional = "(optional)" in title.lower()

    if url in SHALLOW_PRIMARY_URLS or url.rstrip("/") + "/" in SHALLOW_PRIMARY_URLS:
        issues.append(
            f"order={order} shallow primary URL (catalog homepage only): {url} — use {SHALLOW_PRIMARY_URLS.get(url, 'deep link')}"
        )

    if is_paid_host(url):
        note = access_note_for_url(url, required, optional)
        if note == "PAID_HOST_MARKED_REQUIRED":
            issues.append(f"order={order} paid URL marked required: {title}")

    if ltype == "Read" and is_github_url(url) and url not in READ_URL_CANONICAL:
        if "#" in url:
            frag = url.split("#", 1)[1].lower()
            if not any(frag == allowed or frag.startswith(allowed) for allowed in _ALLOWED_GITHUB_FRAGMENTS):
                issues.append(f"order={order} Read topic uses GitHub fragment URL: {url}")
        if optional or "repository" in title.lower() or "repo" in title.lower():
            return issues
        slug = url.lower()
        if any(
            token in slug
            for token in (
                "pgvector",
                "unsloth",
                "nemo-guardrails",
                "aie-book",
                "ai-engineering-hub",
            )
        ):
            return issues
        companion = READ_URL_CANONICAL.get(url.split("#")[0])
        if not companion and "README" not in title.lower():
            issues.append(
                f"order={order} Read topic primary is GitHub repo without docs mirror — add docling/graphrag-style docs URL"
            )

    if ltype == "Video" and is_github_url(url):
        issues.append(f"order={order} Video lesson points at GitHub (use docs or video URL): {title}")

    for res in lesson.get("resources") or []:
        ru = (res.get("url") or "").strip()
        if ru in SHALLOW_PRIMARY_URLS:
            issues.append(f"order={order} resource shallow URL: {ru}")

    return issues
