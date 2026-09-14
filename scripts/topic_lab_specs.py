"""Hyper-specific Lab & Practice implementation lines (order + URL keyword)."""

from __future__ import annotations

from typing import Any

# order → implementation paragraph (overrides generic capstone_action when present)
_ORDER_IMPLEMENT: dict[int, str] = {
    9: (
        "Publish `https://github.com/<you>/ai-platform-lab` with `extractor.py`, `tests/test_golden.py`, "
        "and README command `pytest -q` reporting valid-json % on `data/golden/*.txt`."
    ),
    23: (
        "Tag `v0.2` with `gateway/log_usage.py` appending JSONL rows: `job_id`, `model`, `prompt_tokens`, "
        "`completion_tokens`, `latency_ms`, `estimated_usd`; README table from `python -m gateway.summarize`."
    ),
    34: (
        "Record a terminal capture of `langgraph dev` showing `interrupt()` after a forced validation failure, "
        "plus README steps to resume with corrected state."
    ),
    45: (
        "Ship `mcp_server/server.py` exposing `lookup_schema`, `query_golden_set`, `run_readonly_sql` with "
        "allow-listed tables; JSON Schema in `mcp_server/tools/*.json`."
    ),
    46: (
        "Append-only `mcp_server/audit.jsonl` with `user_id`, `tool`, `args_hash`, `ts`, `status`; "
        "pytest proves deny on non-allow-listed SQL."
    ),
    47: (
        "README section with redacted MCP client config + sample audit lines; link PR that adds the server entrypoint."
    ),
    54: (
        "Commit `data/corpus/` (public 10-K or synthetic ops md) and `scripts/ingest_corpus.py` idempotent on `doc_id`."
    ),
    56: (
        "Commit `benchmarks/retrieval.json` with columns `method`, `recall_at_5`, `n`, `git_sha`; "
        "`python scripts/benchmark_retrieval.py` reproduces numbers in README."
    ),
    77: (
        "Add `evals/golden.jsonl` with ≥30 rows and `evals/run.py` printing tier-1 schema pass rate + worst-case paths."
    ),
    82: (
        "Screenshot or link to a failing GitHub Actions run where `.github/workflows/evals.yml` blocks merge; "
        "document threshold env vars in README."
    ),
    90: (
        "Add `policy/analyst.rego` denying `write_*` tools and `tests/test_policy.sh` with `opa test policy/ -v`."
    ),
    112: (
        "Git tag `alpha` + `docs/demo.md` five-minute script listing health URL, sample trace id, eval summary line."
    ),
}


def _blob(lesson: dict) -> str:
    return f"{lesson.get('lesson') or ''} {(lesson.get('url') or '')}".lower()


