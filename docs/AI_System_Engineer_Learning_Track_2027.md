# AI Systems Engineer Professional Certificate (2027)

> **One-place setup (this repo — `ai-engineer-roadmap`)**  
> 1. **Local studio:** `npm install` → `./serve.sh` (or `npm run dev`) → http://localhost:8765 — YouTube embeds, progress, AI mentor (BYOK keys).  
> 2. **After editing this file:** `npm run curriculum` → refreshes `data/lessons.json` and `public/data/lessons.json` (studio loads at runtime).  
> 3. **Strategy & depth:** [`AI_System_Engineer_Master_Plan.md`](./AI_System_Engineer_Master_Plan.md) (§1–16 strategy, §17+ module reference & appendices).  
> 4. **Coursera spine:** Opens in the Coursera app (not embeddable).  
> 5. **Validate links:** `npm run validate` (run before release).

| | |
| --- | --- |
| **Strategy, capstone, deep topics** | [`AI_System_Engineer_Master_Plan.md`](./AI_System_Engineer_Master_Plan.md) |
| **Candidate** | Harish Rajoori — Staff/Lead Data Platform → AI Platform |
| **Job target** | Senior / Staff AI Systems Engineer — **2027** hiring |
| **Runway** | Oct 2026 → Dec 2027 · **10–15 h/week** (20+ h sprint weeks only) |
| **Links validated** | 13 Sep 2026 — `npm run validate` (docs + lesson resources) |
| **Curriculum data** | `data/lessons.json` · `public/data/lessons.json` · React studio |

---

## Program overview

| # | Course | When | Hours | You earn (Prove) |
| --- | --- | --- | --- | --- |
| 0 | Boot: structured extraction | Pre 5 Oct 2026 | 14–28 | Public GitHub reconciler |
| 1 | LLM foundations & deterministic I/O | M1 Oct 2026 | 12–18 | Release `v0.2` + metrics |
| 2 | Agent orchestration (LangGraph) | M2 Nov 2026 | 12–18 | HITL demo in README |
| 3 | Tools & MCP | M3 Dec 2026 | 12–16 | MCP server + audit log |
| 4 | Hybrid retrieval | M4 Jan 2027 | 10–14 | Hybrid benchmark table |
| 5 | Document parsing & chunks | M5 Feb 2027 | 10–14 | `chunks.jsonl` + schema |
| 6 | Graph & GraphRAG slice | M6 Mar 2027 | 10–14 | Validator test + query |
| 7 | Evaluation harness | M7 Apr 2027 | 10–14 | Golden set ≥30 cases |
| 8 | Eval CI/CD gates | M8 May 2027 | 8–12 | CI blocks regression |
| 9 | Policy + observability | M9 Jun 2027 | 10–14 | Trace + policy test |
| 10 | Capstone integration | M10 Jul 2027 | 16–24 | Git tag `alpha` + caching proof |
| 11 | Deploy & platform UX | M11 Aug 2027 | 12–16 | Deploy screenshot + tool doc |
| 12 | Lineage & hardening | M12 Sep 2027 | 8–12 | Tag `v1.0` + lineage sample |
| 13 | Frontier (pick 1–2) | M13 Oct 2027 | 8–16 | README “why we added X” |
| 14 | Frontier + portfolio | M14 Nov 2027 | 8–12 | Posts + resume refresh |
| 15 | Interviews & offers | M15 Dec 2027 | 10–20 | Offer or feedback notes |

### Coursera Plus spine (parallel with Courses 1–2)

