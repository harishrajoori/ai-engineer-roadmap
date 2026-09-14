# Documentation & curriculum data map

How narrative, syllabus, and studio JSON fit together. **Audience lens:** experienced data / platform engineers learning **AI platform engineering** end to end (foundations → advanced capstone).

| Artifact | Role | Consumed by |
| --- | --- | --- |
| [`AI_Platform_System_Engineer_Program_Brief.md`](./AI_Platform_System_Engineer_Program_Brief.md) | **Canonical story** — what the program is, architecture, phases, course intent, prerequisites, pacing | Human readers; bundled as `program_brief_markdown` in `data/lessons.json` → **home page** |
| [`AI_for_Data_Engineers_Primer.md`](./AI_for_Data_Engineers_Primer.md) | **Short in-app companion** — studio panels, rules, first hour; points to the brief | `program_primer_markdown` → Course 0 overview panel |
| [`AI_System_Engineer_Learning_Track_2027.md`](./AI_System_Engineer_Learning_Track_2027.md) | **Syllabus source** — every checkbox, link, prove line | `scripts/generate_lessons.py` → `lessons[]` |
| [`AI_System_Engineer_Master_Plan.md`](./AI_System_Engineer_Master_Plan.md) | Strategy, module depth (§17+), appendices | Humans; not auto-bundled to JSON |
| [`OPTIONAL_MODEL_DEPTH.md`](./OPTIONAL_MODEL_DEPTH.md) | Optional transformer / training depth index | Humans; linked from Course 1 overview & primer |
| `docs/topic_theory/*.studio.md` | Authored **pre-lecture** theory (Foundations / Visual guide) | `npm run curriculum` → `theory_levels` on matching `lesson.order` |
| [`scripts/walkthrough_content.py`](../scripts/walkthrough_content.py) | Home hero copy, phases, per-course walkthrough objects | `program_walkthrough`, `courses_ref[].walkthrough` |
| [`data/curriculum_enrichment.json`](../data/curriculum_enrichment.json) | Glossary, concept maps, prove packs, real-world ladders | Merged into `courses_ref` and `glossary` in JSON |
| `data/lessons.json` + `public/data/lessons.json` | **Runtime bundle** for the studio | `curriculumLoader.js` |
| [`data/lab_scenarios.json`](../data/lab_scenarios.json) | **DE lab narratives + code blocks** for Lab & Prove | `scripts/lab_scenarios.py` → `lab_plan.de_lab` |

## Regenerate after edits

```bash
# Brief, primer, track, enrichment, or walkthrough_content.py changed:
npm run curriculum
npm run validate:ci
```

## Content order for learners (5+ YOE data engineer)

1. **Home** — full program brief (markdown) + walkthrough phases + course map  
2. **Course 0 overview** — primer + walkthrough + concept map  
3. **Course 0 START HERE** — schemas, extraction, golden set (LLM intro videos are topics, not the program headline)  
4. **Course 1** — **Theory before Lecture** on each Watch row; Karpathy deep dive + optional [`OPTIONAL_MODEL_DEPTH.md`](./OPTIONAL_MODEL_DEPTH.md)  
5. **Courses 2–3** — orchestration, tools (same Theory → Lecture habit)  
6. **Courses 4–6** — retrieval & documents (RAG as measured pipelines)  
7. **Courses 7–9** — evals, CI, policy, traces  
8. **Courses 10–12** — integrate, deploy, lineage (`v1.0`)  
9. **Courses 13–15** — frontier electives, public narrative, optional career module  

## Theory depth in the studio

| Level | When |
| --- | --- |
| **Foundations** | **First** on every new topic (Theory tab) |
| **Lecture / Reading** | After Foundations ready checklist |
| **Study guide / Visual guide** | When Foundations feels easy |
| **Platform depth** | Advanced tradeoffs, failure modes, ops |
