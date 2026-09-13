# AI Systems Engineer: 15-Month Career Migration Blueprint (2027 Target)

**Document version:** Revised September 2026  
**Candidate context:** Harish Rajoori — Staff/Lead Data Platform Engineer (B.Tech EEE, JNTU Hyderabad; 10+ years production systems)

| Field | Value |
| --- | --- |
| **Target role** | Senior / Staff **AI Systems** or **AI Platform** Engineer |
| **Target hiring window** | **2027** (pipeline Q2 2027; heavy interviews Q3–Q4 2027) |
| **Runway** | **Oct 2026 → Dec 2027** (~15 months) |
| **Employment anchor** | Mindera India Pvt Ltd — client **2K** (joining **5 Oct 2026**) |
| **Prior role** | Lead Data Engineer, Warner Bros. Discovery (Jun 2026 – Sep 2026) |
| **Comp aspiration (tier A outcome)** | Remote US/EU contracts **$120k–$150k+** / **₹1 Cr+** — plausible at Staff platform level with strong portfolio; not guaranteed on first 2027 offer |
| **Foundation base** | Lakehouse, streaming, semantic layers, reconciliation, IaC, CI eval gates |

**Core strategy:** Keep income and production scale via 2K (telemetry, Kafka/streaming, data quality). Build **governed agent platform** skills in parallel on **OSS + synthetic/public data**, and on **client work only where policy allows**. Treat LLMs as **untrusted compute kernels**; your moat is deterministic infrastructure around them.

**Daily learning:** Run the **React studio** (`npm run dev` / `./serve.sh`) — curriculum from **[`AI_System_Engineer_Learning_Track_2027.md`](./AI_System_Engineer_Learning_Track_2027.md)** (Courses 0–15, Prove gates). **Strategy, capstone, ethics, resume, and module depth** are in **this file** (§1–16 + **§17 appendices**).

---

## 1. Executive Summary & Strategic Reality

### Timeline anchors (fact-checked)

* **Today:** September 2026.
* **Pre-start window:** ~3 weeks before **5 Oct 2026** — enough for a **7-day extraction sprint**, not for senior AI platform qualification.
* **Learning runway:** **15 months** (Oct 2026 – Dec 2027) to reach interview-ready **AI platform** depth for **2027** roles.
* **Market note:** By 2027, frameworks will churn; **orchestration, contracts, evals, MCP-style tool surfaces, and audit** will matter more than any single library name. Frontier topics in Section 5 remain valuable as **Phase 5 (H2 2027)** depth and interview differentiation.

### Scopes

| Scope | What success looks like |
| --- | --- |
| **7 days (pre–Oct 5)** | Shipped OSS repo: structured log/telemetry reconciler (Instructor + Pydantic + LiteLLM + pytest). Upgraded agentic SDLC (Cursor rules, local eval habits). |
| **15 months** | One **platform-shaped** capstone (or internal equivalent) with orchestration, MCP/tools, eval CI, tracing, policy gate. Resume + LinkedIn show **LLM systems**, not courses. |
| **2027 job search** | Credible answer to: *“What LLM/agent system did you own, and how did you prove it was safe?”* |

### The 2K advantage

Roughly **80% of enterprise AI** is still data infrastructure: streaming ingestion, schema enforcement, DQ, indexing, lineage, cost controls. 2K-scale telemetry is a **validation sandbox** for extraction, anomaly workflows, and retrieval—**after** you confirm **data classification, PII, and LLM vendor policy** (see Section 11).

### Non-goals for this runway (Year 1–1.25)

* Training foundation models from scratch or pursuing a PhD arc.
* Chasing **research-lab-only** employers that hard-require M.Tech/PhD from tier-1 institutes (e.g. some “AI lab” postings)—optional long shots, not the main market.
* Shipping a capstone that lists every buzzword but lacks **evals + traces + one clear harness**.
* Sending production client data to external LLM APIs without written approval.

### Weekly time budget (while employed)

| Band | Hours/week | Use |
| --- | --- | --- |
| **Sustainable** | 10–15 | Courses + incremental OSS |
| **Sprint** | 20+ | Short bursts only (pre-start week, capstone freeze) |

---

## 2. Market Deconstruction: What Employers Actually Demand (2026–2027)

Use **Mobius Research Lab** and **Juniper Square–style reconciliation** roles as **reference points**, not the whole market. Typical **AI Platform Engineer** postings (product cos, consultancies, global captives) emphasize:

| Theme | Interview signal |
| --- | --- |
| **Orchestration control plane** | Retries, timeouts, circuit breakers, state, HITL—not one-shot prompts |
| **Tool interfaces (MCP or equivalent)** | Discoverable schemas, auth, audit, versioning |
| **Harness over framework** | LangGraph *or* custom loop—can articulate tradeoffs |
| **RAG / retrieval at scale** | Chunking, hybrid search, grounding, no-answer paths |
| **Evals + regression in CI** | Golden sets, cost/latency budgets, drift awareness |
| **Observability** | Langfuse / OpenTelemetry, per-run attribution |
| **Platform for other engineers** | SDK, docs, “how to add a tool/eval” |
| **Distributed systems + security** | K8s or ECS, IaC, OIDC/RBAC, secrets discipline |

### Role archetypes

| Role Archetype | Primary Stack | Core Bottleneck Solved | Enterprise Demand |
| --- | --- | --- | --- |
| **AI App Wrapper** | OpenAI API, Streamlit, basic LangChain | Quick POCs, simple chatbots | Oversaturated; low pay; easily automated. |
| **ML Researcher** | PyTorch, CUDA, JAX, mathematical modeling | Model training, architecture | Gatekept by PhD/M.Tech at some labs—not the median platform job. |
| **AI Systems / Platform Engineer (your target)** | LangGraph, Instructor, Pydantic, MCP, LiteLLM, evals, OPA, vectors/graphs | Reliability, schema-valid outputs, secure execution, lineage | **Shortage of people with data platform + harness depth.** |

### Key enterprise requirements (synthesized from multiple JD families)

