---
title: LiteLLM gateway v0.2
---

# Build — LiteLLM router + per-request cost log

## Platform picture

```mermaid
flowchart TB
  CLI[CLI / batch job] --> GW[LiteLLM proxy or router]
  GW --> M1[Primary model]
  GW --> M2[Fallback model]
  GW --> LOG[(usage JSONL / metrics)]
```

## DE scenario

Every LLM step in your pipelines should emit **job_id**, **tokens**, **latency_ms**, and **model id**—joinable to Airflow `dag_run_id` or Glue `job_run_id` in a real org.

**Prove:** Git tag `v0.2` + README table (see Lab tab snippets).
