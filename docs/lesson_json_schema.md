# Lesson JSON schema (React studio contract)

CI enforces a subset via `scripts/validate_app.mjs`. Bump this doc when you add required fields.

## Top-level payload (`data/lessons.json`)

| Field | Required | Purpose |
| --- | --- | --- |
| `lessons` | yes | Array of topic objects (count enforced in CI) |
| `courses_ref` | yes | Per-course overview, prove_pack, walkthrough |
| `program_walkthrough` | yes | Home + onboarding copy |
| `program_brief_markdown` | yes | Collapsible program brief |
| `program_primer_markdown` | yes | Course 0 primer |
| `glossary` | yes | Terms + DE analogies |
| `portfolio_starter` | yes | Starter repo hints |
| `generated_from` | yes | Track file path |

## Lesson object (required)

| Field | Type | Notes |
| --- | --- | --- |
| `order` | number | Unique stable id per topic |
| `course` | number | 0–15 |
| `lesson` | string | Display title |
| `type` | string | Video, Read, Build, Prove, Capstone, Frontier, Do |
| `theory_levels.beginner` | string | Markdown |
| `theory_levels.intermediate` | string | Markdown |
| `theory_levels.advanced` | string | Markdown |

## Lesson object (common optional)

`url`, `course_title`, `section`, `required`, `is_start_here`, `prove_criteria`, `lab_plan`, `theory_summary`, `resources`, `youtube_id`, `embed_url`, `duration`, `related_topics`, `capstone_track` (Course 10 only: `wire` | `caching` | `reference` | `demo` | `defer`)

## `courses_ref[course]` (required per course)

| Field | Required |
| --- | --- |
| `prove_pack.acceptance[]` | yes (≥1 row) |
| `real_world.summary` | yes |
| `real_world.practice_ladder[]` | yes |
| `walkthrough.plain_title` | yes |
| `entry_lesson_order` | yes |

## `courses_ref[10]` (capstone scope)

| Field | Purpose |
| --- | --- |
| `capstone_scope.legend` | Wire / Caching / Reference / Demo / Defer labels + hints |
| `capstone_scope.counts` | Topic count per track |
| `capstone_product_brief_markdown` | OpsLedger AI scope contract |

## Learner backup JSON

See `src/utils/learnerStateSchema.js` for export keys and shape checks used in tests.

## Regenerate after schema changes

```bash
npm run curriculum
npm run validate:ci
```

## Curriculum diff hygiene

- **Do not hand-edit** `data/lessons.json` or `public/data/lessons.json` except via `npm run curriculum` after changing the learning track, enrichment, walkthrough, or lab scenarios.
- Keep PRs focused: one track/enrichment change → one curriculum regen commit avoids noisy unrelated lesson churn.
- **Future:** splitting the runtime bundle per course (`public/data/courses/*.json`) is deferred; the single-file bundle keeps deploy simple until lesson count or diff noise forces a split.

## Learner exports

| Export | Where | Format |
| --- | --- | --- |
| Full backup | Header → Download | JSON (`schema_version` in `learnerStateSchema.js`) |
| Prove worksheet | Lab & Prove tab | Markdown per topic |
| Portfolio summary | Home → Prove dashboard | Markdown all courses + checklists |
