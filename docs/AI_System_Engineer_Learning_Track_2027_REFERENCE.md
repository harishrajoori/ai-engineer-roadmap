# AI Systems Engineer — Detailed Module Reference (2027)

**Purpose:** Self-study depth behind the Notion-friendly track [`AI_System_Engineer_Learning_Track_2027.md`](./AI_System_Engineer_Learning_Track_2027.md). Use this on laptop when you want granular topics, optional resources, code-lab indexes, and interview prep — not on mobile day-to-day.

| Document | Role |
| --- | --- |
| **Learning Track (Notion)** | Coursera-style checklists, Prove gates, import-ready |
| **This file** | Exhaustive topics, appendices, optional shelf |
| **Plan 2027** | Strategy, ethics §11, capstone §13, resume §14–15 |

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

## Coursera spine

| Course | Link | ~Time |
| --- | --- | --- |
| Generative AI with LLMs | https://www.coursera.org/learn/generative-ai-with-llms | 16 h |
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

## Coursera / academy

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

Do not substitute CampusX for Coursera Courses 1–2 or capstone Prove gates.

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

URLs in the **Notion track** and this reference were checked with HTTP `GET` on **13 Sep 2026** (status **200** or redirect to 200). Re-validate after major edits.

If a link breaks: use the official doc root from the same domain in the course Read list.

---

# Appendix F — Supplementary shelf (@meghana.ai PDF index)

Canonical destinations for the 37-item **AI Learning Resources** PDF (`~/Downloads/ai-learning-resources.pdf`). PDF uses fragile `t.co` links — prefer these URLs in Notion.

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
| 4 | Hands-On Large Language Models | https://github.com/hands-on-llm/hands-on-large-language-models |
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
| 1 | Google Agent Whitepaper | https://www.kaggle.com/whitepaper-agents |
| 2 | Google Agent Companion | https://www.kaggle.com/whitepaper-agents |
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
