# Curriculum QA polish pass (141 topics)

Automated gate: `python3 scripts/curriculum_qa.py` (also in `npm run validate:ci`).

## Generator / wiring fixes (all topics)

| Area | Change | Why |
|------|--------|-----|
| `handbook_auto_enrich.py` | Strip repeated boilerplate (`Implementation depth`, DE mirror table, rollout checklist); replace with terse scope/execution/invariant blocks | Removed medium-article filler on every topic |
| `topic_lab_practice.py` | Wire `topic_lab_specs.specific_implementation()` + `specific_code_fence()`; retire `sketch.py` default | Hyper-specific labs for prove/build rows and LiteLLM/Instructor keywords |
| `topic_lab_specs.py` | Order-level + keyword implementation paragraphs (gateway Tenacity 429, MCP audit, eval CI, etc.) | Staff-engineer acceptance criteria |
| `topic_diagrams.py` | Course 0/1 + Instructor/Pydantic flows: rate limits, DLQ, fallback, cost attribution | Diagrams show failure paths, not A→B→C |
| `link_quality.py` | Redirect shallow Pydantic root + vLLM repo root to deep anchors | Final URL sweep at merge time |
| `topic_hints.py` | Pydantic hint key → `…/concepts/models/` | Hint lookup matches lesson primary URL |
| `docs/AI_System_Engineer_Learning_Track_2027.md` | Same Pydantic deep link | Track checklist alignment |
| `package.json` | `validate:ci` runs `curriculum_qa.py` | Blocks regressions on tone, mermaid, vague labs, shallow URLs |

## Per-topic content

No hand-edits to individual handbook batch rows in this pass; all 141 lessons were regenerated via `npm run curriculum` so theory, diagrams, and lab markdown pick up the script changes above.

## Verification

- `npm run curriculum` — OK (141 handbook entries, 141 lessons)
- `python3 scripts/curriculum_qa.py` — OK (141 lessons)
- `npm run build` — OK
- `npm run validate:ci` — run at commit time
