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

### Sign in with Google + cloud sync

Sign-in uses a **Google OAuth Web Client ID** (`*.apps.googleusercontent.com`). That is **not** the Gemini API key from AI Studio — you can log in without any AI API key.

1. In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), create **OAuth 2.0 Client ID → Web application**.
2. Add **Authorized JavaScript origins** for each URL you use (exact origin only, e.g. `http://localhost:5173`, `https://<user>.github.io`).
3. Configure the client ID in **one** of these ways:
   - GitHub Actions secret `VITE_GOOGLE_CLIENT_ID` (baked into the Pages build), or
   - Copy `public/studio-config.json.example` → `public/studio-config.json` and commit the client ID (public identifier, not a secret), or
   - Paste in **Settings → Apply client ID** (stored in your browser only).
4. Optional: deploy `sync-worker/` and set `VITE_STUDIO_SYNC_URL` so progress syncs across devices after sign-in.

The **home page** has a **Sign in with Google** card; failed sign-in shows a short error hint (usually wrong client ID or missing authorized origin).

## Architecture (capstone spine)

```
Logs / docs → LiteLLM gateway → Instructor/Pydantic extraction
  → LangGraph + HITL → MCP tools + OPA → RAG + eval CI → deploy + lineage
```

## License

Curriculum and app code as defined in this repository; external links are third-party resources.
