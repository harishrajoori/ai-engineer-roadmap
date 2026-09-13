# AI Systems Engineer Learning Studio

Open, self-paced curriculum and interactive studio for building **production LLM systems**: structured extraction, agents, MCP, RAG, evaluation harnesses, policy, deployment, and a capstone prove path. The syllabus is maintained as markdown in this repo; a build step turns it into structured lesson data for a **React + Vite** learning app.

**Audience:** Engineers comfortable with Python, git, and data/platform work who want a guided path from LLM basics to portfolio-ready platform skills—without requiring paid MOOCs.

**Pace:** About 15 months at 10–15 hours per week (self-paced).

---

## What you get

| Layer | Description |
| --- | --- |
| **Syllabus** | 16 courses (0–15): readings, videos, labs, and **Prove** gates with concrete deliverables |
| **Learning studio** | Browse courses, theory at beginner/intermediate/advanced depth, lecture notes, **Lab & Prove** panels, local progress |
| **Implementation links** | Topic-scoped GitHub repos and paths (validated catalog), not generic hub links on every row |
| **Optional AI mentor** | Bring your own API keys (Gemini, Groq, OpenRouter, etc.) for in-app explanations and regenerations |
| **Optional cloud sync** | Google sign-in + Cloudflare Worker backend to sync progress across devices |

Free external docs and short courses (DeepLearning.AI, Microsoft/Google open curricula, etc.) are linked from the track where they fit a topic.

---

## Quickstart (local studio)

**Requirements:** Node.js 20+, Python 3 (for curriculum scripts), `npm`.

```bash
# GitHub → Code → copy the HTTPS clone URL for this repository
git clone <repository-url>
cd ai-engineer-roadmap
npm install
./serve.sh          # http://localhost:8765
# or: npm run dev    # default Vite port (see vite.config.js)
```

Open the URL in your browser. Progress is stored in **localStorage** unless you sign in and configure cloud sync.

---

## Curriculum source and regeneration

The canonical syllabus lives in markdown:

| Document | Role |
| --- | --- |
| [`docs/AI_System_Engineer_Learning_Track_2027.md`](docs/AI_System_Engineer_Learning_Track_2027.md) | Course-by-course topics, resources, Prove checklist |
| [`docs/AI_System_Engineer_Master_Plan.md`](docs/AI_System_Engineer_Master_Plan.md) | Strategy, capstone (§13), ethics, deep module reference |
| [`docs/AI_for_Data_Engineers_Primer.md`](docs/AI_for_Data_Engineers_Primer.md) | Onboarding for data/platform engineers |

After you edit the track, handbook, enrichment, or implementation catalog:

```bash
npm run curriculum
```

This runs `scripts/merge_topic_handbook.py` and `scripts/generate_lessons.py`, updating:

- `data/lessons.json` — source of truth for the generator output
- `public/data/lessons.json` — copy bundled for the static app

The studio loads lessons at runtime from `public/data/lessons.json`.

---

## Studio features (in the app)

- **Course navigation** — Sidebar by course; concept map, glossary, and prove acceptance rubric on course overview.
- **Theory → Lecture → Lab** — Per-topic flow with markdown rendering (including Mermaid and math where enabled).
- **Depth levels** — Beginner, intermediate, and advanced theory text (generated and handbook-enriched).
- **Lab & Prove** — Step-oriented lab plans (orient → implement → verify → prove), **local setup** hints, and **Code for this topic** implementation resources filtered by topic match score.
- **Prove workflow** — Track prove URLs and status in the app; aligned with the markdown Prove tables in the track.
- **Progress & streaks** — Local completion state; optional sync after Google sign-in.
- **Settings** — API keys for the mentor, layout preferences, Google client ID paste (browser-only) if not baked into the build.

The **Start here** portfolio hub appears only on designated entry topics—not duplicated on every lesson.

---

## Project layout

```
docs/                          Syllabus and master plan (human-edited)
docs/topic_theory/             Per-topic studio theory markdown (inputs to generation)
data/
  lessons.json                 Generated lesson graph
  curriculum_enrichment.json   Extra metadata merged into lessons
  topic_handbook.json          Topic handbook entries
  implementation_repo_catalog.json   Validated GitHub repos for Lab resources
  external_curriculum_links.json   URL → topic mappings for implementation matching
public/data/lessons.json       Copy served to the browser
scripts/
  generate_lessons.py          Main curriculum compiler
  lab_implementation.py        Lab plans, local_setup, implementation_links
  append_implementation_repos.py
  github_repo_validate.py      Catalog validation (GitHub API)
  audit_implementation_resources.py
  validate_curriculum.py       Link and structure checks
src/                           React application (Vite)
sync-worker/                   Optional Cloudflare Worker for cloud sync
.githooks/                     Optional git hooks (see below)
```

