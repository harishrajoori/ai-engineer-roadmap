# AI Systems Engineer Learning Studio

Open, self-paced **15-course** curriculum for production LLM systems: structured extraction, agents, MCP, RAG, evals, policy, deploy, and capstone prove gates. Includes a **React learning studio** (theory-first, beginner/intermediate/advanced levels, progress, optional BYOK AI mentor).

## Quickstart

```bash
npm install
./serve.sh          # http://localhost:8765
# or: npm run dev
```

After editing the track markdown:

```bash
npm run curriculum  # regenerates data/lessons.json + public/data/lessons.json
npm run validate:ci
```

## Docs

| File | Role |
| --- | --- |
| [`docs/AI_System_Engineer_Learning_Track_2027.md`](docs/AI_System_Engineer_Learning_Track_2027.md) | Syllabus source (Courses 0–15) |
| [`docs/AI_System_Engineer_Master_Plan.md`](docs/AI_System_Engineer_Master_Plan.md) | Depth, capstone §13, ethics, §17 module reference |
| [`docs/AI_for_Data_Engineers_Primer.md`](docs/AI_for_Data_Engineers_Primer.md) | Onboarding for data/platform engineers |

## Studio features

- **Theory → Lecture → Lab** flow per topic
- **Beginner / Intermediate / Advanced** explanations (curriculum-generated)
- Course overview: concept map, glossary, prove acceptance rubric
- Local progress + optional Google sign-in for saved AI regenerations
- No paid MOOC required — free docs and videos linked from the track

## Deploy (static)

```bash
npm run build
# Publish dist/ to any static host (GitHub Pages, S3, etc.)
```

Set `VITE_GOOGLE_CLIENT_ID` for Sign in with Google (see `.env.example`).

## Architecture (capstone spine)

```
Logs / docs → LiteLLM gateway → Instructor/Pydantic extraction
  → LangGraph + HITL → MCP tools + OPA → RAG + eval CI → deploy + lineage
```

## License

Curriculum and app code as defined in this repository; external links are third-party resources.
