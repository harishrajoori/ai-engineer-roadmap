"""Auto-generated Mermaid diagrams for every lesson (DE architecture lens)."""

from __future__ import annotations

import re
from typing import Any

_COURSE_ARCHITECTURE: dict[str, str] = {
    "0": """flowchart TB
  subgraph Landing["Landing / raw"]
    RAW[Unstructured logs events]
  end
  subgraph Bronze["Your platform slice"]
    EXT[Extractor API]
    VAL[Pydantic + invariants]
    GS[Golden-set pytest]
  end
  RAW --> EXT --> VAL --> GS
  GS --> MET[README metric]""",
    "1": """flowchart LR
  JOB[Batch / CLI job] --> GW[LiteLLM gateway]
  GW --> M1[Primary model]
  GW --> M2[Fallback model]
  GW --> LOG[(usage: tokens latency USD)]""",
    "2": """stateDiagram-v2
  [*] --> Extract
  Extract --> Validate
  Validate --> Commit: schema OK
  Validate --> HITL: invariant fail
  HITL --> Extract: human fix
  Commit --> [*]""",
    "3": """sequenceDiagram
  participant Agent
  participant MCP as MCP server
  participant DB as Staging read model
  participant AUD as audit log
  Agent->>MCP: tool call
  MCP->>AUD: append
  MCP->>DB: allow-listed query
  MCP-->>Agent: result""",
    "4": """flowchart LR
  Q[Question] --> EMB[Embedding]
  Q --> BM25[Lexical sparse]
  EMB --> RRF[RRF fusion]
  BM25 --> RRF
  RRF --> TOPK[Top-k chunks]
  TOPK --> EVAL[recall@k vs labels]""",
    "5": """flowchart TB
  DOC[PDF / HTML / MD] --> PARSE[Layout parser]
  PARSE --> CH[Chunker + metadata]
  CH --> JSL[chunks.jsonl contract]
  JSL --> IDX[Index job]""",
    "6": """flowchart LR
  EVT[Events] --> N[Graph nodes]
  N --> R[Relationships]
  R --> CY[Cypher validator in CI]""",
    "7": """flowchart LR
  GOLD[golden.jsonl] --> RUN[eval harness]
  RUN --> MET[pass rate + tiers]
  MET --> GATE{threshold}""",
    "8": """flowchart LR
  PR[Pull request] --> CI[GitHub Actions]
  CI --> EVAL[evals.run]
  EVAL -->|regression| FAIL[Block merge]
  EVAL -->|ok| PASS[Ship]""",
    "9": """flowchart TB
  REQ[Request] --> POL[OPA policy]
  POL -->|allow| TOOL[Tool / model]
  POL -->|deny| REJ[403 audited]
  TOOL --> TRACE[Langfuse / OTel]""",
    "10": """flowchart TB
  API[Public API] --> GW[Gateway]
  GW --> AG[LangGraph]
  AG --> RAG[Retrieval]
  AG --> MCP[MCP tools]
  RAG --> EVAL[Eval hook]""",
    "11": """flowchart LR
  GIT[Git tag] --> IMG[Container image]
  IMG --> DEP[Compose or Helm]
  DEP --> HC[Health probes]""",
    "12": """flowchart LR
  RUN[Pipeline run] --> OL[OpenLineage event]
  OL --> ART[chunk ids model version]
  ART --> STORE[(lineage store)]""",
}

_TYPE_OVERLAY: dict[str, str] = {
    "Prove": """flowchart LR
  ART[Artifact in repo] --> URL[Paste in Lab and Prove]
  URL --> REV[Reviewer reproduces in 10 min]""",
    "Video": """flowchart LR
  TH[Theory Foundations] --> LEC[Lecture video]
  LEC --> NOTES[3 production bullets]
  NOTES --> LAB[Lab and Prove]""",
    "Read": """flowchart LR
  TH[Theory Foundations] --> DOC[Official docs]
  DOC --> ADR[ADR note in README]
  ADR --> CODE[Wire into repo]""",
    "Build": """flowchart LR
  BR[Branch] --> IMPL[Implement]
  IMPL --> TEST[pytest / benchmark]
  TEST --> PR[PR or tag]""",
}


