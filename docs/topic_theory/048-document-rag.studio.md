---
title: Document Chat RAG walkthrough
---

# Document Chat RAG walkthrough

> **Visual study guide** · Course 4 · Video · [YouTube walkthrough ↗](https://www.youtube.com/watch?v=zgnjMWipirk)

## What RAG is (one sentence)

**Retrieval-augmented generation**: fetch relevant chunks from a corpus, inject them into the prompt, then ask the model to answer **grounded in those chunks**—not from parametric memory alone.

Data-engineering analogy: **join to a reference table** before computing a metric.

## End-to-end RAG pipeline

```mermaid
flowchart TB
  DOC[Documents PDF MD logs]
  CHUNK[Chunking strategy]
  EMB[Embedding model]
  VDB[(Vector store e.g. pgvector)]
  Q[User query]
  RET[Top-k retrieval]
  PROMPT[Augmented prompt]
  LLM[LLM]
  ANS[Answer + citations]

  DOC --> CHUNK --> EMB --> VDB
  Q --> EMB --> RET
  VDB --> RET --> PROMPT --> LLM --> ANS
```

## Chunking is a data modeling choice

```mermaid
flowchart LR
  subgraph Strategies["Common strategies"]
    FIX[Fixed token windows]
    SEC[Section / heading aware]
    REC[Recursive split]
  end
  FIX --> TRADE[Recall vs precision tradeoff]
  SEC --> TRADE
  REC --> TRADE
```

| Strategy | Pros | Cons |
| --- | --- | --- |
| Fixed size | Simple | Splits tables / code badly |
| Heading-aware | Better docs | Needs structure metadata |
| Overlap windows | Higher recall | More storage & cost |

## Retrieval quality levers

- **Embedding model** — domain fit beats random OpenAI default for specialized logs.
- **k** — too few misses context; too many dilutes prompt.
- **Metadata filters** — tenant, date, source system (like partition pruning).
- **Hybrid** — BM25 + vectors for keyword-heavy queries (Month 4+ reads).

## Grounding and hallucination

```mermaid
sequenceDiagram
  participant User
  participant RAG
  participant Store
  User->>RAG: question
  RAG->>Store: similarity search
  Store-->>RAG: chunks + scores
  RAG->>RAG: build prompt with citations
  Note over RAG: If chunks empty refuse or escalate
  RAG-->>User: answer citing chunk ids
```

**Fail closed** when retrieval returns nothing relevant—do not let the model freestyle.

## While you watch

- [ ] Note **chunk size** and **overlap** used in the demo.
- [ ] Identify where **embeddings** are created vs queried.
- [ ] List what you would log: query, k, chunk ids, scores, model id.
- [ ] Sketch how pgvector fits your capstone (table DDL, index).

## Connect to pgvector prove (next reads)

```mermaid
erDiagram
  DOCUMENTS ||--o{ CHUNKS : contains
  CHUNKS {
    uuid id
    vector embedding
    text content
    jsonb metadata
  }
```

## Failure modes

| Issue | Signal | Fix |
| --- | --- | --- |
| Stale index | Wrong doc version answers | Version source docs; re-embed on change |
| Chunk too large | Truncated context | Smaller chunks + parent retrieval |
| No citations | Untraceable answers | Require chunk ids in output schema |
| Injection via docs | Malicious corpus text | Sanitize sources; separate trust zones |

## Done when

You can draw **ingest → chunk → embed → store → retrieve → prompt → answer** and name one metric you will use in Month 7 eval (e.g. context precision).

## Primary source

[Document Chat RAG walkthrough ↗](https://www.youtube.com/watch?v=zgnjMWipirk) — then implement the pattern in your repo with **pgvector** per Course 4 build/prove items.