---

## npm scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Oxlint on `src/` and `scripts/` |
| `npm run curriculum` | Regenerate lesson JSON from markdown + data files |
| `npm run validate` | App wiring + curriculum validation |
| `npm run validate:ci` | Full CI gate: app, models manifest, prove workflow test, repo catalog, curriculum (no HTTP), public content audit, implementation audit |
| `npm run validate:repos` | Check implementation catalog against GitHub (`GITHUB_TOKEN` optional for rate limits) |
| `npm run audit:implementation` | Drift checks for topic-scoped implementation links |
| `npm run audit:public` | Scan for sensitive patterns in public bundle inputs |

---

## Validation before you push

Maintainers and contributors should run:

```bash
npm run curriculum    # if syllabus or data/ inputs changed
npm run validate:ci
```

GitHub Actions on `main` runs lint, `validate:ci`, curriculum sync, and deploys to **GitHub Pages** (see [`.github/workflows/pages.yml`](.github/workflows/pages.yml)).

Refreshing the implementation catalog against live GitHub repos:

```bash
export GITHUB_TOKEN="$(gh auth token)"   # optional but recommended
python3 scripts/github_repo_validate.py
npm run validate:repos
```

---

## Optional: git hooks (this clone)

To keep commit messages free of unwanted co-author trailers on this machine:

```bash
./scripts/setup_git_hooks.sh
```

This installs `.githooks/prepare-commit-msg` into `.git/hooks/` for **this repository only** (no global git config). Re-run after a fresh clone.

---

## Deploy (static hosting)

```bash
npm run build
```

Publish the contents of `dist/` to any static host (GitHub Pages, S3 + CloudFront, Netlify, etc.). The repo’s Pages workflow builds on every push to `main`.

**Base path:** If you host under a subpath (e.g. `https://user.github.io/ai-engineer-roadmap/`), configure Vite `base` in `vite.config.js` to match.

---

## Sign in with Google + cloud sync

Sign-in uses a **Google OAuth Web Client ID** (`*.apps.googleusercontent.com`). That is **not** a Gemini or other LLM API key—you can sign in without any AI provider key.

1. In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), create **OAuth 2.0 Client ID → Web application**.
2. Add **Authorized JavaScript origins** for each URL you use (exact origin only), for example:
   - `http://localhost:8765`
   - `http://localhost:5173`
   - `https://<your-user>.github.io`
3. Provide the client ID in **one** of these ways:
   - GitHub Actions secret `VITE_GOOGLE_CLIENT_ID` (injected at build time in CI), or
   - Copy [`public/studio-config.json.example`](public/studio-config.json.example) → `public/studio-config.json` (client ID is a public identifier), or
   - **Settings → Apply client ID** in the app (stored in the browser only).
4. Optional: deploy [`sync-worker/`](sync-worker/README.md) and set `VITE_STUDIO_SYNC_URL` when building so progress, notes, keys, and regenerations sync after sign-in.

The home page includes **Sign in with Google**. If sign-in fails, check the client ID and that your current origin is listed in the OAuth client.

See [`.env.example`](.env.example) for optional build-time variables.

---

## Optional AI mentor (BYOK)

The studio can call configured providers using keys you enter in **Settings** (stored locally or via sync). Model IDs and allowlists are defined in `src/config/aiModels.js` and validated with `npm run validate:models`. Keys are never committed to the repository.

---

## Capstone architecture (spine)

The track builds toward a single integrated story:

```
Logs / docs → LiteLLM gateway → Instructor / Pydantic extraction
  → LangGraph + HITL → MCP tools + OPA → RAG + eval CI → deploy + lineage
```

Course Prove gates map to artifacts along this spine (gateway release, agent demo, MCP server, golden eval set, CI gate, traces, deploy proof, `v1.0` tag, etc.). Details and acceptance criteria are in the track and master plan.

---

## Contributing

1. Fork or branch from `main`.
2. Edit syllabus or `data/` inputs, then `npm run curriculum`.
3. Run `npm run validate:ci` and fix any failures.
4. Open a pull request with a clear description of curriculum or app changes.

For implementation repo additions, extend [`data/implementation_repo_catalog.json`](data/implementation_repo_catalog.json), run `github_repo_validate.py`, regenerate lessons, and ensure `audit:implementation` passes.

---

## License

Curriculum text and application code in this repository are provided as defined here; linked external courses, videos, and third-party repositories remain under their respective licenses and terms.