def _blob(lesson: dict) -> str:
    return f"{lesson.get('lesson') or ''} {(lesson.get('url') or '')}".lower()


def architecture_mermaid(lesson: dict) -> str:
    """Primary architecture diagram for a topic."""
    course = str(lesson.get("course", "0"))
    ltype = lesson.get("type") or "Read"
    b = _blob(lesson)

    if "instructor" in b or "pydantic" in b:
        return """flowchart TB
  RAW[Raw text] --> PROMPT[Prompt + response_model]
  PROMPT --> LLM[Chat completion]
  LLM --> PARSE[JSON to Pydantic]
  PARSE -->|invalid| RETRY[Repair retry]
  RETRY --> LLM
  PARSE -->|valid| OUT[Typed record]"""
    if "litellm" in b:
        return _COURSE_ARCHITECTURE["1"]
    if "langgraph" in b or "langchain" in b:
        return _COURSE_ARCHITECTURE["2"]
    if "mcp" in b:
        return _COURSE_ARCHITECTURE["3"]
    if "hybrid" in b or "retriev" in b or "qdrant" in b or "rag" in b:
        return _COURSE_ARCHITECTURE["4"]
    if "chunk" in b or "docling" in b or "llamaparse" in b:
        return _COURSE_ARCHITECTURE["5"]
    if "graph" in b or "cypher" in b or "neo4j" in b:
        return _COURSE_ARCHITECTURE["6"]
    if "eval" in b or "golden" in b or "hamel" in b or "deepeval" in b:
        return _COURSE_ARCHITECTURE["7"]
    if "github.com" in b and "workflow" in b:
        return _COURSE_ARCHITECTURE["8"]
    if "opa" in b or "langfuse" in b or "trace" in b:
        return _COURSE_ARCHITECTURE["9"]
    if ltype == "Prove":
        return _TYPE_OVERLAY["Prove"]
    if ltype == "Build":
        return _TYPE_OVERLAY["Build"]
    if ltype == "Video":
        return _TYPE_OVERLAY["Video"]
    return _COURSE_ARCHITECTURE.get(course, _COURSE_ARCHITECTURE["0"])


def sequence_mermaid(lesson: dict) -> str | None:
    """Optional second diagram for complex flows."""
    b = _blob(lesson)
    ltype = lesson.get("type") or ""

    if ltype == "Video" and ("karpathy" in b or "llm" in b):
        return """sequenceDiagram
  participant App
  participant GW as Gateway
  participant M as Model
  App->>GW: prompt + max_tokens
  GW->>M: prefill prompt tokens
  M-->>GW: stream completion
  GW-->>App: usage metadata"""
    if "interrupt" in b or "hitl" in b or "langgraph" in b:
        return """sequenceDiagram
  participant Op as Operator
  participant G as LangGraph
  participant V as Validator
  G->>V: parsed record
  V-->>G: fail
  G-->>Op: interrupt
  Op->>G: resume with fix"""
    if "mcp" in b:
        return """sequenceDiagram
  participant Agent
  participant MCP as MCP server
  participant DB as Staging read model
  participant AUD as audit log
  Agent->>MCP: tool call
  MCP->>AUD: append
  MCP->>DB: allow-listed query
  MCP-->>Agent: result"""
    return None


def diagram_markdown_block(lesson: dict) -> str:
    arch = architecture_mermaid(lesson)
    lines = [
        "## Architecture (visual)",
        "",
        "Map this topic to components you already operate (jobs, gateways, catalogs, CI).",
        "",
        "```mermaid",
        arch.strip(),
        "```",
        "",
    ]
    seq = sequence_mermaid(lesson)
    if seq and "sequenceDiagram" in seq:
        lines.extend(
            [
                "## Request flow (sequence)",
                "",
                "```mermaid",
                seq.strip(),
                "```",
                "",
            ]
        )
    elif seq:
        lines.extend(["## Secondary view", "", "```mermaid", seq.strip(), "```", ""])
    return "\n".join(lines)
