# Program brief — content & rendering review

**Source:** `docs/AI_Platform_System_Engineer_Program_Brief.md`  
**Studio:** `program_brief_home_markdown` (home `<details>`) · `program_brief_markdown` (full, in `lessons.json` for future use)  
**Pipeline:** `scripts/curriculum_enrichment.py` → `npm run curriculum`

## Content (substance)

**Strengths**

- Clear audience (data/platform engineers) and anti-patterns table (“what you are not signing up for”).
- Reference architecture table maps LLM platform layers to DE analogies—on-brand for the studio.
- §9 artifact ladder aligns with home “What you build” cards and prove dashboard.
- §12 success criteria is the right “staff engineer” checklist; §13–14 boundaries and glossary belong on home.

**Issues found (and fixes applied 2026-09-16)**

| Issue | Fix |
| --- | --- |
| Home excerpt stopped at **§10**, dropping **§11–14** (reading order, success criteria, security, glossary) | Home now omits **only §10 encyclopedia**; keeps §11–14 |
| Long **Contents** TOC pointed at §10 anchors missing on home | Contents block stripped from home excerpt |
| `OPTIONAL_MODEL_DEPTH.md` rendered awkwardly after `.md` link stripping | Replaced with “optional model depth supplement” in `prepare_program_brief_for_studio` |
| **§10 encyclopedia** duplicated sidebar course maps | Still omitted on home; footer points to course overviews |

**Remaining intentional overlap**

- Home **value props** / **artifact ladder** / walkthrough copy echo brief §1, §6, §9—shorter scannable layers; brief is the deep read.
- **Prerequisites** appear early (table under Contents) and again in §3—acceptable; home no longer shows Contents.

**Not in studio UI**

- Full `program_brief_markdown` (includes §10) is generated but not shown in a dedicated “full brief” view—only home excerpt. OK unless you add a “Full encyclopedia” modal later.

## Rendering (UI)

**Strengths**

- Collapsible `<details>` keeps the landing page scannable; hero CTA `#program-brief` works.
- `prose-home-brief` tames heading size and table density inside the card.

**Issues found (and fixes applied)**

| Issue | Fix |
| --- | --- |
| **`home-brief` variant did not use Mermaid handler** — 3 diagrams showed as code fences | `MarkdownProse` treats `home-brief` like theory/primer for `code`/`pre` |
| Brief was **below sign-in**, easy to miss after “Read program brief” | Moved **above** course map (after Next action) |
| Double border (details + inner body) | Body scrolls inside open details (`max-height: 72vh`); removed nested card border |

**Still manual checks**

- Open home → expand Program brief → confirm mindmap + architecture mermaid render.
- Anchor links inside brief (e.g. `#9-what-you-build`) depend on GitHub-style heading slugs; spot-check if any jump fails in ReactMarkdown.

## Regeneration

```bash
npm run curriculum
npm run validate:app
```

`validate_app.mjs` requires `program_brief_home_markdown` length ≥ 4000 characters after generation.