1. **Output validation & schema enforcement:** Messy documents/logs → strict typed records and warehouse tables; separate **schema validity** from **semantic correctness**.
2. **Deterministic invariant checks:** Balance equations, checksums, reconciliation rules **before** writes (your WBD/Trainline background).
3. **Continuous AI evals & CI/CD gates:** Regression on golden sets; track cost, latency, extraction quality in PRs.
4. **Stateful orchestration & HITL:** Cyclic graphs, checkpointing, `interrupt()` for human approval.
5. **Gateway routing & fallbacks:** Multi-provider proxy, rate limits, budgets (LiteLLM-class patterns).
6. **Provenance & lineage:** Document chunk → model call → graph/plan → DB commit.
7. **Policy enforcement & RBAC:** Policy-as-code before tool execution (OPA-class patterns).
8. **Agentic SDLC:** Ship with Cursor/Claude Code **plus** typing, lint, and architectural tests—not vibe-only code.
9. **Runtime & GitOps (platform roles):** Kubernetes, Helm, ArgoCD—at least one deploy milestone (you have EKS history; refresh in 2027 path).

### Realistic 2027 outcome tiers

| Tier | Description |
| --- | --- |
| **A (primary goal)** | Senior/Staff **AI Platform Engineer**, remote-friendly (India base or global contractor) |
| **B (stretch)** | US/EU contract **$120k–$150k+** with Staff platform story + OSS/referrals |
| **C (optional)** | Foundational research labs with hard degree filters — low hit rate without M.Tech/PhD |
| **D (avoid)** | “AI engineer” title with tutorials only—weak by 2027 |

---

## 3. The Evolutionary Arc: Architectural Mental Models

Before writing code, understand the systems wall that caused each historical generation to fail:

```
[1. Bag of Words / TF-IDF]
       │
       ▼ (Issue: Zero semantic context; exact keyword match only)
[2. Word2Vec / GloVe]
       │
       ▼ (Issue: Static vectors; polysemy: "Apple" fruit vs company)
[3. RNNs & LSTMs]
       │
       ▼ (Issue: Sequential wall; poor long-context memory)
[4. Transformers & Self-Attention]
       │
       ▼ (Issue: Stateless weights; cutoffs; hallucinations; no private data)
[5. Vector Search & Hybrid RAG]
       │
       ▼ (Issue: Passive retrieval; cannot branch, repair, or act)
[6. Agentic State Machines & Systems Orchestration (current frontier)]
```

* **Bag of Words / TF-IDF:** Pure lexical matching. Fails when keywords do not match exactly.
* **Word2Vec / GloVe:** Static vectors. Fails on context-dependent meaning (polysemy).
* **RNNs & LSTMs:** Sequential processing; hard to scale and retain long memory.
* **Transformers:** Parallel attention; foundation for modern LLMs.
* **RAG:** Decouples reasoning from memory (vectors, lakehouse, semantic layer).
* **Agentic state machines (LangGraph, MCP):** Loops, tools, conditional routing, accountability.

**2027 interview tip:** Framework names may change; explain **why** orchestration replaced “single-pass RAG.”

---

## 4. Translate Existing Platform Work (Credibility Bridge)

Map prior work to AI platform language (use in CV, interviews, and internal 2K proposals):

| Existing artifact / experience | AI systems narrative |
| --- | --- |
| **200+ contract tests**, dbt/pytest DQ gates | **Eval CI** for data and (later) model outputs |
| **Reconciliation / Fair Share attribution** | **Invariant validation** before publish |
| **Cube semantic layer + RLS/JWT** | **Governed context layer** for agents (metrics with policy) |
| **MWAA mutex, orchestration** | **Workflow control plane** (scheduling, concurrency) |
| **Terragrunt plan-risk / conftest** | **Pre-execution validation** for plans (same pattern for agent plans) |
| **Pipeline manifests (producers/consumers)** | **Lineage** for tool side effects |
| **ECS ingestion service + Secrets Manager** | **Secure tool runtime** patterns |
| **10M+ events/day streaming** | **High-volume agent input** pipelines |
| **JPM CV GPU batch inference** | Early **ML serving** exposure—mention briefly |

---

## 5. Technology Prioritization (P0 / P1 / P2)

Use this to avoid tutorial paralysis. **P0** must appear in capstone or work samples; **P2** is awareness + Phase 5 experiments.

| Priority | Topics |
| --- | --- |
| **P0 (Oct 2026 – Jun 2027)** | Python, Pydantic, Instructor, LangGraph, MCP, LiteLLM, pytest evals, DeepEval or custom golden set, Langfuse or OTel, hybrid retrieval (Qdrant or pgvector), Docker, one of ECS/EKS deploy |
| **P1 (Jan – Sep 2027)** | GraphRAG or Neo4j path, Docling/LlamaParse, OpenLineage, OPA, OpenAPI as IR, K8s+Helm milestone |
| **P2 (Oct – Dec 2027 — frontier focus)** | DSPy, vLLM self-host, LoRA/QLoRA, speculative decoding, semantic cache, E2B, Browser-Use, NeMo Guardrails — **pick 2–3** aligned with 2027 market |

---

## 6. Learning curriculum (canonical)

**Curriculum + app (this repo):**

| File / command | Use |
| --- | --- |
| [`AI_System_Engineer_Learning_Track_2027.md`](./AI_System_Engineer_Learning_Track_2027.md) | **Curriculum only** — Courses 0–15 checklists (feeds the React app via `npm run curriculum`) |
| [`AI_System_Engineer_Master_Plan.md`](./AI_System_Engineer_Master_Plan.md) | **Everything else** — strategy, capstone, ethics, resume, **§17 module reference & appendices** |
| `npm run dev` or [`serve.sh`](../serve.sh) | **Local studio** — React hub at http://localhost:8765 |
| `npm run curriculum` | Regenerate `data/lessons.json` + `src/data/lessonsData.js` from the track |
| `npm run validate` | Link checks + curriculum ↔ app consistency |

**Foundational Video Spines:** Andrej Karpathy (Zero to Hero, NanoGPT), DeepLearning.AI Open Academy, and Stanford CS224N.

Add new **required** study links to the track; add **optional depth** links to **§17** (and mirror must-haves in the track when they become gates).

---

## 7. Frontier Technologies & Systems Additions (Phase 5: H2 2027)

**Schedule:** Explore deeply **after** P0 harness ships (typically **Oct–Dec 2027**). Re-evaluate against current market before investing months in any one item.

**Watch / read / build links:** Learning track **Courses 13–14**; **§17 Appendix D**.

