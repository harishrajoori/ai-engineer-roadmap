# Astra curriculum gap matrix

Maps [GPT-6 Astra review](./AI_System_Engineer_Astra_Curriculum_Review.md) themes to **current** courses 0–15. Status is **content intent**, not automated CI.

| Astra theme | Primary courses today | Status | Next action |
|-------------|----------------------|--------|-------------|
| Structured extraction & golden set | 0 | **Done** | Maintain prove_pack n≥30 |
| Gateway & unit economics | 1 | **Done** | — |
| Stateful orchestration & HITL | 2 | **Done** | — |
| MCP & tools | 3 | **Partial** | Add threat-model lab before deep MCP writes |
| Hybrid retrieval benchmarks | 4 | **Done** | recall@k in prove_pack |
| Document parsing & chunks | 5 | **Done** | — |
| Graph slice / validator | 6 | **Done** | ADR: [`course_6_graph_scope.md`](../decisions/course_6_graph_scope.md) |
| Eval harness (formal) | 7 | **Partial** | Micro-eval each course 2–6 in primer habit |
| Eval CI gate | 8 | **Done** | Prefer failing CI link over screenshot-only |
| Policy + traces | 9 | **Partial** | Move threat-model **concepts** earlier (3–4) |
| Capstone integration | 10 | **Done** | `capstone_product_brief.md` |
| Deploy & platform UX | 11 | **Improved** | Executable deploy prove (2026-09) |
| Lineage & hardening | 12 | **Partial** | Strengthen retrieval-injection adversarial tests |
| Frontier / serving / cache | 13 | **Partial** | Optional vLLM/serving benchmark slot |
| Public narrative | 14 | **Done** | — |
| Interviews & design | 15 | **Done** | — |
| **Multi-tenancy & identity** | 9, 11 (light) | **Missing** | Platform extension prove |
| **Secrets & rotation** | 1, 9 (local .env) | **Missing** | Platform extension prove |
| **SRE / SLOs / chaos** | 10–12 (health only) | **Missing** | Platform extension prove |
| **IaC / GitOps** | 11 (Helm/Argo links) | **Partial** | Platform extension prove |
| **Supply-chain / SBOM** | — | **Missing** | Platform extension or Course 8 add-on |
| **Config replay from trace ID** | 8–9 | **Partial** | Document in lineage prove |
| **RAG ops (ACL, reindex)** | 4–6 | **Partial** | Handbook + future prove rows |
| **MCP adversarial security** | 3, 9 | **Missing** | Dedicated lab scenario |
| **FinOps / tenant budgets** | 1 (cost logs) | **Partial** | Platform extension prove |
| **Second app self-service** | 11 (`adding-a-tool`) | **Partial** | Platform extension “second app” prove |
| **Model serving deep dive** | 13 elective | **Missing** | Serving benchmark module |
| **Continuous eval every course** | 0 boot only early | **Partial** | Primer + enrichment habit text |
| **Capability-not-framework lessons** | All | **Partial** | Master Plan capability table in studio |
| **Pacing / hours reconciliation** | Track overview | **Partial** | Core vs platform table in brief |
| **Canonical syllabus / coverage report** | DOCUMENTATION_MAP | **Partial** | Optional `scripts/coverage_report.py` |

## Course 11 prove upgrade (Astra)

| Before | After |
|--------|--------|
| Screenshot + adding-a-tool doc | One-command deploy, health + smoke eval + policy tests, rollback, peer onboarding doc |

See learning track Course 11 and `prove_packs["11"]` in `curriculum_enrichment.json`.

## North-star reorder (v2 — not scheduled)

Astra’s alternate 0–15 ordering (eval in 2, IaC in 11, serving in 12, self-service in 13) is documented in the Astra review only. Migrating lesson `order` values requires a dedicated project; use **platform extension proves** until then.
