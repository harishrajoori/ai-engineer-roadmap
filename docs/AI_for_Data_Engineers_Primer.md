# AI for data engineers — program primer

You already know how to ship reliable data systems. This certificate applies the same habits to **LLM-powered** pipelines: contracts, tests, observability, and prove gates—without pretending you need a PhD in deep learning first.

## Mental model in one paragraph

An **LLM** is a probabilistic function: text in → text out. It does not “know” your warehouse schema. You wrap it with **schemas** (Pydantic), **retries**, **golden sets**, and a **gateway** (LiteLLM) the same way you wrap flaky APIs with idempotent jobs and SLAs.

## DE concept → AI platform concept

| You already do (data engineering) | AI systems analogue |
| --- | --- |
| Table schema + NOT NULL | Pydantic model + Instructor validation |
| dbt tests / Great Expectations | Golden-set evals + invariant checks |
| Airflow retry + alert | LLM retry on `ValidationError` + fallback model |
| Lineage (OpenLineage, column lineage) | Trace IDs across gateway, graph, tools |
| API gateway / rate limits | LiteLLM router, budgets, per-request cost log |
| Feature store / embeddings table | Vector index + hybrid (BM25 + dense) search |
| RBAC on tables | OPA policy on tools and MCP actions |
| CI on SQL changes | CI that blocks eval regression on PRs |
| Idempotent batch job | Checkpointed LangGraph run (resume after failure) |

## Prerequisites (honest)

- Comfortable **Python** (functions, classes, `pytest`)
- **Git** and a public GitHub repo for Prove gates
- Read/write **JSON** and env-based config
- Optional: Docker, one cloud account for deploy month

You do **not** need: training neural nets from scratch, CUDA, or completing every optional video.

## The capstone thread

Every course extends one story: **Autonomous Data Reconciliation Platform** (synthetic/public logs only).

| Phase | Courses | What you add to the repo |
| --- | --- | --- |
| Boot | 0 | Typed extraction + golden-set % |
| Gateway | 1 | LiteLLM + cost/latency logging |
| Orchestration | 2–3 | LangGraph + MCP tools + audit log |
| Retrieval | 4–6 | Hybrid search, chunks, one graph validator |
| Quality | 7–9 | Eval harness, CI gate, policy + traces |
| Ship | 10–12 | Integrated alpha, deploy doc, lineage sample |
| Career | 13–15 | Frontier slice, portfolio, interviews |

Open **Course 0 → Overview** for the month-by-month prove rubrics, then pick the first **Watch** topic.

## How to use this studio

1. **Course overview** — outcomes, concept map, prove acceptance table.
2. **Topic → Theory tab** — choose **Beginner**, **Intermediate**, or **Advanced** (every topic has all three).
3. **Lecture tab** — video or external course **after** theory feels clear.
4. **Lab & Prove** — paste artifact URL; you self-certify (no auto-grader).
5. **Regenerate** — optional AI rewrite (your API keys); saved per Google account on this browser.
6. **Mentor** — interview prompts and tradeoffs.

| Level | Best for |
| --- | --- |
| Beginner | New to AI; DE background; wants analogies and order |
| Intermediate | Default study guide, prove rubric, five layers |
| Advanced | Staff SLOs, tradeoffs, interview depth |

## First 90 minutes (if you are new to LLMs)

1. Skim this page.
2. Complete **Karpathy — Intro to LLMs** (Course 0) with three notes: tokens, context limit, one failure mode.
3. Read **Instructor quick start** — only “why structured output” sections.
4. Open your boot repo; add `.env.example` and a one-line `extract()` stub.

Mark topics complete when **this checkbox’s** objective is met—not when you finish entire playlists or doc sites.