1. **DSPy (Stanford NLP) — Compiling Instead of Prompting:**
   * **Concept:** Compile declarative signatures into prompts/few-shots against a metric instead of manual prompt crafting.
   * **Resource:** [DSPy GitHub Repository](https://github.com/stanfordnlp/dspy)

2. **AI Gateway, Fallbacks & Proxy Routing (LiteLLM):**
   * **Concept:** Multi-provider load balancing, failovers (OpenAI → Anthropic → local vLLM), rate limits, cost budgets.
   * **Resource:** [LiteLLM Documentation](https://docs.litellm.ai/)  
   * **Note:** Basic LiteLLM is **P0** early; advanced proxy features here.

3. **In-Model Prompt Caching & Prefix Caching:**
   * **Concept:** Cache static prefixes (schemas, docs, tools) across requests; lower cost and TTFT.
   * **Resource:** [Anthropic Prompt Caching Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) & [vLLM Automatic Prefix Caching](https://docs.vllm.ai/en/latest/design/automatic_prefix_caching/)

4. **Browser-Use & Vision-to-Action Agents:**
   * **Concept:** DOM/visual browser automation for legacy UIs without APIs.
   * **Resource:** [Browser-Use GitHub Repository](https://github.com/browser-use/browser-use)

5. **Sandboxed Runtimes (E2B / Wasm / MicroVMs):**
   * **Concept:** Isolated execution for agent-generated code.
   * **Resource:** [E2B Documentation](https://e2b.dev/)

6. **Semantic Caching & Gateway Engineering:**
   * **Concept:** Vector similarity cache for near-duplicate queries.
   * **Resource:** [GPTCache GitHub](https://github.com/zilliztech/gptcache) & [Redis Semantic Cache Documentation](https://redis.io/docs/latest/develop/interact/search-and-query/advanced-concepts/vectors/)

7. **Speculative Decoding & Latency Optimization:**
   * **Concept:** Draft model + target model verification for faster generation.
   * **Resource:** [vLLM Speculative Decoding Documentation](https://docs.vllm.ai/en/latest/features/speculative_decoding/)

8. **Guardrails & Prompt Injection Defenses:**
   * **Concept:** Input/output safety and jailbreak detection before tools run.
   * **Resource:** [NeMo Guardrails (NVIDIA)](https://github.com/NVIDIA/NeMo-Guardrails) & [Llama Guard](https://ai.meta.com/research/publications/llama-guard-llm-based-input-output-safeguard-for-human-ai-conversations/)

9. **Fine-Tuning & Quantized Adaptation (LoRA / QLoRA):**
   * **Concept:** PEFT for domain syntax or output shape—not full foundation training.
   * **Resource:** [Unsloth AI GitHub](https://github.com/unslothai/unsloth) & [Hugging Face PEFT Docs](https://huggingface.co/docs/peft/index)

10. **Policy-as-Code & Agent Authorization (OPA):**
    * **Concept:** Authorize tool calls against RBAC before runtime.
    * **Resource:** [Open Policy Agent Documentation](https://www.openpolicyagent.org/)  
    * **Note:** OPA basics are **P1**; advanced policy graphs fit Phase 5.

---

## 8. The 7-Day Sprint (Before 5 Oct 2026)

Full day-by-day **Watch / Read / Build** links: **Learning Track → Course 0**.

Summary: OSS `production-log-reconciler` on **synthetic/public** data only; Instructor + Pydantic + LiteLLM + pytest; schema-valid golden set + invariant validators.

---

## 9. Fifteen-Month Phased Implementation Blueprint

```
+-------------------------------------------------------------------------+
| PHASE 1 (Oct–Dec 2026): Structured determinism, schemas & agent flow   |
| - Karpathy foundations + DeepLearning.AI (LangGraph, Pydantic)         |
| - Instructor + Pydantic + LangGraph baselines + LiteLLM (P0)           |
| - 2K: Learn data contracts; map one AI-adjacent problem (policy-safe)  |
| - Deliverable: OSS reconciler v1 + LangGraph hello with checkpoint     |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
| PHASE 2 (Jan–Mar 2027): MCP, hybrid retrieval & parsing                |
| - FastMCP or official MCP SDK; read-only scoped tools + audit log      |
| - Qdrant or pgvector + BM25 hybrid (RRF)                               |
| - Docling or LlamaParse on public docs                                 |
| - 2K/synthetic: telemetry or ops doc ingestion pipeline                |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
| PHASE 3 (Apr–Jun 2027): Evals, CI gates, policy, tracing               |
| - Hamel evals + DeepEval/Ragas in GitHub Actions                       |
| - OPA gate prototype before “write” tools                              |
| - Langfuse or OTel traces; cost/latency dashboards                     |
| - Optional: Neo4j/GraphRAG slice for dependency/lineage questions      |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
| PHASE 4 (Jul–Sep 2027): Platform v1 + deploy milestone                 |
| - Capstone core: LangGraph + gateway + HITL + eval CI                  |
| - Deploy on ECS or EKS (Helm); document “how another dev adds a tool”  |
| - OpenLineage or manifest-style lineage for agent runs                 |
| - Begin Q2 outreach: 2 technical posts, LinkedIn, selective networking |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
| PHASE 5 (Oct–Dec 2027): Frontier depth, capstone polish, 2027 hiring   |
| - Pick 2–3 P2 topics (Section 7) based on late-2027 market             |
| - vLLM and/or DSPy and/or LoRA only if capstone needs it               |
| - Heavy interviews; Staff AI Platform positioning                      |
+-------------------------------------------------------------------------+
```

---

## 10. Fifteen-Month Progression Tracking Calendar

Per-month **video + text links**: see **Learning Track** courses **M1–M15** (same month labels).

| Month | Calendar | Focus area | Primary frameworks / tools | Concrete milestone deliverable |
| --- | --- | --- | --- | --- |
| **M1** | Oct 2026 | Foundations & mental models | Python, Pydantic, APIs | Schema extractor with validation retry loops; finish 7-day OSS repo. |
| **M2** | Nov 2026 | State machines & agent flow | LangGraph, Instructor | Multi-step graph with persistence, branching, HITL `interrupt()`. |
| **M3** | Dec 2026 | MCP & secure tools | FastMCP / MCP SDK | MCP server: read-only DB/catalog tools + structured audit log. |
| **M4** | Jan 2027 | Hybrid retrieval | Qdrant / pgvector, BM25, RRF | Hybrid search over public or synthetic corpus. |
| **M5** | Feb 2027 | Parsing at scale | Docling / LlamaParse | Pipeline: PDF/HTML → chunks → typed records. |
| **M6** | Mar 2027 | Graph optional track | Neo4j, GraphRAG | Small knowledge graph + one “validator” query (deps/compatibility). |
| **M7** | Apr 2027 | Evaluation harnesses | DeepEval, Ragas, pytest | Golden set (≥30 cases) versioned in repo. |
| **M8** | May 2027 | CI/CD gates | GitHub Actions | PR fails on regression thresholds (accuracy, cost proxy). |
| **M9** | Jun 2027 | Policy & tracing | OPA, Langfuse, OTel | Tool call blocked when policy denies; traces per `run_id`. |
| **M10** | Jul 2027 | Capstone integration | LangGraph, LiteLLM, Postgres | End-to-end reconciliation or telemetry ops platform **alpha**. |
| **M11** | Aug 2027 | Deploy & platform UX | Docker, ECS or EKS, Helm | One production-like deploy + “add a tool” doc for other engineers. |
| **M12** | Sep 2027 | Lineage & hardening | OpenLineage | Provenance from source doc → model calls → DB rows. |
| **M13** | Oct 2027 | Frontier (pick 1–2) | vLLM, DSPy, or semantic cache | Deep dive tied to capstone bottleneck—not parallel science projects. |
| **M14** | Nov 2027 | Frontier (pick 1) + portfolio | Unsloth/LoRA **or** guardrails | Optional domain adapter; only if evals justify it. |
| **M15** | Dec 2027 | Interviews & negotiation | System design, live demos | Target **2027** offers; comp tier A/B per Section 2. |

---

## 11. Ethics, IP & Client Data (2K / Mindera)

| Rule | Action |
| --- | --- |
| **Client data** | No production telemetry, PII, or unreleased game data in public repos or external LLMs without **written** approval. |
| **OSS** | Synthetic generators, public datasets, or anonymized patterns only. |
| **Work samples** | Internal demos under NDA: describe outcomes in interviews without leaking identifiers. |
| **Employer IP** | Clarify with Mindera what side OSS and learning projects are allowed to publish. |
| **Secrets** | Same discipline as CARL/WBD: never commit tokens; use Secrets Manager / env locally. |

---

## 12. Evidence Ladder (What recruiters can verify)

| When | Verifiable evidence |
| --- | --- |
| **Oct 2026** | Public GitHub: log/telemetry reconciler + README metrics |
| **Mar 2027** | MCP server repo or module; demo video or architecture doc |
| **Jun 2027** | Eval JSON + CI badge; sample Langfuse trace screenshots (redacted) |
| **Sep 2027** | Capstone v1: one-command deploy + golden eval results |
| **Dec 2027** | 2–3 technical posts; LinkedIn aligned with Staff AI Platform; interview loop stories |

---

## 13. Capstone Portfolio Project: "Autonomous Data Reconciliation Platform"

Production-grade **open-source** system (financial **or** game-telemetry ops—**pick one vertical** for README clarity). Mirrors institutional reconciliation platforms (e.g. Juniper Square–class problems).

1. **Ingestion layer:** Multi-page financial statements **or** synthetic game telemetry bundles via **Docling** or **LlamaParse**.
2. **Gateway & routing:** Self-hosted **LiteLLM** proxy with failover (cloud models + optional local model); **prompt caching** for static prefixes.
3. **Deterministic extraction:** **Instructor** + **Pydantic**; auto-retry on validation errors.
4. **Guardrails & lineage:** Root validators for invariants, e.g.  
   $\text{Beginning Balance} + \text{Additions} - \text{Deductions} = \text{Ending Balance}$  
   Emit **OpenLineage** (or equivalent) events: source page/chunk → model call → record id.
5. **Policy-as-code gate:** **OPA** (or Rego bundle) before any write tool executes.
6. **LangGraph state engine:**
   * Invariants pass → staged write to PostgreSQL (or Snowflake staging in private fork).
   * Mismatch → `interrupt()` for human review.
7. **Continuous evaluation & CI/CD:** **GitHub Actions** + **DeepEval** (or custom harness). Gate on **tiered metrics**: schema validity 100% on golden set; field F1 ≥ agreed threshold; faithfulness/regression bounds—not a single vague “95%.”
8. **Telemetry:** **Langfuse** (or OTel) for token, latency, cost per run.
9. **Optional Phase 5 add-ons:** **E2B** sandbox for dynamic code; **Redis semantic cache**; **NeMo Guardrails**—document as Phase 2 in README if not in v1.

**Target completion:** Capstone **alpha** Jul 2027; **polish** Sep–Nov 2027.

---

## 14. Resume & LinkedIn Alignment (2027)

### Fix before outreach

* Align title: **Staff / Lead Data Platform Engineer** transitioning to **AI Platform**.
* WBD tenure **Jun 2026 – Sep 2026** is accurate; explain briefly as strategic move to Mindera/2K remote engagement.
* Add **2027 bullets only when true** (OSS URLs, metrics).

### Bullets to earn by mid–late 2027

* Designed and shipped **agent orchestration harness** (LangGraph) with HITL, checkpointing, and MCP tool surface.
* Built **eval regression suite** in CI (golden sets, cost/latency tracking).
* Implemented **LLM gateway** with multi-provider failover and budget caps.
* Connected **semantic / metrics context** to governed agent queries (parallel to Cube-style layers).

### Headline example

`Staff Platform Engineer | Lakehouse, Semantic Metrics & Agent Orchestration`

### Core value statement (interviews)

> *"I engineer deterministic software around stochastic foundation models. My background is distributed data platforms—reconciliation, semantic APIs, streaming, and IaC with test gates. I specialize in schema enforcement, agent state machines, hybrid retrieval, gateway routing, and continuous evaluation so enterprise AI stays auditable, policy-bound, and safe at scale."*

---

## 15. Remote Interview Positioning Strategy (2027)

* **Avoid:** “Prompt engineer,” “chatbot developer,” demo-only Streamlit.
* **Emphasize:** Harness ownership, eval discipline, security, platform for other engineers.
* **Prepare stories:** (1) reconciliation/invariants, (2) orchestration failure + recovery, (3) tool policy deny + audit, (4) eval caught a regression before merge.
* **Degree:** B.Tech is sufficient for most platform roles; do not center Mobius-tier labs in your primary pipeline.
* **Comp:** Negotiate from **Staff data platform** baseline; AI premium follows **shipped agent platform** proof.

---

## 16. Quarterly “Read & Implement” (Research depth without PhD)

Scheduled links: **§17 → Appendix D**.

---

## 17. Module reference & appendices

Granular concept maps, interview prompts, optional shelf, and appendices A–F. The **learning track** stays the short daily checklist; this section is for laptop deep-dives.

| Document | Role |
| --- | --- |
| **Learning track** | Daily Watch / Read / Build / Prove checklists → React studio |
| **This plan (§1–16)** | Strategy, phases, capstone §13, ethics, resume |
| **This plan (§17+)** | Per-course depth, link log, appendices |

---

# Course 0 — Boot sprint (detailed)

## Concept map

- Agentic SDLC: Cursor rules, typing, pytest before “vibe” commits
- LLMs as untrusted kernels; schemas as contracts
- Instructor `response_model`, validation errors as control flow
- LiteLLM: model string, fallbacks, timeouts
- Golden set: input log snippet → expected Pydantic JSON
- Invariants beyond JSON Schema (balances, sums, ranges)
- Threat model: prompt injection on log fields, log exfiltration

## Day-by-day build notes

| Day | Deliverable |
| --- | --- |
| D1 | `pyproject` or `requirements`, ruff/pytest, `.env.example` |
| D2 | `extract(record) -> Model` with 3-retry on `ValidationError` |
| D3 | `data/golden/` + `scripts/score.py` reporting valid % |
| D4 | `litellm.completion` + fallback model list |
| D5 | `@model_validator` or custom checks |
| D6 | `tests/test_golden.py` parametrized |
| D7 | README: metrics, limitations, synthetic data statement |

## Watch / read (full URLs)

| Lesson | Link | ~Time |
| --- | --- | --- |
| Karpathy — Intro to LLMs | https://www.youtube.com/watch?v=zjkBMFhNj_g | 1 h |
| Pydantic for LLM Workflows | https://www.deeplearning.ai/short-courses/pydantic-for-llm-workflows/ | 1 h |
| Instructor quick start | https://python.useinstructor.com/ | — |
| Pydantic V2 | https://docs.pydantic.dev/latest/ | — |
| LiteLLM reliable completions | https://docs.litellm.ai/docs/completion/reliable_completions | — |
| Hamel evals | https://hamel.dev/blog/posts/evals/ | — |
| Applied LLMs | https://applied-llms.org/ | skim |

## Interview prompts

- How do you separate **schema validity** from **semantic correctness**?
- What do you log when an extraction fails after max retries?

---

# Course 1 — M1 LLM foundations (detailed)

## Concept map

- Transformer stack at high level: embeddings, attention, decoder-only inference
- Training vs inference; context window; knowledge cutoff
- Sampling: temperature, top-p; when to use low temperature for extraction
- Tokenization and cost estimation
- Hallucination modes: fabrication vs omission vs formatting
- Structured output strategies: tool JSON, Instructor, outlines/constrained decoding
- Gateway pattern: single entry for models, budgets, logging

## Open Video Spine

| Course | Link | ~Time |
| --- | --- | --- |
| Generative AI with LLMs | https://youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ | 16 h |
| DL.AI landing | https://www.deeplearning.ai/courses/generative-ai-with-llms | — |

## Watch / read (extended)

| Lesson | Link | ~Time |
| --- | --- | --- |
| Karpathy deep dive | https://www.youtube.com/watch?v=7xTGNNLPyMI | 3 h |
| 3Blue1Brown NN / attention | https://www.3blue1brown.com/topics/neural-networks | 2–4 h |
| StatQuest index | https://statquest.org/video-index/ | optional |
| DeepLearning.AI YouTube | https://www.youtube.com/@DeepLearningAI | optional |
| Karpathy channel | https://www.youtube.com/c/AndrejKarpathy | optional |
| Applied LLMs | https://applied-llms.org/ | 3+ sections |
| Instructor patterns | https://python.useinstructor.com/ | — |
| Outlines | https://github.com/dottxt-ai/outlines | optional |
| LiteLLM hub | https://docs.litellm.ai/ | — |
| Chip Huyen blog | https://chiphuyen.com/ | — |
| AI Engineering book repo | https://github.com/chiphuyen/aie-book | — |

## Optional — CampusX

| Lesson | Link |
| --- | --- |
| GenAI LangChain playlist | https://www.youtube.com/playlist?list=PLKnIA16_RmvaTbihpo4MtzVm4XOQa0ER0 |
| Hub roadmap | https://github.com/patchy631/ai-engineering-hub/tree/main/ai-engineering-roadmap |

## Build checklist

- CLI entrypoint (`typer` or `argparse`)
- Config: models, temperatures, max retries via env
- Per-request log: model, tokens, latency, USD estimate

## Interview prompts

- Explain attention in one minute for a data engineer audience.
- When would you **not** use an LLM in a pipeline?

---

# Course 2 — M2 LangGraph (detailed)

## Concept map

- State graph: nodes as pure-ish steps, edges as routing
- Checkpointing: resume after crash; thread id
- `interrupt()` and human-in-the-loop patterns
- Subgraphs vs monolith; when to use Send/API
- Comparison: ReAct loop, LangChain AgentExecutor, LangGraph
- Papers (skim): ReAct, Toolformer — see Appendix F

## Open Video / Docs / academy

| Course | Link | ~Time |
| --- | --- | --- |
| AI Agents in LangGraph | https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/ | 2–3 h |
| LangChain Academy | https://academy.langchain.com/ | 4–8 h |

## Watch / read

| Lesson | Link |
| --- | --- |
| Context Engineering for Agents | https://www.youtube.com/watch?v=4GiqzUHD5AA |
| Dave Ebbelaar | https://www.youtube.com/@daveebbelaar |
| Berkeley RDI | https://www.youtube.com/@BerkeleyRDI |
| LangChain YouTube | https://www.youtube.com/@LangChain |
| Anthropic Effective Agents | https://www.anthropic.com/engineering/building-effective-agents |
| LangGraph docs | https://langchain-ai.github.io/langgraph/ |
| Applied LLMs agents | https://applied-llms.org/ |

## CampusX

| Lesson | Link |
| --- | --- |
| Agentic AI LangGraph playlist | https://www.youtube.com/playlist?list=PLKnIA16_RmvYsvB8qkUQuJmJNuiCUJFPL |
| LangGraph notes index | https://learnwith.campusx.in/courses/LangGraph-YouTube-69145df5c26d79058b698748 |
| RAG with LangGraph video | https://www.youtube.com/watch?v=E1qP9Xsnmik |

## Hands-on hub (code only)

| Repo | Link |
| --- | --- |
| agentic_rag | https://github.com/patchy631/ai-engineering-hub/tree/main/agentic_rag |
| agentic_rag_deepseek | https://github.com/patchy631/ai-engineering-hub/tree/main/agentic_rag_deepseek |

## Interview prompts

- Draw your reconciler graph on a whiteboard: nodes, edges, failure paths.
- How do you test a non-deterministic node?

---

# Course 3 — M3 MCP (detailed)

## Concept map

- MCP: resources vs tools vs prompts
- Transport: stdio vs SSE; security boundaries
- Tool schema versioning; breaking changes
- Audit log design for compliance interviews
- Mapping to “internal API platform” narrative (CARL, Cube)

## Watch / read

| Lesson | Link |
| --- | --- |
| Daily Dose of DS | https://www.youtube.com/@dailydoseofds |
| MCP + FastAPI build | https://www.youtube.com/watch?v=LZAGlCqmhZQ |
| MCP + HITL | https://www.youtube.com/watch?v=BM39OouLNsM |
| MCP intro | https://modelcontextprotocol.io/introduction |
| MCP docs | https://modelcontextprotocol.io/docs |
| MCP Illustrated | https://mcp.dailydoseofds.com |
| FastMCP | https://github.com/jlowin/fastmcp |
| Hub MCP roadmap | https://github.com/patchy631/ai-engineering-hub/blob/main/ai-engineering-roadmap/README.md |
| JSON Schema | https://json-schema.org/ |

## Hands-on hub

| Repo | Link |
| --- | --- |
| llamaindex-mcp | https://github.com/patchy631/ai-engineering-hub/tree/main/llamaindex-mcp |
| mcp-agentic-rag | https://github.com/patchy631/ai-engineering-hub/tree/main/mcp-agentic-rag |
| agent-with-mcp-memory | https://github.com/patchy631/ai-engineering-hub/tree/main/agent-with-mcp-memory |

## Supplementary shelf (optional)

| Resource | Canonical link | When |
| --- | --- | --- |
| Microsoft AI Agents for Beginners | https://github.com/microsoft/ai-agents-for-beginners | Skim with M2–M3 |
| HF Agents course | https://huggingface.co/learn/agents-course/en/unit0/introduction | Optional |
| Kyle Stratis — AI Agents with MCP (book) | Search publisher / O’Reilly | Deep read optional |

---

# Course 4 — M4 Hybrid retrieval (detailed)

## Concept map

- Embeddings: bi-encoder, cosine similarity
- BM25 / sparse retrieval; when lexical beats dense
- RRF fusion formula and parameter sensitivity
- Chunking interaction: recall vs precision
- Agent tool: `search_corpus(query) -> citations`
- Evaluation: recall@k, MRR; labeled q/a set

## Watch / read

| Lesson | Link |
| --- | --- |
| Document Chat RAG | https://www.youtube.com/watch?v=ZgNJMWipirk |
| CampusX Advanced RAG | https://learnwith.campusx.in/courses/Advanced-RAG-69d8037290a183fe36833265 |
| Qdrant docs | https://qdrant.tech/documentation/ |
| Qdrant hybrid | https://qdrant.tech/documentation/concepts/hybrid-queries/ |
| pgvector | https://github.com/pgvector/pgvector |
| Applied LLMs retrieval | https://applied-llms.org/ |

## Hands-on hub

| Repo | Link |
| --- | --- |
| fastest-rag-stack | https://github.com/patchy631/ai-engineering-hub/tree/main/fastest-rag-stack |
| modernbert-rag | https://github.com/patchy631/ai-engineering-hub/tree/main/modernbert-rag |

## Optional (vendor courses — skip unless JD requires Pinecone)

| Resource | Note |
| --- | --- |
| Pinecone vector courses | Vendor-specific; track uses Qdrant/pgvector |

---

# Course 5 — M5 Document parsing (detailed)

## Concept map

- Layout-aware parsing vs naive `pypdf` text
- Tables, headers, footnotes in financial docs
- Chunk boundaries and overlap; metadata for lineage
- LlamaParse vs self-hosted Docling tradeoffs
- `chunks.jsonl` contract for downstream index

## Read / hub

| Lesson | Link | Note |
| --- | --- | --- |
| Docling | https://github.com/DS4SD/docling | Canonical spelling |
| Docling docs | https://github.com/DS4SD/docling#documentation | |
| LlamaParse | https://docs.cloud.llamaindex.ai/llamaparse/getting_started | |
| Chip Huyen data | https://chiphuyen.com/ | |
| Hub rag-with-dockling | https://github.com/patchy631/ai-engineering-hub/tree/main/rag-with-dockling | Folder misspelled |

---

# Course 6 — M6 Graph slice (detailed)

## Concept map

- Property graph vs RDF; when graphs help reconciliation
- GraphRAG vs simple vector RAG
- Validator pattern: “no deploy if dependency cycle”
- Cypher basics: match, where, return
- Scope: **one** validator, not full GraphRAG product

## Watch / read / hub

| Lesson | Link |
| --- | --- |
| Neo4j GraphAcademy | https://graphacademy.neo4j.com/ |
| CampusX Graph RAG modules | https://learnwith.campusx.in/courses/Advanced-RAG-69d8037290a183fe36833265 |
| Microsoft GraphRAG | https://github.com/microsoft/graphrag |
| Neo4j Cypher | https://neo4j.com/docs/cypher-manual/current/ |
| graphiti-mcp | https://github.com/patchy631/ai-engineering-hub/tree/main/graphiti-mcp |

---

# Course 7 — M7 Evaluation harness (detailed)

## Concept map

- Golden set schema: `input`, `expected`, `tags`, `tier`
- Tier 1: JSON/schema 100%
- Tier 2: field-level F1 / exact match
- Tier 3: LLM-judge / faithfulness (use sparingly)
- Ragas metrics: context precision, faithfulness
- DeepEval: pytest integration
- Version golden set in git; review PRs that change labels

## Watch / read / hub

| Lesson | Link |
| --- | --- |
| RAG Evaluation video | https://www.youtube.com/watch?v=bB56BaQIBm4 |
| Hamel evals | https://hamel.dev/blog/posts/evals/ |
| Applied LLMs evaluation | https://applied-llms.org/ |
| DeepEval | https://docs.confident-ai.com/docs/getting-started |
| Ragas install | https://docs.ragas.io/en/stable/getstarted/install/ |
| Ragas metrics | https://docs.ragas.io/en/stable/concepts/metrics/ |
| eval-and-observability hub | https://github.com/patchy631/ai-engineering-hub/tree/main/eval-and-observability |

---

# Course 8 — M8 Eval CI/CD (detailed)

## Concept map

- Baseline file committed; PR diffs metrics
- Secrets in CI: API keys via GitHub secrets
- Flaky evals: fixed seeds, cache LLM responses for CI optional
- Fail messages: which case regressed

## Read

| Lesson | Link |
| --- | --- |
| Hamel index | https://hamel.dev/ |
| DeepEval CI/CD | https://docs.confident-ai.com/docs/evaluation-end-to-end-ci-cd |
| Applied LLMs testing | https://applied-llms.org/ |

---

# Course 9 — M9 Policy + tracing (detailed)

## Concept map

- OPA: allow/deny on `input.tool`, `input.role`
- Test Rego with `opa test`
- Langfuse traces: spans for LLM, tools, graph nodes
- Correlate `run_id` across LiteLLM + LangGraph
- Redaction before screenshotting traces

## Watch / read

| Lesson | Link |
| --- | --- |
| LangSmith crash course | https://www.youtube.com/watch?v=4FFspU4riHk |
| Context Engineering | https://www.youtube.com/watch?v=4GiqzUHD5AA |
| OPA docs | https://www.openpolicyagent.org/docs/latest/ |
| Langfuse | https://langfuse.com/docs |
| Langfuse tracing | https://langfuse.com/docs/tracing |
| OTel Python | https://opentelemetry.io/docs/languages/python/ |
| LiteLLM Langfuse | https://docs.litellm.ai/docs/observability/langfuse_integration |

---

# Course 10 — M10 Capstone (detailed)

## Architecture layers (align Plan §13)

1. Ingestion — Docling/LlamaParse  
2. Gateway — LiteLLM + caching + failover  
3. Extraction — Instructor/Pydantic  
4. Invariants + lineage events  
5. OPA before writes  
6. LangGraph + HITL  
7. Eval CI  
8. Langfuse/OTel  

## Prompt caching evidence template (README)

| Run | TTFT (ms) | Input tokens | Cached tokens | Notes |
| --- | --- | --- | --- | --- |
| 1–5 cold | | | | |
| 6–10 warm | | | | |

## Read

| Lesson | Link |
| --- | --- |
| Anthropic prompt caching | https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching |
| LiteLLM prompt caching | https://docs.litellm.ai/docs/completion/prompt_caching |
| LiteLLM proxy caching | https://docs.litellm.ai/docs/proxy/caching |
| OpenAPI 3 | https://swagger.io/specification/ |

## Hands-on hub

| Repo | Link |
| --- | --- |
| financial-analyst-deepseek | https://github.com/patchy631/ai-engineering-hub/tree/main/financial-analyst-deepseek |
| deploy-agentic-rag | https://github.com/patchy631/ai-engineering-hub/tree/main/deploy-agentic-rag |
| groundX-doc-pipeline | https://github.com/patchy631/ai-engineering-hub/tree/main/groundX-doc-pipeline |

---

# Course 11 — M11 Deploy (detailed)

## Concept map

- Twelve-factor for agents: config, logs, stateless API
- Sidecar vs separate LiteLLM deployment
- Health checks: API, worker, vector DB
- `docs/adding-a-tool.md`: schema, auth, eval case required

## Read

| Lesson | Link |
| --- | --- |
| K8s Deployments | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ |
| K8s docs home | https://kubernetes.io/docs/home/ |
| Helm quickstart | https://helm.sh/docs/intro/quickstart/ |
| Argo CD | https://argo-cd.readthedocs.io/en/stable/getting_started/ |
| LiteLLM proxy | https://docs.litellm.ai/docs/simple_proxy |

---

# Course 12 — M12 Lineage (detailed)

## Concept map

- OpenLineage job/run/dataset model
- Emit on: chunk id, model call id, row id
- Threat model: injection via retrieved docs, tool escalation

## Read

| Lesson | Link |
| --- | --- |
| OpenLineage site | https://www.openlineage.io/ |
| OpenLineage docs | https://openlineage.io/docs |
| Applied LLMs pitfalls | https://applied-llms.org/ |

---

# Course 13–14 — Frontier (detailed)

See Plan §7 for full P2 catalog. Course 13 tracks:

| Track | Link |
| --- | --- |
| vLLM | https://docs.vllm.ai/ |
| DSPy | https://github.com/stanfordnlp/dspy |
| Prefix caching | https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching |
| Semantic cache | https://github.com/zilliztech/gptcache |
| DeepSeek finetuning hub | https://github.com/patchy631/ai-engineering-hub/tree/main/DeepSeek-finetuning |

Course 14: Unsloth, PEFT, NeMo Guardrails, E2B, Karpathy Zero to Hero playlist.

---

# Course 15 — Interviews (detailed)

## Story bank (prepare 4 narratives)

1. Reconciliation / invariants (WBD, Trainline, CARL)
2. Orchestration failure + recovery (checkpoint, retry)
3. Policy deny + audit (OPA/MCP)
4. Eval caught regression before merge

## Read

| Lesson | Link |
| --- | --- |
| Applied LLMs | https://applied-llms.org/ |
| Anthropic Effective Agents | https://www.anthropic.com/engineering/building-effective-agents |
| AI Engineer talks | https://www.youtube.com/@ai.engineer |

## System design drills

- Design an LLM gateway for 50 internal apps
- Design eval CI for a extraction pipeline
- Design MCP tool registry with RBAC

---

# Appendix A — DeepLearning.AI short courses

Catalog: https://www.deeplearning.ai/short-courses/

| When | Course | Link |
| --- | --- | --- |
| M0–M1 | Pydantic for LLM Workflows | https://www.deeplearning.ai/short-courses/pydantic-for-llm-workflows/ |
| M2 | AI Agents in LangGraph | https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/ |
| As needed | Search “RAG”, “evaluation”, “fine-tuning” | https://www.deeplearning.ai/short-courses/ |

---

# Appendix B — CampusX playlists

| Playlist | Link | Use in |
| --- | --- | --- |
| Agentic AI LangGraph | https://www.youtube.com/playlist?list=PLKnIA16_RmvYsvB8qkUQuJmJNuiCUJFPL | M2–M3 |
| Generative AI LangChain | https://www.youtube.com/playlist?list=PLKnIA16_RmvaTbihpo4MtzVm4XOQa0ER0 | M1 optional |
| Advanced RAG | https://learnwith.campusx.in/courses/Advanced-RAG-69d8037290a183fe36833265 | M4–M7 |
| LangGraph notes | https://learnwith.campusx.in/courses/LangGraph-YouTube-69145df5c26d79058b698748 | M2–M3 |

Do not skip hands-on coding or capstone Prove gates.

---

# Appendix C — AI Engineering Hub

| Resource | Link |
| --- | --- |
| Main index | https://github.com/patchy631/ai-engineering-hub |
| Roadmap | https://github.com/patchy631/ai-engineering-hub/tree/main/ai-engineering-roadmap |
| Daily Dose of DS | https://www.youtube.com/@dailydoseofds |

Clone-and-diff only — not primary video curriculum.

---

# Appendix D — Quarterly read & implement

| Quarter | Watch / read | Link | Implement |
| --- | --- | --- | --- |
| Q4 2026 | Karpathy deep dive | https://www.youtube.com/watch?v=7xTGNNLPyMI | Structured output in repo |
| Q1 2027 | Berkeley RDI | https://www.youtube.com/@BerkeleyRDI | Checkpointing |
| Q2 2027 | Applied LLMs evals | https://applied-llms.org/ | +10 golden cases |
| Q3 2027 | MCP changelog | https://modelcontextprotocol.io/docs | Tool schema version |
| Q4 2027 | M13 frontier | see Course 13 | Capstone PR |

---

# Appendix E — Link validation log

URLs in the **Learning track** and this reference were checked with HTTP `GET` on **13 Sep 2026** (status **200** or redirect to 200). Re-validate after major edits.

If a link breaks: use the official doc root from the same domain in the course Read list.

---

# Appendix F — Supplementary shelf (@meghana.ai PDF index)

Canonical destinations for the 37-item **AI Learning Resources** PDF (`~/Downloads/ai-learning-resources.pdf`). PDF uses fragile `t.co` links — prefer these URLs.

## Videos (8)

| # | Title | Canonical starting point |
| --- | --- | --- |
| 1 | LLM Introduction | https://www.youtube.com/watch?v=zjkBMFhNj_g |
| 2 | LLMs from Scratch | https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ |
| 3 | Agentic AI Overview (Stanford) | https://www.youtube.com/@StanfordOnline (search agentic AI) |
| 4 | Building and Evaluating Agents | https://www.deeplearning.ai/short-courses/ |
| 5 | Building Effective Agents | https://www.anthropic.com/engineering/building-effective-agents |
| 6 | Building Agents with MCP | https://modelcontextprotocol.io/introduction |
| 7 | Building an Agent from Scratch | https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/ |
| 8 | Philo Agents | Optional — verify PDF link before investing time |

## Repos (12)

| # | Title | Link |
| --- | --- | --- |
| 1 | GenAI Agents | https://github.com/NirDiamant/GenAI_Agents |
| 2 | Microsoft AI Agents for Beginners | https://github.com/microsoft/ai-agents-for-beginners |
| 3 | Prompt Engineering Guide | https://github.com/dair-ai/Prompt-Engineering-Guide |
| 4 | Hands-On Large Language Models | https://github.com/HandsOnLLM/Hands-On-Large-Language-Models |
| 5 | AI Agents for Beginners | https://github.com/microsoft/ai-agents-for-beginners |
| 6 | GenAI Agents (alt) | https://github.com/NirDiamant/GenAI_Agents |
| 7 | Made with ML | https://github.com/GokuMohandas/Made-With-ML |
| 8 | Hands-On AI Engineering | https://github.com/chiphuyen/aie-book |
| 9 | Awesome Generative AI Guide | https://github.com/aishwaryanr/awesome-generative-ai-guide |
| 10 | Designing Machine Learning Systems | https://github.com/chiphuyen/dmls-book |
| 11 | ML for Beginners (Microsoft) | https://github.com/microsoft/ML-For-Beginners |
| 12 | LLM Course (mlabonne) | https://github.com/mlabonne/llm-course |

## Guides (5)

| # | Title | Link |
| --- | --- | --- |
| 1 | Google Agent Whitepaper | https://ai.google.dev/gemini-api/docs/agents |
| 2 | Google Agent Companion | https://ai.google.dev/gemini-api/docs/agents |
| 3 | Anthropic Building Effective Agents | https://www.anthropic.com/engineering/building-effective-agents |
| 4 | Claude Code best practices | https://docs.anthropic.com/en/docs/claude-code |
| 5 | OpenAI Practical Guide to Building Agents | https://openai.com/business/guides-and-resources/ |

## Books (7) — read at most one in parallel

| # | Title | Notes |
| --- | --- | --- |
| 1 | Understanding Deep Learning | Theory optional |
| 2 | Building an LLM from Scratch | Karpathy book — deep optional |
| 3 | LLM Engineering Handbook | Third-party; verify edition |
| 4 | AI Agents Definitive Guide (Koenigstein) | Optional |
| 5 | Building Applications with AI Agents (Albada) | Optional |
| 6 | AI Agents with MCP (Stratis) | Pairs with M3 |
| 7 | AI Engineering (Huyen) | https://github.com/chiphuyen/aie-book |

## Papers (4) — one evening before M2 or M15

| Paper | Search |
| --- | --- |
| ReAct | arXiv ReAct synergizing reasoning and acting |
| Generative Agents | Stanford generative agents paper |
| Toolformer | Meta Toolformer |
| Chain-of-Thought | Wei et al. chain-of-thought prompting |

## Courses (5)

| # | Title | Link |
| --- | --- | --- |
| 1 | HuggingFace Agent Course | https://huggingface.co/learn/agents-course/en/unit0/introduction |
| 2 | MCP with Anthropic | https://modelcontextprotocol.io/docs |
| 3 | Pinecone vector DB course | https://www.pinecone.io/learn/ |
| 4 | Vector DB embeddings to apps | Vendor-specific — prefer M4 Qdrant/pgvector |
| 5 | Agent Memory | Hub: agent-with-mcp-memory |

**Mapping rule:** PDF items are **optional** unless tagged in a Reference course section above.

---

*End of detailed reference. Daily checklists: `AI_System_Engineer_Learning_Track_2027.md`.*
