---
title: Hybrid retrieval benchmark
---

# Build — dense vs hybrid metrics

```mermaid
flowchart LR
  Q[Question] --> D[Dense embed search]
  Q --> B[BM25 / sparse]
  D --> RRF[RRF fusion]
  B --> RRF
  RRF --> TOP[Top-k chunks]
  TOP --> SCORE[recall@5 vs labels]
```

## DE scenario

You own a **labeled Q/A set** (25+ rows) over internal docs. Commit benchmark JSON—treat it like a regression dataset for a search index change.

**Prove:** README table + `benchmarks/retrieval_results.json` (Lab tab template).
