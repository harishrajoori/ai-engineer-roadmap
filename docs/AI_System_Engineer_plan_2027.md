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

**Daily learning (Notion / mobile):** Import **[`AI_System_Engineer_Learning_Track_2027.md`](./AI_System_Engineer_Learning_Track_2027.md)** as your **Interactive Learning Hub & Curriculum** — checkbox syllabi, Prove gates, Courses 0–15. **Deep topics, appendices, and optional shelf:** **[`AI_System_Engineer_Learning_Track_2027_REFERENCE.md`](./AI_System_Engineer_Learning_Track_2027_REFERENCE.md)**. This plan file keeps strategy, market context, capstone §13, ethics, and resume.

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

**Two-file curriculum (import both into Notion):**

| File | Use |
| --- | --- |
| [`AI_System_Engineer_Learning_Track_2027.md`](./AI_System_Engineer_Learning_Track_2027.md) | **Daily driver** — Modular Courses 0–15, checkbox syllabi, Prove gates |
| [`AI_System_Engineer_Learning_Track_2027_REFERENCE.md`](./AI_System_Engineer_Learning_Track_2027_REFERENCE.md) | **Depth** — concept maps, interview prompts, hub/CampusX tables, appendices A–F |
| [`ai-learning-hub/`](./ai-learning-hub/) | **Notion CSVs** + local Learning Hub (`serve.sh`, `NOTION_SETUP.md`) |

**Foundational Video Spines:** Andrej Karpathy (Zero to Hero, NanoGPT), DeepLearning.AI Open Academy, and Stanford CS224N.

Do not maintain a third parallel resource list; add new links to the Reference (and mirror required items in the Notion track).

---

## 7. Frontier Technologies & Systems Additions (Phase 5: H2 2027)

**Schedule:** Explore deeply **after** P0 harness ships (typically **Oct–Dec 2027**). Re-evaluate against current market before investing months in any one item.

**Watch / read / build links:** Notion track **Courses 13–14**; Reference **Appendix D**.

1. **DSPy (Stanford NLP) — Compiling Instead of Prompting:**
   * **Concept:** Compile declarative signatures into prompts/few-shots against a metric instead of manual prompt crafting.
   * **Resource:** [DSPy GitHub Repository](https://github.com/stanfordnlp/dspy)

2. **AI Gateway, Fallbacks & Proxy Routing (LiteLLM):**
   * **Concept:** Multi-provider load balancing, failovers (OpenAI → Anthropic → local vLLM), rate limits, cost budgets.
   * **Resource:** [LiteLLM Documentation](https://docs.litellm.ai/)  
   * **Note:** Basic LiteLLM is **P0** early; advanced proxy features here.

3. **In-Model Prompt Caching & Prefix Caching:**
   * **Concept:** Cache static prefixes (schemas, docs, tools) across requests; lower cost and TTFT.
   * **Resource:** [Anthropic Prompt Caching Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) & [vLLM Automatic Prefix Caching](https://docs.vllm.ai/en/latest/features/prefix_caching.html)

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

Scheduled links: **Reference → Appendix D**.

---

*Original plan file: `AI_System_Engineer_plan.md` — superseded for timeline (2027 target). **Notion curriculum:** [`AI_System_Engineer_Learning_Track_2027.md`](./AI_System_Engineer_Learning_Track_2027.md). **Detailed reference:** [`AI_System_Engineer_Learning_Track_2027_REFERENCE.md`](./AI_System_Engineer_Learning_Track_2027_REFERENCE.md).*
