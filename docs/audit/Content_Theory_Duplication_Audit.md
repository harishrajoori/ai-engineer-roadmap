# Content, theory, and studio page duplication audit

**Date:** September 2026  
**Scope:** Generated `lessons.json` theory, handbook alignment, Lab & Prove tab overlap, and UX clumsiness.  
**Related:** [Astra curriculum review](./AI_System_Engineer_Astra_Curriculum_Review.md), [Grok studio audit](./AI_Systems_Engineer_Studio_Full_Audit_Review.md).

---

## Executive summary

Learners see **the same material several times** on one topic: Theory (three depth pills) repeats structure, **Lab & Practice** appeared inside every theory depth **and** on the Lab tab, and **handbook rows keyed by lesson `order`** often describe the **wrong syllabus row** after track edits (~30 topics showed wrong “In one sentence” text). **Advanced** depth repeated identical cost/safety/ops boilerplate on all 142 lessons.

**Fixes shipped in this pass (generator + QA):**

| Issue | Fix |
|-------|-----|
| Lab duplicated in Theory + Lab tab | `theory_enrichment.py` — lab blocks removed from theory; lab only via `lab_plan` |
| Architecture pasted into all depths | Diagrams appended to **intermediate** only |
| Handbook/order drift | `handbook_matches_lesson()` — skip handbook overlay when one_liner does not match title |
| Generic advanced paragraph | Shortened `advanced_plain_english_block()` when no `advanced_extra` |
| Regression | `curriculum_qa.py` — fail if theory contains `## Lab & Practice` or obvious one_liner drift |

**Still open (content debt):**

- Migrate handbook **authoring** off order-only batches (stable-key file `data/topic_handbook_by_key.json` is generated on `npm run curriculum`)
- 123 handbook rows still **&lt;720 chars** (shallow intermediate/advanced padding)
- **13** `.studio.md` guides vs 142 topics — generated five-layer cards dominate
- `theory_summary` **equals** intermediate by design (study guide default); beginner/advanced are the real depth split
- Course overview / home brief overlap (intentional; reduce in UI later)

---

## How content is produced

```text
AI_System_Engineer_Learning_Track_2027.md
    → generate_lessons.py (checkbox rows → lessons)
    → topic_hints (URL/type) + topic_handbook.json (by order) → get_topic_hint()
    → theory_builder / topic_theory_levels → theory_levels + theory_summary
    → theory_enrichment (diagrams; was lab+diagrams on all levels)
    → lab_implementation → lab_plan.de_lab + lab_practice (same lab_practice_markdown)
    → React SmartStage: Theory tab (3 pills) | Lecture | Supplements | Lab & Prove
```

---

## Findings (pre-fix)

### 1. Triple Lab & Practice

- `lab_practice_markdown()` was injected into **beginner, intermediate, advanced, and theory_summary** via `enrich_theory_levels`.
- `LabProvePanel` renders the same markdown again under **Lab & Prove**.
- **Impact:** ~4–5k characters of repeated DE scenario per topic when switching pills or tabs.

### 2. Handbook keyed by `order`, not topic

- `data/topic_handbook.json` maps `order` → curated `one_liner`, etc.
- Adding or reordering track checkboxes shifts topics at a given order **without** updating handbook batches.
- **Examples of drift (Sep 2026):** Prove row for `DEPLOY.md` showed OpenLineage one-liner; `v1.0` lineage prove showed vLLM frontier text; hybrid benchmark prove showed Docling.

### 3. “Five layers” template fatigue

- Intermediate/study guide uses the same **At a glance → five layers → mental model → watch for** skeleton for every row.
- Correct for consistency; feels **clumsy** when one_liner is wrong or generic.
- **30** topics lacked a proper “In one sentence” block or had mismatched sentence vs title.

### 4. Advanced boilerplate

- **142/142** advanced sections included the same cost/safety/ops paragraph regardless of topic.

### 5. UI / information architecture

| Tab | Role | Duplication risk |
|-----|------|------------------|
| Theory | Foundations / Study guide / Platform depth | Was + Lab + Architecture on every pill |
| Lecture | Primary URL or embed | OK |
| More resources | Implementation links | Overlaps sidebar catalog somewhat |
| Lab & Prove | DE scenario, prove pack, checklist | Was duplicate of theory lab block |

`stripDuplicateTheoryTitle()` only removes duplicate H1 vs hero title.

### 6. Studio pages (Course overview, Home)

- Program brief bundled into `lessons.json` and shown on home **and** in docs — intentional single narrative.
- Course enrichment panels repeat prove acceptance from `prove_packs` — useful; can feel redundant with Lab prove checklist.

---

## QA gates (after fix)

```bash
npm run curriculum
npm run validate:ci   # includes curriculum_qa.py
```

`curriculum_qa.py` now fails on:

- `## Lab & Practice` inside any `theory_levels` field
- Obvious handbook drift (`prove month N` on non-Prove titles; zero token overlap one_liner vs title)

---

## Recommended follow-ups (priority)

1. **Handbook v2** — Build `topic_handbook.json` from `lesson_stable_key` after each `npm run curriculum`; deprecate order-only batches or auto-remap on regenerate.
2. **Prove rows** — Generate theory from `prove_packs[course]` instead of generic five-layer template for `type: Prove`.
3. **Coverage report** — Script: per lesson, flags theory/lab/handbook/studio guide/impl links (Astra repo hygiene item).
4. **Thin handbook** — Deepen or drop `handbook_auto_enrich` padding; prefer `.studio.md` for high-traffic topics.
5. **UI** — Collapse “Study guide” when `theory_studio_guide` exists; default pill to Visual guide for those 13 orders.

---

## Verification checklist (maintainers)

After track or handbook edits:

1. `npm run curriculum`
2. `npm run validate:ci`
3. Spot-check **Course 11 Prove** and **Course 4 hybrid prove** in studio — Theory one_liner must match lesson title; Lab only on Lab tab.
4. Run drift spot script (optional):

```bash
python3 scripts/curriculum_qa.py
```

---

*Audit for harishrajoori/ai-engineer-roadmap — September 2026.*