def specific_implementation(lesson: dict, hint: dict[str, Any]) -> str | None:
    order = lesson.get("order")
    if order is not None and int(order) in _ORDER_IMPLEMENT:
        return _ORDER_IMPLEMENT[int(order)]

    b = _blob(lesson)
    ltype = lesson.get("type") or "Read"

    if "litellm" in b and "reliable" in b:
        return (
            "In `gateway/router.py`, configure `completion(..., fallbacks=[...])` and log `fallback_model` "
            "when the primary route errors; pytest mocks 503 from primary and asserts secondary is used."
        )
    if "litellm" in b:
        return (
            "Create `gateway/gateway.py` wrapping `litellm.completion` with Tenacity retries on HTTP 429 "
            "(exponential backoff, max 3), logging `prompt_hash` (sha256 of system+user), `model`, tokens, "
            "and `latency_ms` to `logs/usage.jsonl`."
        )
    if "instructor" in b:
        return (
            "Implement `extractor/extract.py` with `instructor.from_openai`, `response_model=LogEvent`, "
            "`max_retries=3`, and structured log on each `ValidationError` including field path."
        )
    if "pydantic" in b and "docs.pydantic" in b:
        return (
            "Add `models/log_event.py` with `@field_validator` / `@model_validator` for cross-field rules; "
            "mirror the doc’s validation section in `tests/test_models.py` with failing fixtures."
        )
    if "langgraph" in b or "langchain-ai.github.io/langgraph" in b:
        return (
            "Compile `reconciler_agent/graph.py` with `SqliteSaver` checkpointer, `interrupt_before=['commit']`, "
            "and pytest that feeds invalid parsed JSON and expects graph pause state."
        )
    if "mcp" in b or "fastmcp" in b or "modelcontextprotocol" in b:
        return (
            "Run `fastmcp` server module with tool handlers reading only allow-listed SQL; "
            "reject mutations at OPA or application layer with 403 + audit row."
        )
    if "qdrant" in b or "hybrid" in b:
        return (
            "Script `retrieval/benchmark.py` comparing dense-only vs hybrid RRF on labeled `queries.jsonl`; "
            "write results to `benchmarks/retrieval.json` committed in git."
        )
    if "docling" in b or "llamaparse" in b:
        return (
            "Pipeline `ingest/parse_chunks.py` emitting `data/chunks.jsonl` with schema version field; "
            "validate each line with Pydantic before index job."
        )
    if "deepeval" in b or "ragas" in b:
        return (
            "Wire `evals/run_deepeval.py` (or Ragas) to load `evals/golden.jsonl` and exit non-zero when "
            "`schema_pass_rate` drops below env `EVAL_MIN_PASS`."
        )
    if "opa" in b or "openpolicyagent" in b:
        return (
            "Package Rego under `policy/`; call `opa eval` from pytest before MCP tool execution; "
            "deny `write_*` and `delete_*` for role `analyst`."
        )
    if "langfuse" in b or "opentelemetry" in b:
        return (
            "Propagate `trace_id` from FastAPI middleware through LiteLLM metadata and MCP tool calls; "
            "export one redacted JSON trace sample under `docs/trace_sample.json`."
        )
    if "prompt caching" in b or "prefix_caching" in b:
        return (
            "Configure stable system prefix in gateway; log `cache_read_input_tokens` / `cache_creation_input_tokens` "
            "per request; README table comparing median TTFT cached vs uncached (≥10 requests)."
        )
    if "helm" in b or "kubernetes.io" in b:
        return (
            "Add `deploy/helm/` or `compose.yaml` with liveness/readiness probes hitting `/health`; "
            "document `kubectl get pods` or `docker compose ps` in README."
        )
    if ltype == "Prove":
        return (
            "Paste release tag, CI URL, or benchmark path in Lab & Prove; README must list exact commands "
            "and expected stdout snippet for reviewers."
        )
    if ltype == "Build":
        return hint.get("capstone_action") or (
            f"Land `{lesson.get('lesson') or 'milestone'}` on a feature branch with pytest proving the new behavior."
        )
    if ltype == "Video":
        return (
            "After Foundations: add one module or test cited in lecture (file path in commit message); "
            "log three production controls (metric, test, code-review gate) in `DEVLOG.md`."
        )
    return None


def specific_code_fence(lesson: dict, ltype: str) -> str | None:
    b = _blob(lesson)
    if "litellm" in b:
        return '''```python
# gateway/gateway.py
import hashlib
import json
import time
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential
from litellm import completion
from litellm.exceptions import RateLimitError

def _prompt_hash(messages: list[dict]) -> str:
    blob = json.dumps(messages, sort_keys=True).encode()
    return hashlib.sha256(blob).hexdigest()[:16]

@retry(
    retry=retry_if_exception(lambda e: isinstance(e, RateLimitError)),
    wait=wait_exponential(multiplier=1, min=1, max=30),
    stop=stop_after_attempt(3),
)
def complete(job_id: str, messages: list[dict]) -> dict:
    t0 = time.perf_counter()
    resp = completion(model="gpt-4o-mini", messages=messages, metadata={"job_id": job_id})
    row = {
        "job_id": job_id,
        "prompt_hash": _prompt_hash(messages),
        "model": resp.model,
        "prompt_tokens": resp.usage.prompt_tokens,
        "completion_tokens": resp.usage.completion_tokens,
        "latency_ms": int((time.perf_counter() - t0) * 1000),
    }
    with open("logs/usage.jsonl", "a") as f:
        f.write(json.dumps(row) + "\\n")
    return row
```'''
    return None
