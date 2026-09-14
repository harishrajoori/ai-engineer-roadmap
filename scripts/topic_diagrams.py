"""Auto-generated Mermaid diagrams for every lesson (DE architecture lens)."""

from __future__ import annotations

import re
from typing import Any

_COURSE_ARCHITECTURE: dict[str, str] = {
    "0": """flowchart TB
  subgraph ingest [Ingest boundary]
    RAW[Unstructured logs]
    RL[Rate limit per job_id]
  end
  subgraph core [Extraction service]
    EXT[Instructor + schema]
    VAL[Pydantic validators]
    DLQ[Quarantine invalid rows]
  end
  subgraph quality [Quality gate]
    GS[Golden-set pytest]
    MET[README metric]
  end
  RAW --> RL --> EXT --> VAL
  VAL -->|ok| GS --> MET
  VAL -->|fail| DLQ""",
    "1": """flowchart LR
  JOB[Batch CLI] --> GW[LiteLLM proxy]
  GW --> RL[429 retry + budget]
  RL --> M1[Primary model]
  RL --> M2[Fallback route]
  GW --> LOG[(usage JSONL)]
  LOG --> FIN[Cost attribution]""",
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
    from topic_diagram_order import order_architecture

    order = lesson.get("order")
    if order is not None:
        custom = order_architecture(int(order), lesson)
        if custom:
            return custom

    course = str(lesson.get("course", "0"))
    ltype = lesson.get("type") or "Read"
    b = _blob(lesson)

    if "instructor" in b or "pydantic" in b:
        return """flowchart TB
  RAW[Raw text] --> HASH[prompt_hash logged]
  HASH --> LLM[Chat completion]
  LLM --> PARSE[JSON parse]
  PARSE -->|invalid| RETRY[Repair max 3]
  RETRY --> LLM
  PARSE -->|valid| PYD[Pydantic validate]
  PYD -->|fail| DLQ[Quarantine + metric]
  PYD -->|ok| OUT[Typed bronze record]"""
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
    if "litellm" in b or "gateway" in b:
        return """sequenceDiagram
  participant Job
  participant GW as LiteLLM
  participant P as Primary model
  participant F as Fallback model
  Job->>GW: completion + metadata
  GW->>P: route
  P-->>GW: error 429
  GW->>F: fallback
  F-->>GW: tokens
  GW-->>Job: usage JSONL row"""
    if "instructor" in b or "pydantic" in b:
        return """sequenceDiagram
  participant ETL as Extract job
  participant LLM as Model API
  participant V as Pydantic validate
  ETL->>LLM: structured prompt
  LLM-->>ETL: JSON text
  ETL->>V: parse
  alt invalid
    V-->>ETL: ValidationError
    ETL->>LLM: repair retry
  else valid
    V-->>ETL: typed row
  end"""
    if "eval" in b or "golden" in b or ltype == "Prove":
        return """sequenceDiagram
  participant Dev
  participant CI as GitHub Actions
  participant H as Eval harness
  participant G as golden.jsonl
  Dev->>CI: pull request
  CI->>H: run evals
  H->>G: score rows
  H-->>CI: pass rate
  CI-->>Dev: merge blocked or allowed"""
    course = str(lesson.get("course", "0"))
    if course in ("0", "1", "5"):
        return """sequenceDiagram
  participant You
  participant Doc as Primary source
  participant Repo as Capstone repo
  participant Test as pytest
  You->>Doc: read or watch
  You->>Repo: smallest working change
  Repo->>Test: run checks
  Test-->>You: green before mark complete"""
    return """sequenceDiagram
  participant Client
  participant Platform as Your service
  participant Dep as External dependency
  Client->>Platform: request
  Platform->>Dep: bounded call
  Dep-->>Platform: response
  Platform-->>Client: validated output"""


def diagram_markdown_block(lesson: dict) -> str:
    arch = architecture_mermaid(lesson)
    lines = [
        "## Architecture (visual)",
        "",
        "Boundaries, failure paths, and stores—not a generic pipeline sticker.",
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
