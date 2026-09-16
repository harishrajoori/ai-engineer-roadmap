# AI Systems Engineer Roadmap — GPT-6 Astra Curriculum Review

**Repository:** https://github.com/harishrajoori/ai-engineer-roadmap  
**Review date:** September 2026  
**Source:** External review (GPT-6 Astra); imported from author’s `Documents/` RTF for tracking in-repo.  
**Companion audits:** [Grok studio audit](./AI_Systems_Engineer_Studio_Full_Audit_Review.md) (application UX; largely addressed on `main`).

**Scope:** Syllabus depth, systems vs platform engineering positioning, prove gates, sequencing, pacing, and repo maintainability—not React studio features.

---

## Executive summary

The curriculum is **substantially better than a typical AI roadmap**: project-led, aimed at experienced engineers, focused on production concerns rather than prompt-engineering tutorials.

**Main conclusion:** Strong for an **AI systems engineer** building one production LLM application; needs more **platform engineering** depth to fully justify **AI platform engineer** (multi-team paved road, tenants, SRE, IaC, serving economics, second app onboarded without cloning the capstone).

| Lens | Rating |
|------|--------|
| AI systems engineering | **8.5 / 10** |
| AI platform engineering | **7 / 10** |
| Fit for data / platform engineers | **9 / 10** |

---

## Overall assessment

| Area | Assessment |
|------|------------|
| Target audience | Excellent fit for data/platform engineers |
| Project-based learning | Excellent |
| LLM application engineering | Strong |
| Evaluation and governance | Strong |
| Infrastructure / platform engineering | Moderate |
| Model serving and inference operations | Needs expansion |
| Reliability and operations | Needs expansion |
| Scope and pacing | Too broad in places |
| Portfolio value | Strong |

---

## Strengths (keep these)

1. **Engineering before model theory** — Structured extraction, schemas, validation, retries, golden datasets, and metrics first. “LLM as untrusted compute” → contracts, evals, audit, HITL.
2. **Artifact ladder** — Prove gates force releases, benchmarks, CI, policy tests, deployable capstone—not completion badges.
3. **Coherent capstone spine** — One evolving platform (reconciliation story) beats unrelated monthly demos.
4. **Evaluation discipline** — Schema validity, exact match / F1, retrieval metrics, judges, CI regression; golden set ≥30 with label review.
5. **DE transition** — Primer maps contracts, DQ tests, lineage, observability, and approval steps to AI platform language.

---

## Core issue: systems engineer vs platform engineer

The track mostly builds **one well-engineered AI system**. A **platform engineer** also provides a **reusable paved road** for other teams:

- Multi-team model gateway, templates/SDKs, tenant isolation, quotas, identity, secrets
- Central eval, prompt/model registries, deployment automation, SLOs, incident response
- Developer self-service, capacity and cost management

`docs/adding-a-tool.md` is a good start; Astra argues it is not sufficient alone.

### Recommended positioning (Astra)

| Option | Action |
|--------|--------|
| A | Rename to “AI Systems **and** Platform Engineer” |
| B | Keep “AI Platform Engineer” but add an explicit **platform extension path** after the application foundation |

**Repo choice:** Option B — see [`AI_Platform_System_Engineer_Program_Brief.md`](../AI_Platform_System_Engineer_Program_Brief.md) § Platform extension path and [`Astra_Curriculum_Gap_Matrix.md`](./Astra_Curriculum_Gap_Matrix.md).

---

## Ten underdeveloped themes (+ prove gate ideas)

| # | Theme | Prove gate (behavioral) |
|---|--------|-------------------------|
| 1 | Multi-tenancy and platform identity | Two apps share gateway; different models, budgets, tools, rate limits; deny + audit on violation |
| 2 | Secrets and data protection | Rotate provider credential without redeploy; redact sensitive fields in traces |
| 3 | Reliability / SRE | Simulate throttle/failure; degrade predictably; idempotency; SLO dashboard |
| 4 | Model serving / inference ops | Benchmark local or GPU vs hosted on latency, throughput, quality, cost |
| 5 | Infrastructure as code | PR provisions/changes staging; smoke + eval; rollback |
| 6 | Supply-chain security | CI SBOM, image scan, block critical CVE; release manifest with versions |
| 7 | Prompt/model/dataset lifecycle | Trace ID → full config replay current vs previous release |
| 8 | Retrieval operations | Update/delete docs, ACL-aware retrieval, embedding migration, recall before promote |
| 9 | Agent / MCP security | Adversarial suite: unauthorized writes, exfil, injected tool instructions, tool loops |
| 10 | FinOps / capacity | Monthly showback; enforce tenant budget without affecting others |

