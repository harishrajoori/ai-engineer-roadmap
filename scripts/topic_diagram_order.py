"""Per-order Mermaid overrides (141 topics) — layered on keyword/course defaults."""

from __future__ import annotations

# High-signal builds / proves / flagship videos
_ORDER_ARCH: dict[int, str] = {
    1: """flowchart LR
  VID[Karpathy Intro LLM] --> POL[Policy: what we validate]
  POL --> REPO[README trust boundaries]""",
    11: """flowchart TB
  PREFILL[Prompt tokens] --> BLOCKS[Transformer blocks]
  BLOCKS --> KV[KV cache]
  KV --> GEN[Generated tokens]
  GEN --> LOG[Gateway: TTFT + token usage]""",
    22: """flowchart LR
  GW[LiteLLM] --> M1[Primary model]
  GW --> M2[Fallback]
  GW --> CSV[cost_latency.jsonl]""",
    33: """stateDiagram-v2
  [*] --> Extract
  Extract --> Validate
  Validate --> Commit: OK
  Validate --> Interrupt: invariant fail
  Interrupt --> Human
  Human --> Extract""",
    45: """flowchart TB
  AG[Agent] --> MCP[MCP server]
  MCP --> AUD[(audit log)]
  MCP --> T1[lookup_schema]
  MCP --> T2[query_golden_set]
  MCP --> T3[run_readonly_sql]""",
    55: """flowchart LR
  CORPUS[Public corpus] --> HYB[Hybrid index]
  HYB --> BENCH[benchmark.json]
  BENCH --> PR[Committed in PR]""",
    76: """flowchart LR
  GOLD[golden.jsonl] --> HARNESS[evals.run]
  HARNESS --> CI[GitHub Actions]
  CI -->|fail| BLOCK[Block merge]""",
    100: """flowchart TB
  ALPHA[tag alpha] --> GW
  subgraph core [Integrated platform]
    GW[Gateway]
    G[LangGraph]
    RAG[RAG]
    EVAL[Eval hook]
  end
  G --> RAG --> EVAL""",
    120: """flowchart LR
  GIT[v1.0 tag] --> LINE[lineage sample]
  LINE --> CHUNK[chunk id]
  LINE --> CALL[model call id]
  LINE --> ROW[stored field]""",
}


def _sanitize_label(text: str, limit: int) -> str:
    return text.replace(chr(34), "'")[:limit]


def _prove_flow(order: int, lesson: dict) -> str:
    label = _sanitize_label(lesson.get("lesson") or f"Prove {order}", 44)
    return f"""flowchart LR
  P{order}["{label}"] --> REPO[Portfolio repo]
  REPO --> EV[Evidence README CI tag]
  EV --> GATE[Course prove gate]"""


def _build_flow(order: int, lesson: dict) -> str:
    label = _sanitize_label(lesson.get("lesson") or f"Build {order}", 44)
    return f"""flowchart TB
  B{order}["{label}"] --> BR[feature branch]
  BR --> IMPL[implement]
  IMPL --> TEST[pytest or benchmark]
  TEST --> SHIP[PR or release tag]"""


def order_architecture(order: int, lesson: dict) -> str | None:
    """Return order-specific diagram or None to fall back to keyword/course templates."""
    if order in _ORDER_ARCH:
        return _ORDER_ARCH[order]

    ltype = lesson.get("type") or "Read"
    if ltype in ("Prove", "Capstone"):
        return _prove_flow(order, lesson)
    if ltype == "Build":
        return _build_flow(order, lesson)
    if ltype == "Frontier":
        return f"""flowchart LR
  O{order}[Frontier spike] --> MET[One metric]
  MET --> ADR[ADR or README]
  ADR --> FLAG[Optional capstone flag]"""
    if ltype == "Do":
        return f"""flowchart LR
  O{order}[Operational task] --> RUNBOOK[RUNBOOK.md]
  RUNBOOK --> VERIFY[Peer replay]"""

    return None
