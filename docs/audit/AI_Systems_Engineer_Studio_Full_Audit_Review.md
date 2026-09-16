# AI Systems Engineer Learning Studio — Full End-to-End Audit & Review Dump

**Repository:** https://github.com/harishrajoori/ai-engineer-roadmap  
**Audit date:** 16 September 2026  
**Scope:** Application (React + Vite studio), data layer, generation pipeline, course content (Courses 0–15), Prove gates, implementation catalog, UX, maintainability, and prioritized change backlog.

This document consolidates a complete review of the project: architecture, strengths, gaps, course-by-course deep dive, data model notes, application findings, and concrete recommendations.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Repository Overview](#2-repository-overview)
3. [What You Get (Product Layers)](#3-what-you-get-product-layers)
4. [Architecture Spine & Capstone Story](#4-architecture-spine--capstone-story)
5. [High-Level Grades](#5-high-level-grades)
6. [Strengths (Keep These)](#6-strengths-keep-these)
7. [Application Review (React Studio)](#7-application-review-react-studio)
8. [Data Layer & Generation Pipeline](#8-data-layer--generation-pipeline)
9. [Implementation Repo Catalog](#9-implementation-repo-catalog)
10. [Course Content — Program Overview](#10-course-content--program-overview)
11. [Deep Dive: Every Course (0–15)](#11-deep-dive-every-course-015)
12. [Cross-Cutting Curriculum Issues](#12-cross-cutting-curriculum-issues)
13. [Prove Gates — Consistency Audit](#13-prove-gates--consistency-audit)
14. [Topic Theory & Lab Coverage](#14-topic-theory--lab-coverage)
15. [UX & Learning Experience Gaps](#15-ux--learning-experience-gaps)
16. [Maintainability & Engineering Debt](#16-maintainability--engineering-debt)
17. [Prioritized Change Backlog](#17-prioritized-change-backlog)
18. [What Not to Change](#18-what-not-to-change)
19. [Suggested Immediate Experiments](#19-suggested-immediate-experiments)
20. [Appendix A — File & Documentation Map](#appendix-a--file--documentation-map)
21. [Appendix B — npm Scripts Reference](#appendix-b--npm-scripts-reference)
22. [Appendix C — Lesson Type Counts](#appendix-c--lesson-type-counts)
23. [Appendix D — Glossary Snapshot (from enrichment)](#appendix-d--glossary-snapshot-from-enrichment)

---

## 1. Executive Summary

**AI Systems Engineer Learning Studio** is an open, self-paced curriculum plus interactive React + Vite app focused on building **production LLM systems**: structured extraction, agents, MCP, RAG, evaluation harnesses, policy, deployment, and a capstone prove path.

**Audience:** Engineers comfortable with Python, git, and data/platform work who want a guided path from LLM basics to portfolio-ready platform skills—without requiring paid MOOCs.

**Pace:** About 15 months at 10–15 hours per week (self-paced).

**Core thesis:** Treat LLMs as untrusted compute kernels. Invest in contracts, gateways, orchestration, tools, retrieval, evals, policy, and observability—not demo scripts or foundation-model training.

**Verdict in one line:** One of the more thoughtful, systems-oriented open AI engineering curricula available. The Prove culture and architecture spine are strengths; maintainability, UX clarity, Prove consistency, and capstone product realism need work.

---

## 2. Repository Overview

### Quick facts

| Item | Detail |
|------|--------|
| App stack | React 19 + Vite 8, Mermaid, KaTeX, Google OAuth, optional Cloudflare Worker sync |
| Syllabus source | Markdown in `docs/` |
| Runtime data | `data/lessons.json` → copied to `public/data/lessons.json` |
| Lesson count | **141** topics across Courses 0–15 |
| Generation | `npm run curriculum` (Python scripts) |
| Validation | `npm run validate:ci` (app, models, prove workflow, repos, curriculum, public audit, implementation audit) |
| Deploy | Static build → GitHub Pages (or any static host) |

### Top-level layout

```
docs/                          Syllabus and master plan (human-edited)
docs/topic_theory/             Per-topic studio theory markdown (inputs to generation)
data/
  lessons.json                 Generated lesson graph
  curriculum_enrichment.json   Glossary, concept maps, prove packs
  topic_handbook.json          Topic handbook entries
  implementation_repo_catalog.json
  lab_scenarios.json
  external_curriculum_links.json
  topic_implementation_overrides.json
public/data/lessons.json       Copy served to the browser
scripts/                       Curriculum compiler, validators, enrichment, labs
src/                           React application (Vite)
sync-worker/                   Optional Cloudflare Worker for cloud sync
```

### Canonical documents

| Document | Role |
|----------|------|
| `docs/AI_Platform_System_Engineer_Program_Brief.md` | **Read first:** platform narrative (also on studio home) |
| `docs/DOCUMENTATION_MAP.md` | How brief, track, primer, walkthrough, and lessons.json connect |
| `docs/AI_System_Engineer_Learning_Track_2027.md` | Course-by-course topics, resources, Prove checklist |
| `docs/AI_System_Engineer_Master_Plan.md` | Strategy, capstone (§13), ethics, deep module reference |
| `docs/AI_for_Data_Engineers_Primer.md` | Onboarding for data/platform engineers |
| `docs/OPTIONAL_MODEL_DEPTH.md` | Optional transformer / training depth |

---

## 3. What You Get (Product Layers)

| Layer | Description |
|-------|-------------|
| **Syllabus** | 16 courses (0–15): readings, videos, labs, and **Prove** gates with concrete deliverables |
| **Learning studio** | Browse courses, theory at beginner/intermediate/advanced depth, lecture notes, Lab & Prove panels, local progress |
| **Implementation links** | Topic-scoped GitHub repos and paths (validated catalog), not generic hub links on every row |
| **Optional AI mentor** | Bring your own API keys (Gemini, Groq, OpenRouter, etc.) for in-app explanations and regenerations |
| **Optional cloud sync** | Google sign-in + Cloudflare Worker backend to sync progress across devices |

Free external docs and short courses (DeepLearning.AI, Microsoft/Google open curricula, etc.) are linked where they fit.

---

## 4. Architecture Spine & Capstone Story

The track builds toward a single integrated story:

```
Logs / docs → LiteLLM gateway → Instructor / Pydantic extraction
  → LangGraph + HITL → MCP tools + OPA → RAG + eval CI → deploy + lineage
```

Course Prove gates map to artifacts along this spine (gateway release, agent demo, MCP server, golden eval set, CI gate, traces, deploy proof, `v1.0` tag, etc.).

**Capstone intent (Courses 10–12):** One end-to-end AI platform on public or synthetic data: gateway, contracts, orchestration, tools, retrieval, eval gates, policy, traces, deploy, lineage.

**Non-goals (Year 1):** Training foundation models from scratch; research-lab-only career path; shipping a buzzword list without evals + traces + harness; sending production client data to external APIs without approval.

---

## 5. High-Level Grades

| Area | Grade | Summary |
|------|-------|---------|
| Curriculum concept & spine | **A** | One of the best open AI-platform curricula available |
| Prove discipline | **A−** | Excellent idea; acceptance criteria still uneven |
| Data model & generation pipeline | **B+** | Powerful but complex; high maintenance cost |
| React application | **B** | Feature-rich; App.jsx overloaded; UX friction |
| Topic theory coverage | **B−** | 141 topics; minority have hand-authored studio guides |
| Capstone realism | **B** | Good spine; product story and dataset still thin |
| Long-term maintainability | **C+** | Too many generation scripts; risk of drift |

---

## 6. Strengths (Keep These)

### Curriculum design

- Starting with **structured extraction (Course 0)** before deep LLM theory is excellent for data/platform engineers.
- **Prove gates** with concrete artifacts (GitHub releases, golden sets, CI screenshots, tags, demos) differentiate this from “watch this / read that” roadmaps.
- Clear architecture spine gives learners a single coherent story.
- Good prioritization (P0 / P1 / P2) and realistic non-goals.
- Strong emphasis on **harness over framework** and LLMs as untrusted kernels.
- Explicit credibility-bridge table mapping prior data/platform work to AI systems language (resume/interview gold).

### Engineering of the repo

- Clean separation: human-edited markdown (`docs/`) → generated `lessons.json`.
- Solid validation story (`validate:ci`, repo catalog validation, public content audit, prove workflow tests).
- Implementation catalog curated with local setup hints and portfolio notes.
- Studio has real depth: multi-depth theory, Lab & Prove panels, Mermaid, math, optional mentor, progress + optional cloud sync.

### Audience fit

- Written for data/platform engineers with pipeline experience.
- DE analogies in glossary and theory reduce jargon friction.

---

## 7. Application Review (React Studio)

### Stack & structure

- **Entry:** `src/App.jsx` (large orchestrator), `main.jsx`, `index.css`
- **Components (sample):** Header, Sidebar, LessonFeed, SmartStage, CourseStage, HomeStage, Inspector, LabProvePanel, SettingsModal, RegenerateModal, MobileLearningBar, MarkdownProse, MermaidBlock, GoogleSignInButton, CourseEnrichmentPanels, CurriculumShell, etc.
- **Services/utils:** curriculumLoader, aiService, proveWorkflow, studioCloudSync, learningLayout, studyStreak, theoryRegenerationStore, implementationResources, googleAuth, localStorage helpers
- **Config:** aiModels.js, studio runtime config

### State surface (from App.jsx)

Progress, notes, prove map, portfolio repo URL, prove checklist map, video overrides, theory regenerations, API keys, preferred model, theme, user profile, study days/streak, curriculum data (lessons, courses_ref, primer, brief, walkthrough, glossary, portfolio starter), layout, cloud sync status, Google auth, etc.

Many independent `localStorage` keys (`ai_hub_react_*`) with separate `useEffect` writers.

### Architecture & code health — problems

1. **`App.jsx` is a god-component** (900+ lines) holding curriculum, progress, prove, settings, cloud sync, layout, and navigation.
2. **Fragmented localStorage** — easy to desync; hard to migrate or test as a unit.
3. **Cloud sync intertwined with local state** — merge/push logic is complex; conflict rules need explicit documentation and tests.
4. **Weak separation** between curriculum data, user progress, and settings.

### Recommended application changes

1. Split into focused hooks/stores:
   - `useCurriculum()`
   - `useProgress()` (progress + notes + streak)
   - `useProveWorkflow()` (prove URLs + checklist + portfolio repo)
   - `useSettings()` (keys, model, theme, layout)
   - `useCloudSync()`
2. Single typed progress/prove schema (even if still in localStorage) for migration and cloud merge.
3. Extract cloud sync with explicit conflict-resolution rules and tests (extend `test_prove_workflow.mjs` pattern).
4. Freeze the lesson object schema the UI depends on; fail CI if required fields disappear.

### UX / product gaps

**High priority**

| Issue | Why it matters | Suggested fix |
|-------|----------------|---------------|
| Weak global “what should I do next?” | Learners get lost across 141 topics | Persistent Next Action card (course + topic + Prove status) |
| Prove status scattered | Hard to see portfolio readiness | Single Prove Dashboard (16 courses, status, links, checklist %) |
| Progress per-lesson, not per-Prove | Videos done ≠ portfolio | Weight progress by Prove completion |
| Onboarding text-heavy | First hour relies on long markdown | Interactive “Course 0 in 60 minutes” path |
| Mobile density | Too many panels | Focus mode; hide secondary panels by default on small screens |

**Medium priority**

- Search across topics, resources, Prove criteria
- Clearer Required vs Optional visual distinction
- Export progress + Prove worksheet as one Markdown/JSON portfolio summary
- Progressive disclosure in Lab & Prove (scenario → code → plan → checklist → repos)

### Feature debt notes

- Optional AI mentor (BYOK) can distract from Prove work → consider default-off or hard token budget for new users.
- Theory regeneration is useful for power users; keep secondary to curated theory.
- Google sign-in + cloud sync is optional and correctly designed, but client-ID/origins/worker setup will block many users. Emphasize “local-only is fine.”

---

## 8. Data Layer & Generation Pipeline

### Runtime bundle (`data/lessons.json`)

Top-level keys include:

- `generated_from`
- `program_primer_markdown`
- `program_brief_markdown`
- `program_walkthrough`
- `glossary`
- `portfolio_starter`
- `lessons` (array of 141)
- `courses_ref`

**Sample lesson fields:** `order`, `course`, `course_title`, `month`, `type`, `lesson`, `section`, `section_label`, `url`, `youtube_id`, `embed_url`, `duration`, `required`, `status`, `is_start_here`, `access_tier`, `open_how`, `study_order`, `resources`, `lab_plan`, `theory_levels`, `theory_studio_guide`, `theory_summary`, `prove_criteria`, etc.

### Enrichment (`curriculum_enrichment.json`)

- **Glossary** with DE analogies (token, context window, hallucination, Instructor, LiteLLM, golden set, LangGraph, HITL, MCP, etc.)
- **Concept maps** per course (0–15)
- **Prove packs** with acceptance criteria, readme examples, commands
- Real-world ladders / where-it-applies style metadata (consumed into course overview)

### Lab & implementation data

- `lab_scenarios.json` → DE narratives + code blocks into `lab_plan.de_lab`
- `implementation_repo_catalog.json` → validated GitHub repos with courses, local setup, portfolio notes
- `topic_handbook.json`, overrides, external curriculum links

### Generation & scripts (partial list)

`generate_lessons.py`, `merge_topic_handbook.py`, `lab_implementation.py`, `lab_scenarios.py`, `theory_builder.py`, `theory_enrichment.py`, `topic_theory_levels.py`, `topic_plain_english.py`, `topic_diagrams.py`, `curriculum_enrichment.py`, `github_repo_validate.py`, `audit_implementation_resources.py`, `audit_public_content.py`, `validate_curriculum.py`, `curriculum_qa.py`, `walkthrough_content.py`, and many more under `scripts/`.

**Regenerate:** `npm run curriculum` then `npm run validate:ci`.

### Data strengths

- Markdown-as-source is maintainable for humans.
- Enrichment + prove packs + glossary are high quality.
- Validation pipeline is mature for an open curriculum project.

### Data risks

| Risk | Detail |
|------|--------|
| Giant generated artifact | ~24k-line `lessons.json` → noisy diffs, slow reviews |
| Many generation scripts | 30+ scripts → high cognitive load |
| Authored theory coverage | Only a subset of topics have `docs/topic_theory/*.studio.md` |
| Implementation matching drift | Needs ongoing audit |
| Dual source tension | Track vs enrichment vs handbook vs lab_scenarios vs topic_theory |

### Recommended data changes

1. **Stabilize lesson schema** — document required/optional fields; version it; CI-guard the React contract.
2. **Reduce regeneration blast radius** — per-course JSON, or commit only after validate and squash curriculum commits.
3. **Expand hand-authored visual guides selectively** (see §14).
4. **Tighten every prove_pack** to binary/measurable criteria + example README + commands.
5. **Ensure DE lab coverage** on every Build/Prove-heavy course.
6. **Catalog hygiene** — monthly `validate:repos`; prefer deep links; cull weak matches.

---

## 9. Implementation Repo Catalog

### Strengths

- High-quality entries (Instructor, Pydantic, PydanticAI, LiteLLM, LangGraph, Outlines, Chip Huyen aie-book, patchy hub, large curriculum repos, etc.).
- `github_validation` metadata (stars, languages, pushed_at, ok flag).
- Local clone/setup/env/portfolio_note fields.
- Wired into Lab & Prove as “Code for this topic.”

### Recommendations

1. Run monthly `validate:repos` (optional `GITHUB_TOKEN`).
2. Prefer **folder-level** links inside mega-repos over root URLs.
3. Audit topic match scores; remove low-relevance placements.
4. Add a few “boring production” references if missing (OTel examples, OPA/conftest patterns, minimal FastAPI + LiteLLM gateway templates).
5. Keep the rule: extract one pattern into the learner’s portfolio—do not fork wholesale.

---

## 10. Course Content — Program Overview

| # | Course | When | Hours | Prove (summary) |
|---|--------|------|-------|-----------------|
| 0 | Boot: structured extraction | Foundation week | 14–28 | Public GitHub reconciler |
| 1 | LLM foundations & deterministic I/O | Month 1 | 12–18 | Release `v0.2` + metrics |
| 2 | Agent orchestration (LangGraph) | Month 2 | 12–18 | HITL demo in README |
| 3 | Tools & MCP | Month 3 | 12–16 | MCP server + audit log |
| 4 | Hybrid retrieval | Month 4 | 10–14 | Hybrid benchmark table |
| 5 | Document parsing & chunks | Month 5 | 10–14 | `chunks.jsonl` + schema |
| 6 | Graph & GraphRAG slice | Month 6 | 10–14 | Validator test + query |
| 7 | Evaluation harness | Month 7 | 10–14 | Golden set ≥30 cases |
| 8 | Eval CI/CD gates | Month 8 | 8–12 | CI blocks regression |
| 9 | Policy + observability | Month 9 | 10–14 | Trace + policy test |
| 10 | Capstone integration | Month 10 | 16–24 | Tag `alpha` + caching proof |
| 11 | Deploy & platform UX | Month 11 | 12–16 | Deploy screenshot + tool doc |
| 12 | Lineage & hardening | Month 12 | 8–12 | Tag `v1.0` + lineage sample |
| 13 | Frontier (pick 1–2) | Month 13 | 8–16 | README “why we added X” |
| 14 | Frontier + portfolio | Month 14 | 8–12 | Posts + resume refresh |
| 15 | Interviews & offers | Month 15 | 10–20 | Offer or feedback notes |

**Free spine (parallel with 1–2):** Karpathy Deep Dive into LLMs; DeepLearning.AI AI Agents in LangGraph.

**Lesson density (approx):** Course 0: 9 · 1: 14 · 2: 11 · 3: 13 · 4: 9 · 5: 6 · 6: 6 · 7: 9 · 8: 5 · 9: 10 · **10: 20** · 11: 7 · 12: 5 · 13: 5 · 14: 5 · 15: 7

**Types (approx):** Read 59 · Video 30 · Build 16 · Prove 16 · Capstone 14 · Frontier 4 · Do 2

---

## 11. Deep Dive: Every Course (0–15)

### Course 0 — Boot: Structured Extraction (7-day intensive)

**Hours:** 14–28  
**Prove:** Public GitHub reconciler + schema-valid % on golden set

**Goal:** Messy text → trusted, typed records. No deep transformer theory yet.

**Core skills:** Instructor + Pydantic `response_model`; retry loops; invariant validators; LiteLLM fallbacks; golden-set metrics; pytest; README threat model.

**Daily plan (suggested):** D1 Tooling & agentic SDLC → D2 Pydantic + Instructor → D3 Ingestion + metrics → D4 LiteLLM fallbacks → D5 Invariants → D6 Pytest → D7 Ship.

**Key resources:** Karpathy Intro to LLMs; DL.AI Pydantic for LLM Workflows; Instructor quickstart; Pydantic V2; LiteLLM reliable completions; Hamel evals intro; Applied LLMs (skim).

**Build:** `production-log-reconciler` / `telemetry-log-reconciler` (synthetic/public data only).

**Prove pack themes:** Public repo; data source documented; golden-set metric; pytest passes; optional threat model.

**Capstone link:** Extraction core.

**Notes / change needs:** Make golden-set size and target metric explicit (e.g. n≥30, valid JSON ≥90%). Ensure DE lab ships a minimal complete starter structure.

---

### Course 1 — LLM Foundations & Deterministic I/O

**Hours:** 12–18  
**Prove:** GitHub release `v0.2` + README metrics

**Goal:** Interview-ready LLM mental models + hardened extraction with cost logging and routing.

**Core skills:** Lifecycle, limits, tokens, KV cache (intuition); attention (3Blue1Brown + Karpathy); LiteLLM router + per-request cost log; CLI hardening.

**Key resources:** Karpathy Deep Dive (~3 h); 3Blue1Brown; Applied LLMs; Chip Huyen + aie-book; optional Outlines.

**Studio rule:** Theory (Foundations) before Lecture on every topic. Optional depth: `OPTIONAL_MODEL_DEPTH.md`.

**Prove pack themes:** Tag/release `v0.2`; README table model/tokens/latency/USD; LiteLLM router or proxy in repo.

**Capstone link:** Gateway + cost attribution.

**Change needs:** Enforce theory-before-lecture in UI; standardize cost/latency table format.

---

### Course 2 — Agent Orchestration (LangGraph)

**Hours:** 12–18  
**Prove:** HITL fail-path demo (GIF or short video)

**Goal:** Stateful, interruptible workflows.

**Core skills:** Cyclic graphs, state, branching, checkpointing, `interrupt()`; LangChain vs LangGraph tradeoffs; wrapping reconciler in LangGraph.

**Key resources:** DL.AI AI Agents in LangGraph; LangChain Academy Intro to LangGraph; Anthropic Building Effective Agents; LangGraph docs.

**Build:** `reconciler-agent` with SQLite/Postgres checkpointer.

**Prove:** Validation fail → interrupt → resume demo + checkpointer documented.

**Capstone link:** Orchestration control plane.

**Change needs:** Require short recorded demo/GIF; add compact interview narrative box (LangGraph vs alternatives).

---

### Course 3 — Tools & MCP

**Hours:** 12–16  
**Prove:** MCP server + audit log + redacted client config

**Goal:** Controlled, discoverable, audited tools.

**Core skills:** MCP client/server; tool schema discovery; read-only tools + JSONL audit; wire into LangGraph; JSON Schema.

**Key resources:** MCP introduction + spec; FastMCP; Daily Dose of DS MCP videos; multi-agent MCP examples.

**Build:** Tools e.g. `lookup_schema`, `query_golden_set`, `run_readonly_sql`; audit fields `user_id`, `tool`, `args_hash`, `timestamp`.

**Prove:** README + redacted Cursor/Claude MCP snippet.

**Capstone link:** Secure tool surface (later gated by OPA).

**Change needs:** Keep tools read-only; fix audit log schema for reuse later; version the client snippet.

---

### Course 4 — Hybrid Retrieval

**Hours:** 10–14  
**Prove:** Benchmark table (dense-only vs hybrid)

**Goal:** Retrieval as an agent tool, not chat-only RAG.

**Core skills:** Dense + sparse (BM25) + RRF; recall@k on labeled questions; Qdrant or pgvector.

**Key resources:** Qdrant hybrid docs; pgvector; Applied LLMs retrieval; solid RAG walkthrough video.

**Build:** Public/synthetic corpus + index + benchmark.

**Prove:** Committed dense vs hybrid metrics table.

**Capstone link:** Knowledge retrieval layer.

**Change needs:** Require a small labeled Q/A set so recall@k is reproducible.

---

### Course 5 — Document Parsing & Chunks

**Hours:** 10–14  
**Prove:** Sample `chunks.jsonl` + documented schema

**Goal:** Reliable PDF/HTML → chunk pipeline with provenance.

**Core skills:** Docling (preferred) or LlamaParse; page-level provenance (`source_page`, `doc_id`, `chunk_id`); feed Course 4 index.

**Key resources:** Docling docs/repo; LlamaParse getting started; Chip Huyen on data for LLM systems.

**Prove:** Sample file + schema in README.

**Capstone link:** Ingestion front-end.

**Change needs:** Treat provenance fields as a non-negotiable contract.

---

### Course 6 — Graph & GraphRAG Slice

**Hours:** 10–14  
**Prove:** Failing validator test + query in repo

**Goal:** Lightweight entity/relation modeling and pre-execution validation.

**Core skills:** Entity/relation modeling; one validator query; graph checks before execution (policy-test / conftest analogy).

**Prove pack themes:** One Cypher (or equivalent) validator test in CI; failing + passing example.

**Capstone link:** Optional GraphRAG path + pre-execution validation pattern.

**Change needs (important):** Currently the weakest mid-track course. Either deepen (clear failure mode + real slice) or shrink to a short “validator pattern” elective so it does not dilute momentum.

---

### Course 7 — Evaluation Harness

**Hours:** 10–14  
**Prove:** Golden set ≥30 cases + summary metrics

**Goal:** Measurable quality, not “works on my laptop.”

**Core skills:** Golden-set design; metrics (schema validity, semantic quality, retrieval); eval runner → JSON report.

**Key resources:** Hamel evals; DeepEval / Ragas; Applied LLMs evaluation; hub eval-and-observability.

**Prove:** ≥30 cases committed + metrics summary.

**Capstone link:** Quality gate foundation.

**Change needs:** Emphasize edge-case quality over raw count; document metric tiers.

---

### Course 8 — Eval CI/CD Gates

**Hours:** 8–12  
**Prove:** CI blocks regression (fail → fix evidence)

**Goal:** Evaluation as a merge gate.

**Core skills:** GitHub Actions for evals; baseline metrics file; fail-closed thresholds; secrets and flaky-eval controls (seeds, caching).

**Key resources:** DeepEval CI/CD docs; Hamel; Applied LLMs testing/monitoring.

**Build:** `.github/workflows/evals.yml` + `evals/baseline.json`.

**Prove:** Screenshot/links of CI fail on regression then pass after fix.

**Capstone link:** Regression protection.

**Notes:** Highest-signal portfolio piece for platform roles. Keep strict.

---

### Course 9 — Policy + Observability

**Hours:** 10–14  
**Prove:** Trace + policy unit test

**Goal:** Control tool side effects; see what happened.

**Core skills:** OPA/Rego allow/deny; Langfuse or OpenTelemetry; correlate `run_id` across LiteLLM + LangGraph; cost/latency attribution.

**Key resources:** OPA docs; Langfuse tracing; LiteLLM↔Langfuse; OTel Python.

**Build:** Rego (e.g. block `write_*` for role `analyst`) + end-to-end tracing.

**Prove:** Redacted trace + policy test output.

**Capstone link:** Governance + observability.

**Change needs:** Require deny + allow tests; redaction checklist before sharing traces.

---

### Course 10 — Capstone Integration

**Hours:** 16–24  
**Prove:** Git tag `alpha` + demo script + prompt-caching evidence

**Goal:** Wire Courses 0–9 into one coherent platform.

**Architecture layers:**

1. Ingestion (Docling/LlamaParse)  
2. Gateway (LiteLLM + failover + prompt caching)  
3. Extraction (Instructor/Pydantic)  
4. Invariants + lineage events  
5. OPA before writes  
6. LangGraph + HITL  
7. Eval CI  
8. Tracing (Langfuse/OTel)

**Required practical gate:** Prompt caching evidence — static prefix identified; caching configured; README table TTFT + cached vs uncached tokens (≥10 requests).

**Build:** One-command local demo (ideally `docker compose up`) for happy path + one HITL failure path.

**Change needs (critical):**

- Course has ~20 lessons — highest risk of scope explosion.
- Mentally split: (a) wire existing pieces, (b) caching evidence, (c) one-command demo.
- Add a **concrete product brief**: name, personas, 3–4 user stories, synthetic dataset description, SLO table.
- Prefer working minimal platform over half-finished maximal platform.

---

### Course 11 — Deploy & Platform UX

**Hours:** 12–16  
**Prove:** Deploy screenshot + `docs/adding-a-tool.md`

**Goal:** Run the platform; make it usable by other engineers.

**Core skills:** Deploy API + worker + LiteLLM + Postgres (ECS/EKS/compose); health checks; platform doc for adding a tool (schema, auth, eval case).

**Key resources:** K8s Deployments, Helm, Argo CD (as needed); LiteLLM proxy docs.

**Change needs:** Minimal “adding a tool” doc that another engineer could follow; avoid abstract deploy theater without a running surface.

---

### Course 12 — Lineage & Hardening

**Hours:** 8–12  
**Prove:** Tag `v1.0` + lineage sample

**Goal:** Accountability closed loop; threat model updated.

**Core skills:** OpenLineage (or equivalent) events: chunk → model call → row; threat model (retrieval injection, tool escalation).

**Change needs:** Lineage sample should reference real IDs from the running system, not only a toy JSON blob. This is the production-baseline tag.

---

### Course 13 — Frontier Deep Dive

**Hours:** 8–16  
**Prove:** README “why we added X” with bottleneck + metric

**Goal:** Time-box 1–2 advanced topics after core platform is solid.

**Suggested tracks:** vLLM; DSPy; deeper prefix/prompt caching; semantic cache (e.g. GPTCache).

**Change needs:** Force before/after metric and short rationale. Do not let frontier work replace a weak v1.0.

---

### Course 14 — Frontier + Portfolio

**Hours:** 8–12  
**Prove:** 1–2 public posts + resume refresh

**Goal:** Package work for the market; optional LoRA/QLoRA, NeMo Guardrails, E2B.

**Focus:** Portfolio narrative (harness, evals, policy, lineage); resume bullets via credibility-bridge table; optional deeper frontier.

---

### Course 15 — Interviews & Offers

**Hours:** 10–20  
**Prove:** Offer letter or structured feedback notes

**Goal:** Convert platform story into interviews and outcomes.

**Preparation:** Four narratives — (1) reconciliation/invariants, (2) orchestration failure + recovery, (3) policy deny + audit, (4) eval caught regression. System-design drills: LLM gateway for many apps; eval CI for extraction; MCP tool registry with RBAC. Live capstone demo with traces and CI story.

**Change needs:** Pull 2–3 system-design prompts into earlier courses as optional practice so interview prep is not entirely back-loaded.

---

### How courses build on each other

```
0  Extraction contracts
1  + Gateway + cost
2  + Stateful orchestration + HITL
3  + Secure tools (MCP)
4  + Hybrid retrieval
5  + Reliable ingestion
6  + Graph validation slice
7  + Evaluation harness
8  + Eval as CI gate
9  + Policy + tracing
10 = Integrated alpha platform (+ caching)
11 = Deployed + usable by others
12 = Lineage + hardened v1.0
13–14 = Frontier depth + packaging
15 = Market outcome
```

---

## 12. Cross-Cutting Curriculum Issues

| Issue | Courses affected | Recommendation |
|-------|------------------|----------------|
| Uneven lesson density | Course 10 (20) vs 5/6/8/12 (5–6) | Rebalance or label “integration” vs “new skill” |
| Prove gates vary in strictness | 0–5 strong; 6, 11–15 softer | Align all packs to same rigor |
| Optional content volume | Many Watch/Read rows | Aggressive Required-only filter in UI |
| Capstone product story | 10–12 | Name, persona, synthetic messy dataset, SLOs |
| Career module late | 15 | Optional practice drills earlier |
| Missing themes | Cross-cutting | Cost/capacity, prompt injection earlier, multi-tenancy notes, streaming/long-running agents, failure injection lab, human-eval when auto metrics disagree |

### Missing or under-emphasized topics (program-level)

- Cost & capacity management (budgets, quotas, caching strategy comparison) as first-class content
- Prompt injection / adversarial robustness earlier than frontier
- Multi-tenancy & isolation patterns
- Streaming & cancellation/resume semantics
- Versioned data contracts across services
- Chaos / failure-injection labs
- Explicit human evaluation process when metrics disagree

---

## 13. Prove Gates — Consistency Audit

### Stronger packs (generally)

- **0:** Public repo + golden metric + pytest  
- **1:** `v0.2` + cost/latency table + LiteLLM  
- **2:** HITL fail path + checkpointer  
- **3:** MCP + audit sample  
- **4:** Benchmark table + labeled set  
- **5:** `chunks.jsonl` + schema  
- **7:** ≥30 golden cases + tiers  
- **8:** CI fail-closed + baseline  
- **9:** OPA test + redacted trace  

### Soft or uneven packs (tighten)

- **6:** Validator test exists but course narrative is thin  
- **10:** Tag + demo + caching — needs product brief + one-command demo as primary bar  
- **11:** Deploy screenshot + doc — risk of shallow evidence  
- **12:** Lineage sample — risk of toy artifact  
- **13–14:** Narrative proves — keep, but require metric for 13  
- **15:** Outcome-based — fine as career module  

### Universal Prove rubric goals

Every course Prove should aim for:

1. **Artifact** (repo path, tag, CI run, file, demo)  
2. **Evidence of quality** (metric, test output, screenshot with context)  
3. **Reproducibility** (commands or script)  
4. **Safety** (synthetic/public data; redaction where needed)

---

## 14. Topic Theory & Lab Coverage

### Theory system

- Levels: Foundations → Study guide / Visual guide → Lecture/Reading → Platform depth  
- Many topics use **generated** theory (plain English, diagrams, handbook enrichment).  
- **Hand-authored** `docs/topic_theory/*.studio.md` exist for a minority (examples: Karpathy intro/deep-dive, Instructor, gateway, LangGraph, MCP, document RAG, hybrid benchmark, selected builds).

### QA log highlights

- Plain-English + visuals pass claimed over all 141 topics via generators.  
- Handbook batches in `scripts/handbook_batches/`.  
- Validation includes handbook length checks post-merge.

### Recommendations

**Priority hand-authored visual guides:**

- Course 0 extraction / golden set  
- Course 2 LangGraph HITL  
- Course 3 MCP tools  
- Course 4 hybrid retrieval benchmark  
- Course 7–8 eval harness + CI  
- Course 9 OPA + tracing  
- Course 10 capstone architecture  

Leave remaining topics on generated theory until pain is felt.

**Labs:** Every Build/Prove-heavy course should have a solid `de_lab` scenario with copy-pasteable code blocks. Thin scenarios undermine the data-engineer promise.

---

## 15. UX & Learning Experience Gaps

1. **Next action** is not obvious across 141 topics.  
2. **Prove Dashboard** missing as a first-class view.  
3. Progress does not weight Prove completion.  
4. First-hour path is still document-heavy.  
5. Lab & Prove panel is information-dense (needs progressive disclosure).  
6. Required vs Optional can be clearer.  
7. Search across curriculum would help navigation.  
8. Mentor can become a distraction without budgets.  
9. Mobile needs aggressive Focus defaults.

---

## 16. Maintainability & Engineering Debt

| Debt | Impact | Mitigation |
|------|--------|------------|
| Monolithic `lessons.json` | Noisy PRs | Schema freeze; squash curriculum commits; consider split |
| 30+ generation scripts | Onboarding cost for future maintainers | Document pipeline order; reduce one-off scripts |
| God-component App.jsx | Bugs and fear of change | Hook split + schema |
| Dual content sources | Drift | DOCUMENTATION_MAP + single regenerate+validate ritual |
| Implementation catalog growth | Stale links | Monthly validate + cull |
| Uneven Prove strictness | Uneven portfolio quality | Standardize prove_packs |

**Ritual for every syllabus change:**

```bash
npm run curriculum
npm run validate:ci
```

---

## 17. Prioritized Change Backlog

**Status (studio repo, Sep 2026):** P0 and most P1/P2 studio items below are implemented in code/docs; deferred items are noted inline.

### P0 — Next 2–4 weeks

1. ~~Split `App.jsx` state into focused hooks; freeze progress/prove schema.~~ → `src/hooks/*`, `learnerStateSchema.js`, backup `schema_version`.  
2. ~~Add a **Prove Dashboard**~~ → `ProveDashboard.jsx` on home.  
3. ~~Tighten Prove acceptance for Courses **6, 10, 11, 12**.~~ → `curriculum_enrichment.json` prove_packs.  
4. ~~Write a short **capstone product brief**~~ → `docs/capstone_product_brief.md` on Course 10 overview.  
5. ~~Rebalance or explicitly label Course 10 lessons~~ → `capstone_track` + `CapstoneScopeLegend`.

### P1 — Following

6. **Expand `.studio.md` guides** — 13 authored guides (was 10); add more on demand for shallow theory warnings.  
7. ~~DE lab scenario + code on Build/Prove path~~ → `lab_scenarios.json` + CI warning for courses 0–15.  
8. ~~Next Action + Required-only filter~~ → `NextActionCard`, syllabus toggle, prove-weighted progress.  
9. ~~Lesson JSON schema + diff hygiene~~ → `lesson_json_schema.md`, `DOCUMENTATION_MAP.md`.  
10. ~~Course 4 labeled Q/A + recall@k~~ → prove_pack + learning track.

### P2 — Later

11. ~~Search~~ → `TopicSearchModal`; ~~portfolio export~~ → backup JSON + **portfolio summary Markdown** on Prove dashboard; mentor **default brief depth** + daily budget UI existing.  
12. ~~Progressive disclosure in Lab & Prove~~ → `LabProveDisclosure`; mobile layout defaults mentor collapsed on narrow viewports.  
13. ~~Monthly implementation-catalog hygiene~~ → `docs/implementation_catalog_hygiene.md`.  
14. **Split lessons by course** — documented as deferred in `lesson_json_schema.md`.  
15. **Earlier prompt-injection / cost-control modules** — content track change (Course 0 threat model in prove pack; no new course).  
16. **Optional system-design topics before Course 15** — content/backlog only.

---

## 18. What Not to Change (Yet)

- Overall 0→15 architecture spine  
- Starting with structured extraction instead of transformers  
- Prove-as-merge-gate philosophy  
- Markdown-as-source + generated studio data approach  
- DE-first analogies and glossary  
- Optional nature of frontier and most videos  
- Synthetic/public data only rule  
- Validation-first contributor workflow  

These are the project’s core strengths.

---

## 19. Suggested Immediate Experiments

1. **Prove Dashboard prototype** — component reading `proveMap` + `proveChecklistMap` + enrichment `prove_packs` → 16-row status board.  
2. **Course 10 product brief** — 1-page markdown in `docs/` surfaced on Course 10 overview.  
3. **Course 6 decision** — thicken graph validator story **or** demote to short elective.  
4. **Schema freeze** — document lesson fields the React app depends on; CI fails if required fields vanish.  
5. **Course 0 metric contract** — explicit n and threshold in prove_pack and README example.

---

## Appendix A — File & Documentation Map

| Artifact | Role | Consumed by |
|----------|------|-------------|
| `AI_Platform_System_Engineer_Program_Brief.md` | Canonical story | Humans; `program_brief_markdown` → home |
| `AI_for_Data_Engineers_Primer.md` | Short in-app companion | `program_primer_markdown` → Course 0 overview |
| `AI_System_Engineer_Learning_Track_2027.md` | Syllabus source (checkboxes) | `generate_lessons.py` → `lessons[]` |
| `AI_System_Engineer_Master_Plan.md` | Strategy, §17 depth, appendices | Humans (not auto-bundled) |
| `OPTIONAL_MODEL_DEPTH.md` | Optional model depth | Linked from Course 1 |
| `docs/topic_theory/*.studio.md` | Authored visual theory | `theory_levels` / studio guide flags |
| `scripts/walkthrough_content.py` | Home/course walkthrough objects | `program_walkthrough`, `courses_ref` |
| `data/curriculum_enrichment.json` | Glossary, maps, prove packs | Merged into runtime JSON |
| `data/lessons.json` + `public/data/lessons.json` | Runtime bundle | `curriculumLoader.js` |
| `data/lab_scenarios.json` | DE lab narratives + code | `lab_plan.de_lab` |

**Learner content order (from DOCUMENTATION_MAP):** Home brief → Course 0 overview → Course 0 START HERE → Course 1 theory-before-lecture → 2–3 orchestration/tools → 4–6 retrieval/docs → 7–9 evals/CI/policy → 10–12 integrate/deploy/lineage → 13–15 frontier/portfolio/career.

---

## Appendix B — npm Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Oxlint on src/ and scripts/ |
| `npm run curriculum` | Regenerate lesson JSON from markdown + data files |
| `npm run validate` | App wiring + curriculum validation |
| `npm run validate:ci` | Full CI gate |
| `npm run validate:repos` | Check implementation catalog against GitHub |
| `npm run audit:implementation` | Drift checks for topic-scoped implementation links |
| `npm run audit:public` | Scan for sensitive patterns in public bundle inputs |

---

## Appendix C — Lesson Type Counts

Approximate distribution across 141 lessons:

| Type | Count |
|------|------:|
| Read | 59 |
| Video | 30 |
| Build | 16 |
| Prove | 16 |
| Capstone | 14 |
| Frontier | 4 |
| Do | 2 |

Per-course lesson counts (approx):  
0:9 · 1:14 · 2:11 · 3:13 · 4:9 · 5:6 · 6:6 · 7:9 · 8:5 · 9:10 · **10:20** · 11:7 · 12:5 · 13:5 · 14:5 · 15:7

---

## Appendix D — Glossary Snapshot (from enrichment)

Selected terms with data-engineer analogies (abbreviated):

| Term | Definition (short) | DE analogy |
|------|--------------------|------------|
| Token | Chunk of text model reads/generates | Rows/bytes processed—cost driver |
| Context window | Max tokens per request | Max batch size |
| Hallucination | Plausible but wrong output | Bad join that still returns a row |
| Structured output | Force schema (JSON/Pydantic) | Contract-first API types |
| Instructor | LLM + Pydantic + retries | Retry until payload passes schema |
| LiteLLM | Multi-provider gateway | API gateway + failover |
| Golden set | Fixed labeled examples | Fixture tables / regression datasets |
| Eval harness | Scripts/CI scoring golden set | pytest + data diff in CI |
| Invariant | Business rule beyond JSON shape | Custom SQL / domain constraints |
| LangGraph | Agent workflows as graphs | Airflow DAG with state + approvals |
| HITL | Human-in-the-loop pause | Manual approval step |
| MCP | Standard tool/resource protocol | Internal tool catalog + OpenAPI |
| Audit log | Who invoked which tool | CloudTrail / access logs |

---

## Closing

This audit treats the studio as both a **learning vehicle** and a **portfolio-grade product**. The architecture spine and Prove culture are worth protecting. The highest leverage improvements are: (1) Prove Dashboard + stricter mid/late Prove packs, (2) App state decomposition and schema freeze, (3) Capstone product brief and Course 10 scope control, (4) Selective hand-authored theory and full DE lab coverage on critical path.

**End of full audit dump.**  
Regenerate curriculum and run `npm run validate:ci` after any structural edits.

---

*Document generated as a consolidated review dump for harishrajoori/ai-engineer-roadmap — September 2026.*
