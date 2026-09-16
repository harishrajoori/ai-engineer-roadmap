# Capstone product brief (Course 10)

Use this as the **scope contract** for integration month. Wire existing modules; do not add new frameworks until the demo runs.

## Product name

**OpsLedger AI** — internal platform for turning messy operational text (logs, tickets, runbook snippets) into typed records, with human approval on risky rows.

## Personas

| Persona | Need |
| --- | --- |
| **Platform engineer (you)** | One repo, one demo, prove artifacts for gateway, eval CI, policy, traces |
| **On-call analyst** | Search past incidents; never get a write tool without policy allow |
| **Reviewer / staff engineer** | Reproduce alpha in &lt;10 minutes from README |

## User stories (must demo)

1. **Ingest** — Upload or point at synthetic `data/corpus/`; chunks land with `doc_id`, `chunk_id`, `source_page`.
2. **Extract** — CLI or API call returns Pydantic-validated `LogEvent` rows; invalid rows quarantined.
3. **HITL** — Force a validation failure; LangGraph interrupts; operator fixes state; run resumes.
4. **Ask + retrieve** — One labeled question hits hybrid retrieval; answer cites chunk ids (no mystery prose).

## Synthetic dataset (public only)

- `data/corpus/` — 10–20 markdown or JSON log files (fabricated or public 10-K excerpts).
- `data/golden/` — ≥30 labeled extraction rows (Course 0/7 bars).
- `benchmarks/queries.jsonl` — ≥15 Q/A pairs with `expected_chunk_ids` for recall@k (Course 4).

## SLO table (write real numbers in README)

| SLO | Target (alpha) | How you measure |
| --- | --- | --- |
| Golden schema pass rate | ≥90% on n≥30 | `evals/run.py` |
| P95 extract latency | &lt;8s per row (API path) | LiteLLM usage JSONL |
| Eval CI | Blocks merge on regression | GitHub Actions link |
| Policy | Deny `write_*` for role `analyst` | `opa test` output |
| Trace | One `run_id` across gateway + graph | Redacted Langfuse/OTel sample |

## Course 10 lesson buckets

| Bucket | Intent |
| --- | --- |
| **Wire** | Connect gateway, graph, MCP read tools, retrieval, eval hook |
| **Caching evidence** | Stable system prefix; README table TTFT + cached tokens (≥10 requests) |
| **Demo** | One command: `docker compose up` or `make demo` — happy path + one HITL fail path |

## Non-goals for alpha

- Multi-tenant billing, fine-tuned weights, or net-new RAG research
- Production customer data in any external API
