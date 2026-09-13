# Documentation (two files — by design)

| File | Purpose |
| --- | --- |
| [`AI_System_Engineer_Learning_Track_2027.md`](./AI_System_Engineer_Learning_Track_2027.md) | **Curriculum source** — checkbox lessons for Courses 0–15. Edited here, then `npm run curriculum` updates the React app. |
| [`AI_System_Engineer_Master_Plan.md`](./AI_System_Engineer_Master_Plan.md) | **Strategy & depth** — market, phases, capstone, ethics, resume (§1–16), plus per-course reference & appendices (§17+). |

**Why not one file?** The generator only parses structured `## Course N` checklists. Mixing ~1,000 lines of strategy and appendices into the same file would still require two mental modes—and would bloat every `npm run curriculum` diff. Two files keeps **daily edits** small (track) while **planning essays** live in one place (master plan).

**Why not three?** The old separate “REFERENCE” doc is merged into the master plan as **§17**.