- [ ] [Generative AI with Large Language Models](https://www.coursera.org/learn/generative-ai-with-llms) (~16 h) — **Course 1**
- [ ] [AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) (~2–3 h) — **Course 2**
- [ ] Optional: [Generative AI Engineering with LLMs specialization](https://www.coursera.org/specializations/generative-ai-engineering-with-llms) — cherry-pick only; **do not** finish all 7 if capstone slips.

**Udemy:** not required.

---

## Progress dashboard

| Course | Status | Prove (paste URL) |
| --- | --- | --- |
| 0 | ☐ Not started | |
| 1 | ☐ | |
| 2 | ☐ | |
| 3 | ☐ | |
| 4 | ☐ | |
| 5 | ☐ | |
| 6 | ☐ | |
| 7 | ☐ | |
| 8 | ☐ | |
| 9 | ☐ | |
| 10 | ☐ | |
| 11 | ☐ | |
| 12 | ☐ | |
| 13 | ☐ | |
| 14 | ☐ | |
| 15 | ☐ | |

**Rule:** Mark a course **Complete** only when **Prove** is done. Optional lessons are marked *(optional)* — skip if 10+ YOE and time-boxed.

---

## Course 0 — Boot sprint (7 days before 5 Oct 2026)

| | |
| --- | --- |
| **Duration** | 7 days |
| **Graded assignment** | Public repo + schema-valid % on golden set |

### What you'll learn

- Structured extraction with Instructor, Pydantic, LiteLLM, pytest
- Retry loops and invariant validators on messy logs
- OSS README with metrics and threat model

### Syllabus

**Week 0 — Daily plan**

| Day | Focus |
| --- | --- |
| D1 | Tooling & agentic SDLC |
| D2 | Pydantic + Instructor retries |
| D3 | Ingestion + golden-set metrics |
| D4 | LiteLLM fallbacks |
| D5 | Invariants |
| D6 | Pytest harness |
| D7 | Ship to GitHub |

**Watch**

- [ ] [Karpathy — Intro to LLMs](https://www.youtube.com/watch?v=zjkBMFhNj_g) · ~1 h
- [ ] [DeepLearning.AI — Pydantic for LLM Workflows](https://www.deeplearning.ai/short-courses/pydantic-for-llm-workflows/) · ~1 h

**Read**

- [ ] [Instructor — quick start](https://python.useinstructor.com/)
- [ ] [Pydantic V2 docs](https://docs.pydantic.dev/latest/)
- [ ] [LiteLLM — reliable completions / fallbacks](https://docs.litellm.ai/docs/completion/reliable_completions)
- [ ] [Hamel — evals intro](https://hamel.dev/blog/posts/evals/)
- [ ] [Applied LLMs in Production](https://applied-llms.org/) · skim structure

**Build**

- [ ] Repo: `production-log-reconciler` or `telemetry-log-reconciler` · synthetic/public data only

**Prove**

- [ ] Paste GitHub URL + README golden-set metric

*Granular topics:* Master Plan §17 → **Course 0**

---

## Course 1 — M1 (Oct 2026): LLM foundations & structured extraction

| | |
| --- | --- |
| **Duration** | ~3 weeks |
| **Graded assignment** | GitHub release `v0.2` + README metrics |

### What you'll learn

- LLM lifecycle, limits, and interview-ready mental models
- Coursera **Gen AI with LLMs** (full or weeks 1–2 time-boxed)
- LiteLLM cost logging and CLI hardening

### Syllabus

**Coursera (required spine)**

- [ ] [Generative AI with Large Language Models](https://www.coursera.org/learn/generative-ai-with-llms) · ~16 h
- [ ] [DL.AI course landing](https://www.deeplearning.ai/courses/generative-ai-with-llms) · same content

**Watch**

- [ ] [Karpathy — Deep Dive into LLMs](https://www.youtube.com/watch?v=7xTGNNLPyMI) · ~3 h
- [ ] [3Blue1Brown — neural networks / attention](https://www.3blue1brown.com/topics/neural-networks) · 2–4 h
- [ ] *(optional)* [StatQuest video index](https://statquest.org/video-index/) · search attention / embedding
- [ ] *(optional)* [DeepLearning.AI YouTube](https://www.youtube.com/@DeepLearningAI)
- [ ] *(optional)* [Karpathy channel](https://www.youtube.com/c/AndrejKarpathy)

**Read**

- [ ] [Applied LLMs — 3+ sections](https://applied-llms.org/)
- [ ] [Instructor — patterns & retries](https://python.useinstructor.com/)
- [ ] [LiteLLM docs hub](https://docs.litellm.ai/)
- [ ] [Chip Huyen — blog](https://chiphuyen.com/)
- [ ] [AI Engineering book repo](https://github.com/chiphuyen/aie-book)
- [ ] *(optional)* [Outlines — constrained decoding](https://github.com/dottxt-ai/outlines)

**Build**

- [ ] Tag `v0.2`; LiteLLM router + per-request cost log

**Prove**

- [ ] Release `v0.2` link + README metrics

*Granular topics & CampusX:* Master Plan §17 → **Course 1**

---

## Course 2 — M2 (Nov 2026): LangGraph & agent state machines

| | |
| --- | --- |
| **Duration** | ~3 weeks |
| **Graded assignment** | HITL fail-path demo (GIF or short video) |

### What you'll learn

- Cyclic graphs: state, branching, checkpointing, `interrupt()`
- LangChain vs LangGraph tradeoffs (interview narrative)
- Reconciler wrapped in LangGraph

### Syllabus

**Coursera / DL.AI**

- [ ] [AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) · 2–3 h
- [ ] [LangChain Academy — LangGraph modules](https://academy.langchain.com/) · 4–8 h

**Watch**

- [ ] [LangChain — Context Engineering for Agents](https://www.youtube.com/watch?v=4GiqzUHD5AA) · ~1 h
- [ ] [Dave Ebbelaar — LangGraph production](https://www.youtube.com/@daveebbelaar) · pick 1–2
- [ ] [Berkeley RDI — compound AI / agents](https://www.youtube.com/@BerkeleyRDI) · 1 lecture
- [ ] *(optional)* [LangChain YouTube](https://www.youtube.com/@LangChain)

**Read**

- [ ] [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [ ] [LangGraph documentation](https://langchain-ai.github.io/langgraph/)
- [ ] [Applied LLMs — agents / orchestration](https://applied-llms.org/)

**Build**

- [ ] Package `reconciler-agent`: LangGraph + SQLite/Postgres checkpoints

**Prove**

- [ ] README demo: validation fail → `interrupt()` HITL

*Code labs & CampusX:* Master Plan §17 → **Course 2**

---

## Course 3 — M3 (Dec 2026): MCP & secure tool surfaces

| | |
| --- | --- |
| **Duration** | ~3 weeks |
| **Graded assignment** | MCP README + redacted client config |

### What you'll learn

- MCP client/server roles and tool schema discovery
- Read-only tools with JSONL audit log
- Wire MCP into LangGraph

### Syllabus

**Watch**

- [ ] [Daily Dose of DS — MCP topics](https://www.youtube.com/@dailydoseofds) · 1–2 videos
- [ ] [Multi-agent MCP + FastAPI](https://www.youtube.com/watch?v=LZAGlCqmhZQ) · ~2 h
- [ ] [Multi-agent MCP + HITL architecture](https://www.youtube.com/watch?v=BM39OouLNsM) · long
- [ ] *(optional)* CampusX MCP episode — [LangGraph playlist](https://www.youtube.com/playlist?list=PLKnIA16_RmvYsvB8qkUQuJmJNuiCUJFPL)

**Read**

- [ ] [MCP introduction](https://modelcontextprotocol.io/introduction)
- [ ] [MCP specification / docs](https://modelcontextprotocol.io/docs)
- [ ] [MCP Illustrated Guidebook](https://mcp.dailydoseofds.com)
- [ ] [FastMCP (Python)](https://github.com/jlowin/fastmcp)
- [ ] [Hub roadmap — MCP section](https://github.com/patchy631/ai-engineering-hub/blob/main/ai-engineering-roadmap/README.md)
- [ ] [JSON Schema](https://json-schema.org/)

**Build**

- [ ] Tools: `lookup_schema`, `query_golden_set`, `run_readonly_sql` (sqlite)
- [ ] Audit fields: `user_id`, `tool`, `args_hash`, `timestamp`

**Prove**

- [ ] README + redacted Cursor/Claude MCP snippet

*Hub repos:* Master Plan §17 → **Course 3**

---

## Course 4 — M4 (Jan 2027): Hybrid retrieval

| | |
| --- | --- |
| **Duration** | ~2–3 weeks |
| **Graded assignment** | Benchmark table in repo |

### What you'll learn

- Dense + sparse (BM25) + **RRF** fusion
- recall@k on labeled questions
- Retrieval as agent tool (not chat-only RAG)

### Syllabus

**Watch**

- [ ] [Document Chat RAG walkthrough](https://www.youtube.com/watch?v=ZgNJMWipirk) · ~45 m
- [ ] *(optional)* [CampusX Advanced RAG outline](https://learnwith.campusx.in/courses/Advanced-RAG-69d8037290a183fe36833265) · hybrid modules

**Read**

- [ ] [Qdrant documentation](https://qdrant.tech/documentation/)
- [ ] [Qdrant — hybrid queries](https://qdrant.tech/documentation/concepts/hybrid-queries/)
- [ ] [pgvector](https://github.com/pgvector/pgvector)
- [ ] [Applied LLMs — retrieval](https://applied-llms.org/)

**Build**

- [ ] Public corpus (10-K sample, ops markdown, or synthetic runbooks)
- [ ] README: dense-only vs hybrid metrics

**Prove**

- [ ] Committed benchmark table

*Hub repos:* Master Plan §17 → **Course 4**

---

## Course 5 — M5 (Feb 2027): Document parsing at scale

| | |
| --- | --- |
| **Duration** | ~2–3 weeks |
| **Graded assignment** | Sample `chunks.jsonl` + schema in README |

### What you'll learn

- PDF/HTML → chunks with page-level provenance
- Feed M4 index and capstone ingestion

### Syllabus

**Watch / read**

- [ ] [Docling (IBM)](https://github.com/DS4SD/docling) · README / release demos
- [ ] [Docling documentation](https://github.com/DS4SD/docling#documentation)
- [ ] [LlamaParse getting started](https://docs.cloud.llamaindex.ai/llamaparse/getting_started)
- [ ] [Chip Huyen — data for LLM systems](https://chiphuyen.com/)

**Build**

- [ ] `chunks.jsonl` with `source_page`, `doc_id`, `chunk_id`

**Prove**

- [ ] Sample file + documented schema

> **Note:** Hub folder [rag-with-dockling](https://github.com/patchy631/ai-engineering-hub/tree/main/rag-with-dockling) is misspelled; library is **[Docling](https://github.com/DS4SD/docling)**.

*Parsing deep dive:* Master Plan §17 → **Course 5**

---

## Course 6 — M6 (Mar 2027): Graph & GraphRAG slice

| | |
| --- | --- |
| **Duration** | ~2–3 weeks |
| **Graded assignment** | Failing validator test + query in repo |

### What you'll learn

- Entity/relation modeling for ops or reconciliation
- One validator query (deps / compatibility)
- Graph checks before execution (CARL conftest analogy)

### Syllabus

**Watch**

- [ ] [Neo4j GraphAcademy](https://graphacademy.neo4j.com/) · 4–8 h
- [ ] *(optional)* [CampusX Graph RAG modules](https://learnwith.campusx.in/courses/Advanced-RAG-69d8037290a183fe36833265)

**Read**

- [ ] [Microsoft GraphRAG](https://github.com/microsoft/graphrag)
- [ ] [Neo4j Cypher manual](https://neo4j.com/docs/cypher-manual/current/)

**Build**

- [ ] Lightweight graph from M5 corpus; validator rejects invalid states

**Prove**

- [ ] Test case that fails validation

*Hub:* [graphiti-mcp](https://github.com/patchy631/ai-engineering-hub/tree/main/graphiti-mcp) · Master Plan §17 → **Course 6**

---

## Course 7 — M7 (Apr 2027): Evaluation harness

| | |
| --- | --- |
| **Duration** | ~2–3 weeks |
| **Graded assignment** | Golden set ≥30 + eval report |

### What you'll learn

- Versioned golden set with schema + semantic labels
- DeepEval/Ragas locally; tiered metrics (validity vs F1)

### Syllabus

**Watch**

- [ ] [RAG Evaluation (Ragas context)](https://www.youtube.com/watch?v=bB56BaQIBm4) · ~1 h
- [ ] *(optional)* CampusX RAGAS module — [Advanced RAG outline](https://learnwith.campusx.in/courses/Advanced-RAG-69d8037290a183fe36833265)

**Read**

- [ ] [Hamel — evals](https://hamel.dev/blog/posts/evals/)
- [ ] [Applied LLMs — evaluation](https://applied-llms.org/)
- [ ] [DeepEval getting started](https://docs.confident-ai.com/docs/getting-started)
- [ ] [Ragas — install](https://docs.ragas.io/en/stable/getstarted/install/)
- [ ] [Ragas — metrics](https://docs.ragas.io/en/stable/concepts/metrics/)

**Build**

- [ ] `evals/golden.jsonl`, `python -m evals.run` → JSON report

**Prove**

- [ ] Golden set committed + summary metrics

*Hub:* [eval-and-observability](https://github.com/patchy631/ai-engineering-hub/tree/main/eval-and-observability)

---

## Course 8 — M8 (May 2027): Eval CI/CD gates

| | |
| --- | --- |
| **Duration** | ~2 weeks |
| **Graded assignment** | Screenshot: CI fail then fix |

### What you'll learn

- GitHub Action evals on every PR
- Fail closed on regression thresholds

### Syllabus

**Read**

- [ ] [Hamel — articles index](https://hamel.dev/)
- [ ] [DeepEval — CI/CD](https://docs.confident-ai.com/docs/evaluation-end-to-end-ci-cd)
- [ ] [Applied LLMs — testing / monitoring](https://applied-llms.org/)

**Build**

- [ ] `.github/workflows/evals.yml`, `evals/baseline.json`

**Prove**

- [ ] CI regression screenshot

*CI patterns:* Master Plan §17 → **Course 8**

---

## Course 9 — M9 (Jun 2027): Policy (OPA) + tracing

| | |
| --- | --- |
| **Duration** | ~2–3 weeks |
| **Graded assignment** | Redacted trace + policy unit test |

### What you'll learn

- Rego deny before tool side effects
- Langfuse or OpenTelemetry per `run_id`
- Token cost and latency attribution

### Syllabus

**Watch**

- [ ] [LangSmith crash course](https://www.youtube.com/watch?v=4FFspU4riHk) · map concepts to Langfuse · ~2 h
- [ ] *(optional)* [Context Engineering for Agents](https://www.youtube.com/watch?v=4GiqzUHD5AA) · ~1 h

**Read**

- [ ] [Open Policy Agent docs](https://www.openpolicyagent.org/docs/latest/)
- [ ] [Langfuse docs](https://langfuse.com/docs)
- [ ] [Langfuse — tracing](https://langfuse.com/docs/tracing)
- [ ] [OpenTelemetry — Python](https://opentelemetry.io/docs/languages/python/)
- [ ] [LiteLLM — Langfuse integration](https://docs.litellm.ai/docs/observability/langfuse_integration)

**Build**

- [ ] Rego: block `write_*` for role `analyst`
- [ ] Langfuse wired to LangGraph + LiteLLM

**Prove**

- [ ] Trace screenshot + policy test output

*OPA & observability depth:* Master Plan §17 → **Course 9**

---

## Course 10 — M10 (Jul 2027): Capstone integration alpha

| | |
| --- | --- |
| **Duration** | ~4 weeks |
| **Graded assignment** | Tag `alpha` + demo script + **prompt caching evidence** |

### What you'll learn

- Integrate M1–M9 into **Autonomous Data Reconciliation Platform**
- One-command local demo (`docker compose up`)
- Cost/TTFT optimization via prompt caching (interview story)

> **Capstone spec:** Full prose in [`AI_System_Engineer_Master_Plan.md`](./AI_System_Engineer_Master_Plan.md) (§13). Checklist below is self-contained for daily use.

### Capstone checklist (Plan §13)

- [ ] **Ingestion:** Docling or LlamaParse on public/synthetic docs
- [ ] **Gateway:** LiteLLM proxy + failover; **prompt caching** on static prefixes
- [ ] **Extraction:** Instructor + Pydantic + validation retries
- [ ] **Invariants & lineage:** root validators; chunk → model → row events
- [ ] **Policy:** OPA before write tools
- [ ] **LangGraph:** pass → stage write; fail → `interrupt()` HITL
- [ ] **Eval CI:** GitHub Actions + tiered metrics
- [ ] **Telemetry:** Langfuse or OTel per run
- [ ] *(optional Phase 5)* E2B, semantic cache, NeMo — document as Phase 2 if deferred

### Practical gate — prompt caching (required)

- [ ] Static prefix identified (schemas, tools, policy, few-shots)
- [ ] [Anthropic prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) configured on prefix
- [ ] [LiteLLM prompt caching](https://docs.litellm.ai/docs/completion/prompt_caching) (+ [proxy caching](https://docs.litellm.ai/docs/proxy/caching) if self-hosted)
- [ ] README table: TTFT + cached vs uncached tokens (≥10 requests, same workload)
- [ ] One-sentence interview line on cost/latency without behavior change

### Syllabus

**Watch**

- [ ] [AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) · revisit as needed

**Read**

- [ ] [OpenAPI 3](https://swagger.io/specification/)
- [ ] [JSON Schema](https://json-schema.org/)
- [ ] [Instructor](https://python.useinstructor.com/) · [LiteLLM](https://docs.litellm.ai/)

**Build**

- [ ] Ingest → gateway (caching on) → extract → validate → LangGraph → stage DB

**Prove**

- [ ] `alpha` tag + 5-minute demo script + caching section in README

*Capstone architecture & hub labs:* Master Plan §17 → **Course 10** · Plan → **§13**

---

## Course 11 — M11 (Aug 2027): Deploy & platform UX

| | |
| --- | --- |
| **Duration** | ~3 weeks |
| **Graded assignment** | Deploy screenshot + `docs/adding-a-tool.md` |

### What you'll learn

- Deploy API + worker + LiteLLM + Postgres on ECS or EKS
- Platform doc: how another engineer adds a tool

### Syllabus

**Watch**

- [ ] [Kubernetes Community](https://www.youtube.com/c/kubernetescommunity) · pick relevant talks

**Read**

- [ ] [Kubernetes — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [ ] [Helm quickstart](https://helm.sh/docs/intro/quickstart/)
- [ ] [Argo CD — getting started](https://argo-cd.readthedocs.io/en/stable/getting_started/)
- [ ] [LiteLLM proxy server](https://docs.litellm.ai/docs/simple_proxy)

**Build**

- [ ] Helm chart or compose

**Prove**

- [ ] `kubectl get pods` or compose screenshot + doc link

*Deploy checklist:* Master Plan §17 → **Course 11**

---

## Course 12 — M12 (Sep 2027): Lineage & hardening

| | |
| --- | --- |
| **Duration** | ~2 weeks |
| **Graded assignment** | Tag `v1.0` + lineage sample |

### What you'll learn

- OpenLineage (or equivalent) doc → model → DB
- Threat model update in README

### Syllabus

**Watch**

- [ ] [OpenLineage project](https://www.openlineage.io/)

**Read**

- [ ] [OpenLineage documentation](https://openlineage.io/docs)
- [ ] [Applied LLMs — production pitfalls](https://applied-llms.org/)

**Build**

- [ ] Sample lineage JSON in repo

**Prove**

- [ ] `v1.0` tag + lineage artifact

---

## Course 13 — M13 (Oct 2027): Frontier deep dive (pick 1–2)

| | |
| --- | --- |
| **Duration** | ~2 weeks |
| **Graded assignment** | README “why we added X” |

### Pick one or two tracks

- [ ] **vLLM** — [docs](https://docs.vllm.ai/) · local model behind LiteLLM
- [ ] **DSPy** — [GitHub](https://github.com/stanfordnlp/dspy) · one compiled extractor metric
- [ ] **Prefix caching** — [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) · TTFT before/after
- [ ] **Semantic cache** — [GPTCache](https://github.com/zilliztech/gptcache) · optional gateway layer

**Prove**

- [ ] README section with bottleneck + metric

*Frontier catalog:* Plan §7 · Master Plan §17 → **Course 13**

---

## Course 14 — M14 (Nov 2027): Frontier + portfolio

| | |
| --- | --- |
| **Duration** | ~2 weeks |
| **Graded assignment** | 1–2 posts + resume refresh |

### Syllabus

- [ ] [Unsloth](https://github.com/unslothai/unsloth) · [HF PEFT](https://huggingface.co/docs/peft/index) · LoRA/QLoRA skim
- [ ] [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails)
- [ ] [E2B docs](https://e2b.dev/docs)
- [ ] *(optional)* [Karpathy Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ)

**Prove**

- [ ] Posts + resume (Plan §14)

---

## Course 15 — M15 (Dec 2027): Interviews & offers

| | |
| --- | --- |
| **Duration** | ~3–4 weeks |
| **Graded assignment** | Offer letter or structured feedback |

### What you'll learn

- Staff AI Platform narrative: harness, evals, policy, lineage
- Live capstone demo with trace + CI story

### Syllabus

**Watch**

- [ ] [AI Engineer conference channel](https://www.youtube.com/@ai.engineer) · pick 3–5 talks

**Read**

- [ ] [Applied LLMs in Production](https://applied-llms.org/)
- [ ] [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [ ] Interview positioning — Plan §14–§15 (sibling page `AI_System_Engineer_plan_2027.md`)

**Do**

- [ ] 3–5 quality applications/week
- [ ] Mock system design: orchestration control plane

**Prove**

- [ ] Offer or feedback notes

*Interview question bank:* Master Plan §17 → **Course 15**

---

## Where the rest lives

| Need | File |
| --- | --- |
| Topic depth, interview prompts, appendices A–F | Master Plan **§17+** |
| Market, ethics, capstone prose, resume | Master Plan **§1–16** |

---

*Daily driver for the React studio (`./serve.sh`). Last curriculum sync: Sep 2026.*