Full gap mapping to current courses 0–15: [`Astra_Curriculum_Gap_Matrix.md`](./Astra_Curriculum_Gap_Matrix.md).

---

## Sequencing recommendations

**Keep early order largely as-is** (structured output → gateway → orchestration → tools → retrieval → eval → policy → integrate → deploy).

**Changes Astra suggests:**

| Change | Rationale |
|--------|-----------|
| **Eval earlier and continuous** | Every course: task → metric → fixtures → implement → measure → CI regression; Course 7 = *advanced* eval |
| **Threat modeling before MCP and RAG** | Security surfaces in Courses 3–4, not only Course 9 |
| **Docker → Compose → managed service → K8s** | Explicit ladder before EKS-heavy prove |
| **Separate “platformization” from app alpha** | Shared gateway, policy, eval runner, templates, tenant config—*second app* without copying capstone |
| **Scope honesty** | Core 6–8 mo · Platform 3–4 mo · Optional 2–3 mo vs single “15 months” without hour reconciliation |

### North-star course map (not yet adopted in lesson order)

Astra proposed reordering courses (eval in 2, threat model in 4, identity in 9, reliability 10, IaC 11, serving 12, self-service 13, capstone 14, interviews 15). Treat as **v2 proposal**—do not renumber 142 lessons without a dedicated migration plan.

**Graduation test:** A **second application** can onboard to the platform without copying capstone internals.

---

## Prove gates: prefer executable evidence

Replace screenshot-only gates with:

- Acceptance criteria, automated tests, operational metrics, failure injection
- ADR, reproduction command, security note, cost result, limitations

**Example upgrade (Course 11):** Implemented in track + `prove_packs["11"]` — deploy from clean env, health + smoke eval + policy tests, rollback, peer follows `adding-a-tool.md`.

### Review rubric (dimensions)

Correctness · Reliability · Security · Observability · Cost · Operability · Developer experience · Reproducibility.

---

## Framework → capability teaching

Organize lessons around **capabilities**, not product names:

| Capability | Reference implementation |
|------------|-------------------------|
| Model access / routing | LiteLLM |
| Typed output | Instructor + Pydantic |
| Durable orchestration | LangGraph |
| Tool protocol | MCP |
| Policy | OPA |
| Tracing | OpenTelemetry / Langfuse |
| Offline eval | Custom harness, DeepEval, Ragas |

Per lesson: problem solved, contract, failure modes, swap path, portable data.

---

## Repository and studio (maintainability)

| Recommendation | Repo status |
|----------------|-------------|
| One canonical syllabus map | [`DOCUMENTATION_MAP.md`](../DOCUMENTATION_MAP.md) |
| Curriculum schema + CI | [`lesson_json_schema.md`](../lesson_json_schema.md), `validate:ci` |
| Coverage report (theory / lab / gate / links) | Partial — `validate_curriculum.py`, handbook warnings |
| Resource review metadata | Backlog |
| Isolate scratch / temp files | Backlog (`scratch_verified_vids.json`, login test scripts) |
| License + CONTRIBUTING | Backlog |
| Diagnostic prerequisites | Backlog |

Studio UX backlog: see Grok audit §17 (mostly done).

---

## Priority changes (Astra top five)

1. Clarify role target: **systems vs platform** (brief + platform path).
2. Add **platformization phase** (multi-tenancy, identity, quotas, templates, self-service).
3. Add **SRE / failure engineering** (SLOs, backpressure, idempotency, runbooks).
4. Add **one model-serving module** (economics, batching, autoscaling concept + benchmark).
5. **Executable prove gates** (Course 11 updated first).

---

## Implementation tracking in this repo

| Step | Artifact | Status |
|------|----------|--------|
| 1 | This document + `DOCUMENTATION_MAP` link | Done |
| 2 | Platform extension path in program brief | Done |
| 3 | Course 11 prove (track + enrichment) | Done |
| 4 | [`Astra_Curriculum_Gap_Matrix.md`](./Astra_Curriculum_Gap_Matrix.md) | Done |

After syllabus or enrichment edits: `npm run curriculum` && `npm run validate:ci`.

---

*Imported for harishrajoori/ai-engineer-roadmap — September 2026.*
