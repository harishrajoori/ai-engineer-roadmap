# Curriculum QA & plain-English overhaul log

## Pass: plain-English + visuals (all 141 topics)

| Change | Files | Effect |
|--------|-------|--------|
| Long-form beginner narrative | `topic_plain_english.py`, `topic_theory_levels.py` | Every topic: walkthrough, DE jargon table, failure stories in simple English |
| Intermediate study guide depth | `theory_builder.py`, `handbook_auto_enrich.py` | Plain-English implementation path; handbook rows padded to ≥720 chars when thin |
| Second Mermaid (sequence) | `topic_diagrams.py` | Default sequence diagram per topic (gateway, eval, read path, or generic platform flow) |
| Advanced depth balance | `theory_enrichment.py` | Advanced tab extended when shorter than beginner after visual/lab append |
| Validation | `validate_curriculum.py` | Handbook length checks use merged `data/topic_handbook.json` (post-enrich) |
| Links | `docs/AI_System_Engineer_Master_Plan.md` | Pydantic deep link |

## Prior passes (reference)

- **590743d** — Homepage hero CSS scoped to `site-header`
- **b5f06de** — Curriculum QA gate, lab specs, terse enrich (superseded by plain-English enrich)
- **86d643a** — Topic-scoped implementation deep links (44 gaps)

## Verification commands

```bash
npm run curriculum
python3 scripts/curriculum_qa.py
npm run validate:ci
npm run build
```

## Topic-by-topic rewrites

Handbook source rows remain in `scripts/handbook_batches/batch_*.py` (orders 1–141). Runtime theory is **generated** from handbook + hints + `topic_plain_english` + diagrams + labs—regenerate after batch edits with `npm run curriculum`.
