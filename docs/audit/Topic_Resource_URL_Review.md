# Topic & resource URL review (142 lessons)

**Date:** 2026-09-16  
**Scope:** Every syllabus topic’s primary URL, generated `resources[]` stack, course-overview titles, and Resources panel behavior (after dedupe).  
**Gate:** `python3 scripts/audit_topic_resources.py` (also in `npm run validate:ci`).

**2026-09-16 follow-up:** `deep_link_primary_url()` (Instructor, LiteLLM, Applied LLMs, Chip Huyen, Hamel index), explicit `external_curriculum_links` key expansion for Applied LLMs TOC fragments, six new `.studio.md` guides (orders 5, 16–18, 31–32), removed no-op `merge_related_into_resources`.

## Executive summary

| Check | Result |
|--------|--------|
| Lessons audited | 142 |
| Duplicate HTTP URLs within one topic’s `resources[]` | **0** (was 1: topic #66 GraphRAG — fixed via `dedupe_resources_by_url`) |
| Stale “Same source — syllabus angle” resource cards | **0** |
| Bare `https://applied-llms.org/` primary (no TOC fragment) | **0** |
| Cross-course `related_topics` siblings | **0** |
| Double `·` in course-overview topic titles | **0** |
| `validate_lesson_links` shallow-primary / paid-required errors | **0** |

**Verdict:** Resource stacks are in good shape for ship. Remaining “same endpoint” cases are **intentional** (one handbook URL with different TOC anchors, or the same implementation repo recommended on many Build/Read topics).

## What we fixed (generator + UI)

1. **Sibling syllabus angles** — No longer cloned as separate resource cards with identical URLs; scoped to **same course** only in `related_topics` / theory.
2. **Applied LLMs** — Primary reads deep-link to `applied-llms.org` TOC fragments by checkbox title (tactical, RAG, agents/flows, eval, testing, pitfalls).
3. **Enrichment merge** — Skips persisting old resource blobs that contained stale “Same source” cards; prunes bare Applied LLMs duplicates after anchor upgrade.
4. **External curriculum** — Microsoft Generative AI for Beginners still attaches when the stable key uses a fragment URL (lookup falls back to base URL).
5. **UI** — `getLessonResources()` dedupes by URL; course overview uses fixed title formatting and chevron (not a misleading external-link icon).
6. **Generation** — `dedupe_resources_by_url()` after implementation-repo append (prevents enrichment drift duplicates).

## Per-course snapshot

| Course | Topics | HTTP primaries | Resource cards (total) | Applied LLMs primary |
|--------|--------|----------------|----------------------|----------------------|
| 0 | 9 | 7 | 26 | 1 |
| 1 | 14 | 12 | 29 | 1 |
| 2 | 11 | 9 | 50 | 1 |
| 3 | 13 | 10 | 39 | 0 |
| 4 | 10 | 6 | 30 | 1 |
| 5 | 6 | 4 | 15 | 0 |
| 6 | 6 | 4 | 16 | 0 |
| 7 | 9 | 7 | 27 | 1 |
| 8 | 5 | 3 | 12 | 1 |
| 9 | 10 | 7 | 30 | 0 |
| 10 | 20 | 6 | 49 | 0 |
| 11–15 | 29 | 19 | 74 | 3 |

**Resource cards per topic:** 1 card (23 topics), 2 (53), 3 (27), 4 (16), 5 (15), 6 (8). No topic exceeds 6 cards in generated JSON; UI dedupe keeps the panel readable.

## Expected “shared URL” patterns (not bugs)

These are **by design** in a capstone studio that reuses reference repos:

| Pattern | Example | Why it’s OK |
|---------|---------|-------------|
| Same impl repo on many topics | `langchain-ai/langgraph`, `patchy631/ai-engineering-hub/*`, `confident-ai/deepeval` | Topic-scoped implementation matching; different titles/desc per lesson |
| Same doc hub, different anchors | `applied-llms.org/#toc-*` | One handbook; syllabus checkbox defines the section |
| Same primary across 2 courses | Instructor getting started, Hamel evals, DL.AI LangGraph short course | Re-read at different months; `coverage_note` explains scope |
| Paid optional hub | CampusX Advanced RAG (courses 4, 6, 7) | Marked optional; `access_note` in lesson metadata |

## Topics to spot-check manually (low risk)

| Order | Topic | Note |
|-------|--------|------|
| 43 | Hub roadmap — MCP section | Primary blob URL vs resource title differ; same GitHub path — OK |
| 131 | Unsloth | Primary repo + resource card share GitHub URL with different labels — UI shows one link |
| Build-heavy months | LangGraph / Hub / DeepEval | Many topics list the same catalog repo; verify **match_score** still feels on-topic when editing syllabus |

## How to re-run

```bash
npm run curriculum
python3 scripts/audit_topic_resources.py
npm run validate:ci
```

For HTTP reachability (slower): `python3 scripts/validate_curriculum.py` (no `--skip-http`).

## Follow-ups (optional, not blocking)

- Add TOC-style deep links for other multi-use handbooks if the syllabus adds more “same site, many angles” rows.
- Expand `external_curriculum_links.json` keys to explicit fragment URLs so mappings do not rely on base-URL fallback.
- More `.studio.md` guides for high-traffic Read rows (theory depth — separate from resource URL audit).
