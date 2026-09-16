# Lesson JSON schema (React studio contract)

CI enforces a subset via `scripts/validate_app.mjs`. Bump this doc when you add required fields.

## Top-level payload (`data/lessons.json`)

| Field | Required | Purpose |
| --- | --- | --- |
| `lessons` | yes | Array of 141 topic objects |
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
| `order` | number | Unique 1–141 |
| `course` | number | 0–15 |
| `lesson` | string | Display title |
| `type` | string | Video, Read, Build, Prove, Capstone, Frontier, Do |
| `theory_levels.beginner` | string | Markdown |
| `theory_levels.intermediate` | string | Markdown |
| `theory_levels.advanced` | string | Markdown |

## Lesson object (common optional)

`url`, `course_title`, `section`, `required`, `is_start_here`, `prove_criteria`, `lab_plan`, `theory_summary`, `resources`, `youtube_id`, `embed_url`, `duration`, `related_topics`

## `courses_ref[course]` (required per course)

| Field | Required |
| --- | --- |
| `prove_pack.acceptance[]` | yes (≥1 row) |
| `real_world.summary` | yes |
| `real_world.practice_ladder[]` | yes |
| `walkthrough.plain_title` | yes |
| `entry_lesson_order` | yes |

## Regenerate after schema changes

```bash
npm run curriculum
npm run validate:ci
```
