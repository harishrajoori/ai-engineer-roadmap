# One-place learning setup (Notion + local hub)

This folder is the **runtime** for your certificate: **automate with `sync_notion.py`** or import CSVs manually, use **`index.html`** for YouTube-in-one-window, access all free video masterclasses in one window.

## Files

| File | Purpose |
| --- | --- |
| `notion_lessons.csv` | **145+ lessons** — import as Notion database |
| `notion_course_progress.csv` | **16 courses** — progress / Prove URL board |
| `index.html` | Local “course app” with YouTube embeds + saved checkboxes |
| `lessons.json` | Same data for scripts |
| `generate_lessons.py` | Regenerate after editing `AI_System_Engineer_Learning_Track_2027.md` |
| `sync_notion.py` | **API sync** — create DBs + upsert lessons (optional `import-md`) |
| `.env.example` | Template for `NOTION_TOKEN` + parent page ID |

## A0. Automation — Notion API (recommended if you hate CSV import)

Notion does **not** watch your repo. You run two commands when the curriculum changes.

### One-time Notion setup (≈10 min)

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) → **New integration** → name e.g. `AI Learning 2027` → copy **Internal integration secret**.
2. In Notion, create a page **AI Systems Engineer 2027** (empty).
3. Click **⋯** on that page → **Connections** → add your integration (so it can edit the page).
4. Copy the page ID from the URL:  
   `https://www.notion.so/Your-Workspace/THIS_PART?v=...`  
   The ID is the 32-character hex string (with or without dashes).
5. In terminal:

```bash
cd carl-data-engineering/_local/ai-learning-hub
cp .env.example .env   # edit NOTION_TOKEN and NOTION_PARENT_PAGE_ID
export $(grep -v '^#' .env | xargs)   # or paste exports manually

python3 generate_lessons.py
python3 sync_notion.py setup --parent-page-id "$NOTION_PARENT_PAGE_ID"
python3 sync_notion.py sync
python3 sync_notion.py import-md   # optional: markdown as child pages (plain text blocks)
```

6. Open your Notion page — you should see **Lessons** and **Course progress** databases.

**What sync does**

| Command | Effect |
| --- | --- |
| `setup` | Creates two databases under your parent page; saves IDs in `.notion_ids.json` |
| `sync` | Upserts all rows from `lessons.json` + `notion_course_progress.csv` by `order` / `course_num` |
| `import-md` | Creates child pages with markdown content (not full Notion markdown — long text split into paragraphs) |

**What sync preserves**

- On **existing** lesson rows: updates links and metadata; does **not** overwrite your `status` in Notion.
- On **existing** course progress: does **not** overwrite `status` or `prove_url`.

**When you edit the track**

```bash
python3 generate_lessons.py && python3 sync_notion.py sync
```

**Limits (no automation can fix)**

- Video Masterclass videos still open in Video Masterclass (add embed blocks manually for YouTube only).
- Notion API cannot auto-embed YouTube inside every row — open a lesson page and paste `url` for a player.
- Markdown import is simplified (not a perfect `.md` → Notion conversion); for pretty docs, still use Notion **Import → Markdown** once.

## A. Notion — lesson database (manual CSV — if you skip API)

1. In Notion: **New page** → name it **AI Systems Engineer 2027**.
2. Type `/import` → **CSV** → choose `notion_lessons.csv`.
3. Notion creates a table. **Rename** the database to **Lessons**.
4. Recommended property tweaks (after import):

   | CSV column | Notion type | Tip |
   | --- | --- | --- |
   | `lesson` | Title | Already title |
   | `course` | Number | Group boards by this |
   | `type` | Select | Video, Video Masterclass, Read, Build, Prove, … |
   | `url` | URL | Click to open |
   | `embed_url` | URL | Paste into page body to embed YouTube |
   | `open_how` | Select | Embed · Video Masterclass app · Browser · … |
   | `required` | Select | Yes / No |
   | `status` | Select | Not started · In progress · Done |
   | `prove_url` | URL | For Prove-type rows only |

5. **Views** (duplicate the database view):

   - **Syllabus** — Board or Table, group by `course`, sort by `order`
   - **Videos** — Filter `type` = Video; gallery or list
   - **This month** — Filter `month` = e.g. `M1 Oct 2026`
   - **Required** — Filter `required` = Yes

6. **Embed YouTube inside a lesson page**

   - Open a lesson row as a page.
   - If `embed_url` is filled, type `/embed` and paste the **YouTube watch URL** (or paste `embed_url` — Notion accepts both for YouTube).
   - Video Masterclass rows: add a **button** or callout “Open in Video Masterclass” linking to `url` (cannot embed).

7. Import **`notion_course_progress.csv`** as a second database **Course progress**. Link to Lessons optionally via relation (manual) or keep side-by-side.

8. Import markdown siblings from `_local/`:

   - `AI_System_Engineer_Learning_Track_2027.md` (overview — optional if DB is primary)
   - `AI_System_Engineer_plan_2027.md`
   - `AI_System_Engineer_Learning_Track_2027_REFERENCE.md`

9. Pin **Lessons** + **Course progress** to Notion mobile home.

## B. Local Learning Hub (videos in one window)

```bash
cd carl-data-engineering/_local/ai-learning-hub
chmod +x serve.sh
./serve.sh
```

Open **http://127.0.0.1:8765** → `index.html`.

- Left: course picker  
- Center: **YouTube player** when the lesson has an embed  
- Right: open link, mark done (stored in **browser localStorage**)  
- Video Masterclass / docs: **Open link** (external)

You can also open `index.html` directly from Finder; `file://` works for the UI, but use `serve.sh` if anything blocks local scripts.

## C. Video Masterclass (unavoidable second app)

Only **two spine courses** must live in Video Masterclass:

- Generative AI with LLMs  
- AI Agents in LangGraph  

Use the **Video Masterclass iOS/Android app** for offline-ish viewing. Notion lesson rows with `open_how` = **Video Masterclass app** are your deep links.

## D. Long reads (optional third app)

For Applied LLMs, Anthropic, Hamel: **Readwise Reader** or Notion Web Clipper. Keep the Notion lesson row as the index; read in Reader, check off in Notion.

## E. Regenerate after curriculum edits

```bash
python3 _local/ai-learning-hub/generate_lessons.py
```

Re-import CSV into Notion (merge) or update rows manually.

## What is not possible

- Video Masterclass video inside Notion (DRM).  
- Scraping full doc sites into Notion.  
- One commercial app that replaces Video Masterclass + YouTube + GitHub — this stack is the practical maximum.
