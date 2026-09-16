---
title: Course 9 — policy before tools + traces
---

# Build — OPA + Langfuse / OpenTelemetry

> **Lab & Prove** companion · Course 9 · Same discipline as IAM + pipeline lineage

## DE scenario

An agent must not call **write** tools for read-only roles. **Policy** evaluates tool args before execution; **traces** tie `run_id` to gateway, graph, and tool spans—like CloudTrail plus Airflow task logs when debugging a failed DAG.

```mermaid
flowchart TB
  REQ[User request] --> POL[OPA / policy test]
  POL -->|allow| TOOL[MCP tool]
  POL -->|deny| AUDIT[audit log]
  TOOL --> TRACE[Langfuse / OTel]
```

## Prove checklist

| Artifact | Why it matters |
| --- | --- |
| `opa test` or unit policy test | Deny dangerous patterns in CI |
| Trace screenshot with `run_id` | Reproduce one alpha path end-to-end |

Use **Lab & Prove** for Rego sketch and trace expectations.
