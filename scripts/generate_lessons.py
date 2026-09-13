#!/usr/bin/env python3
"""Parse AI_System_Engineer_Learning_Track_2027.md → JSON + React lessonsData for the local studio."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

from theory_builder import build_theory_summary, section_label

_SCRIPTS_DIR = Path(__file__).resolve().parent
REPO_ROOT = _SCRIPTS_DIR.parent
import sys

if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))
TRACK = REPO_ROOT / "docs" / "AI_System_Engineer_Learning_Track_2027.md"
OUT_DIR = REPO_ROOT / "data"
PUBLIC_DATA_DIR = REPO_ROOT / "public" / "data"
LESSONS_JS_PATH = REPO_ROOT / "src" / "data" / "lessonsData.js"

URL_FIXES: dict[str, str] = {
    "https://docs.vllm.ai/en/latest/features/prefix_caching.html": "https://docs.vllm.ai/en/latest/design/automatic_prefix_caching/",
    "https://python.useinstructor.com/concepts/retries/": "https://python.useinstructor.com/",
    "https://spec.modelcontextprotocol.io/": "https://modelcontextprotocol.io/specification/2025-11-25",
    "https://cohere.com/llmu/hybrid-search": "https://www.pinecone.io/learn/hybrid-search-intro/",
    "https://github.com/hands-on-llm/hands-on-large-language-models": "https://github.com/HandsOnLLM/Hands-On-Large-Language-Models",
    "https://www.kaggle.com/whitepaper-agents": "https://ai.google.dev/gemini-api/docs/agents",
    "https://temporal.io/blog/reliable-ai-agents-with-temporal": "https://docs.temporal.io/ai",
    "https://github.com/meta-llama/llama-guard": "https://github.com/meta-llama/PurpleLlama",
    "https://www.confident-ai.com/blog/how-to-set-up-llm-ci-cd-pipelines-with-deepeval": "https://docs.confident-ai.com/docs/evaluation-end-to-end-ci-cd",
    "https://staffeng.com/guides/system-design-interview/": "https://staffeng.com/guides/",
    "https://aws.amazon.com/blogs/big-data/governing-generative-ai-data-with-amazon-datazone-and-aws-lake-formation/": "https://aws.amazon.com/blogs/big-data/category/analytics/amazon-datazone/",
}

ENRICH_FIELDS = (
    "course_concepts",
    "course_prompts",
    "youtube_id",
    "resources",
    "digest",
    "content",
    "videoId",
    "prove_criteria",
)

COURSE_RE = re.compile(r"^## Course (\d+) — (.+)$")
MONTH_BY_COURSE = {
    "0": "Pre Oct 2026",
    "1": "M1 Oct 2026",
    "2": "M2 Nov 2026",
    "3": "M3 Dec 2026",
    "4": "M4 Jan 2027",
    "5": "M5 Feb 2027",
    "6": "M6 Mar 2027",
    "7": "M7 Apr 2027",
    "8": "M8 May 2027",
    "9": "M9 Jun 2027",
    "10": "M10 Jul 2027",
    "11": "M11 Aug 2027",
    "12": "M12 Sep 2027",
    "13": "M13 Oct 2027",
    "14": "M14 Nov 2027",
    "15": "M15 Dec 2027",
}

SECTION_TO_TYPE = {
    "watch": "Video",
    "read": "Read",
    "build": "Build",
    "prove": "Prove",
    "do": "Do",
    "video": "Video",
    "pick one or two tracks": "Frontier",
    "capstone checklist": "Capstone",
    "practical gate": "Capstone",
    "syllabus": "Syllabus",
}

CHECKBOX_LINK = re.compile(
    r"^- \[ \] (\(optional\) )?\[([^\]]+)\]\(([^)]+)\)(.*)$"
)
CHECKBOX_PLAIN = re.compile(r"^- \[ \] (\(optional\) )?(.*)$")
TIME_RE = re.compile(r"·\s*(.+)$")


def youtube_embed(url: str) -> str | None:
    m = re.search(r"(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})", url)
    if m:
        return f"https://www.youtube.com/embed/{m.group(1)}"
    return None


def youtube_id_only(url: str) -> str:
    m = re.search(r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})", url or "")
    return m.group(1) if m else ""


def parse_existing_lessons_json(path: Path) -> dict[int, dict]:
    """Load prior enriched lesson rows keyed by order (for merge on regenerate)."""
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        lessons = data.get("lessons", [])
        return {int(row["order"]): row for row in lessons if "order" in row}
    except (json.JSONDecodeError, KeyError, TypeError):
        return {}


def parse_existing_lessons_js(path: Path) -> dict[int, dict]:
    """Legacy: load enrichment from old bundled lessonsData.js if present."""
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")
    marker = "export const LESSONS_DATA = "
    idx = text.find(marker)
    if idx < 0:
        return {}
    start = text.find("[", idx)
    if start < 0:
        return {}
    depth = 0
    end = start
    for i in range(start, len(text)):
        ch = text[i]
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    try:
        lessons = json.loads(text[start:end])
    except json.JSONDecodeError:
        return {}
    return {int(row["order"]): row for row in lessons if "order" in row}


def fix_url(url: str) -> str:
    return URL_FIXES.get(url.strip(), url.strip()) if url else url


def apply_url_fixes(lessons: list[dict]) -> list[dict]:
    for row in lessons:
        if row.get("url"):
            row["url"] = fix_url(row["url"])
        if row.get("embed_url") and "youtube" not in row["embed_url"]:
            pass
        for res in row.get("resources") or []:
            if res.get("url"):
                res["url"] = fix_url(res["url"])
    return lessons


def merge_enrichment(base_lessons: list[dict], by_order: dict[int, dict]) -> list[dict]:
    for row in base_lessons:
        old = by_order.get(row["order"], {})
        old_url = (old.get("url") or "").strip()
        new_url = (row.get("url") or "").strip()
        syllabus_changed = old_url != new_url or (old.get("lesson") or "") != (row.get("lesson") or "")
        for key in ENRICH_FIELDS:
            if key == "resources" and syllabus_changed:
                continue
            if key in old and old[key]:
                row[key] = old[key]
        if not row.get("youtube_id"):
            yid = youtube_id_only(row.get("url", ""))
            if yid:
                row["youtube_id"] = yid
    return base_lessons


def build_courses_ref(lessons: list[dict]) -> dict:
    ref: dict[str, dict] = {}
    for les in lessons:
        key = str(les["course"])
        concepts = list(les.get("course_concepts") or [])
        prompts = [p for p in (les.get("course_prompts") or []) if p and str(p).strip()]
        if key not in ref:
            ref[key] = {
                "name": les.get("course_title", f"Course {les['course']}"),
                "concepts": concepts[:10],
                "prompts": prompts[:6],
            }
            continue
        if concepts and not ref[key]["concepts"]:
            ref[key]["concepts"] = concepts[:10]
            ref[key]["prompts"] = prompts[:6]
            ref[key]["name"] = les.get("course_title", ref[key]["name"])
    return ref


def write_curriculum_payload(lessons: list[dict], track_rel: str) -> dict:
    return {
        "generated_from": track_rel,
        "lessons": lessons,
        "courses_ref": build_courses_ref(lessons),
    }


def open_mode(url: str, lesson_type: str) -> str:
    if embed := youtube_embed(url):
        return "Embed / YouTube"
    if "youtu.be/" in url or "youtube.com/watch" in url or "youtube.com/embed/" in url:
        return "Embed / YouTube"
    if "youtube.com" in url:
        return "YouTube hub"
    if lesson_type == "Video" and not url:
        return "Local"
    if "deeplearning.ai" in url:
        return "DL.AI browser"
    if lesson_type in ("Build", "Prove", "Do", "Capstone") and not url.startswith("http"):
        return "Local"
    return "Browser"


def embed_url(url: str) -> str:
    return youtube_embed(url) or ""


def spine_lessons() -> list[dict]:
    """Free program spine at top of track (parallel with Courses 1–2)."""
    rows = [
        (
            "Karpathy — Deep Dive into LLMs",
            "https://www.youtube.com/watch?v=7xTGNNLPyMI",
            "~3 h",
            1,
        ),
        (
            "AI Agents in LangGraph",
            "https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/",
            "2–3 h",
            2,
        ),
    ]
    out: list[dict] = []
    for i, (title, url, dur, maps_to) in enumerate(rows, start=1):
        optional = False
        out.append(
            {
                "order": i,
                "course": maps_to,
                "course_title": f"Free program spine → Course {maps_to}",
                "month": MONTH_BY_COURSE.get(str(maps_to), ""),
                "section": "video_spine",
                "type": "Video",
                "lesson": title,
                "url": url,
                "duration": dur,
                "required": "No" if optional else "Yes",
                "open_how": open_mode(url, "Video"),
                "embed_url": "",
                "status": "Not started",
            }
        )
    return out


def parse_course_outcomes(text: str) -> dict[str, list[str]]:
    outcomes: dict[str, list[str]] = {}
    current_course: str | None = None
    in_outcomes = False
    for raw in text.splitlines():
        line = raw.strip()
        m_course = COURSE_RE.match(line)
        if m_course:
            current_course = m_course.group(1)
            in_outcomes = False
            continue
        if line == "### What you'll learn":
            in_outcomes = True
            if current_course:
                outcomes.setdefault(current_course, [])
            continue
        if in_outcomes and line.startswith("###"):
            in_outcomes = False
            continue
        if in_outcomes and current_course and line.startswith("- "):
            outcomes[current_course].append(line[2:].strip())
    return outcomes


def annotate_shared_urls(lessons: list[dict]) -> None:
    by_url: dict[str, list[int]] = defaultdict(list)
    for row in lessons:
        url = (row.get("url") or "").strip()
        if url.startswith("http"):
            by_url[url].append(int(row["order"]))
    for row in lessons:
        url = (row.get("url") or "").strip()
        orders = by_url.get(url, [])
        if len(orders) > 1:
            others = [o for o in orders if o != row["order"]]
            titles_hint = f"topics #{', #'.join(str(o) for o in sorted(others)[:4])}"
            row["coverage_note"] = (
                f"This URL is shared across {len(orders)} syllabus items ({titles_hint}). "
                f"For «{row.get('lesson')}», focus only the relevant module or timestamp; "
                f"mark complete when this topic's learning objective is met, not the entire series."
            )


def resource_type_for(lesson_type: str, url: str) -> str:
    if "arxiv.org" in url:
        return "paper"
    if lesson_type == "Video" or "youtube.com" in url or "youtu.be" in url:
        return "video"
    return "guide"


_PRIMARY_RESOURCE_DESC = "Main link for this topic from the learning track."


def ensure_primary_resource(row: dict) -> None:
    """Guarantee at least one resource card (primary syllabus URL) for the studio UI."""
    url = (row.get("url") or "").strip()
    resources = [
        r
        for r in (row.get("resources") or [])
        if "coursera.org" not in (r.get("url") or "")
        and not (
            (r.get("description") or "") == _PRIMARY_RESOURCE_DESC
            and (r.get("url") or "").strip() != url
        )
    ]
    if url.startswith("http") and "coursera.org" not in url:
        if not any((r.get("url") or "").strip() == url for r in resources):
            resources.insert(
                0,
                {
                    "title": row.get("lesson") or "Primary syllabus link",
                    "url": url,
                    "type": resource_type_for(row.get("type", ""), url),
                    "level": "beginner",
                    "description": "Main link for this topic from the learning track.",
                },
            )
    row["resources"] = resources


def finalize_lessons(lessons: list[dict], course_outcomes: dict[str, list[str]]) -> list[dict]:
    annotate_shared_urls(lessons)
    for row in lessons:
        ensure_primary_resource(row)
        row["section_label"] = section_label(row.get("section") or "")
        ckey = str(row.get("course", ""))
        outcomes = course_outcomes.get(ckey, [])
        note = row.get("coverage_note")
        if row.get("content"):
            row["theory_summary"] = row["content"]
        else:
            row["theory_summary"] = build_theory_summary(row, outcomes, note)
    return lessons


def parse_track(text: str) -> list[dict]:
    lessons: list[dict] = []
    course_num = ""
    course_title = ""
    section = ""
    order = len(spine_lessons())

    for raw in text.splitlines():
        line = raw.strip()
        m_course = COURSE_RE.match(line)
        if m_course:
            course_num = m_course.group(1)
            course_title = m_course.group(2).strip()
            section = ""
            continue

        if line.startswith("### Open Video") or "Video (required" in line or "Video / DL.AI" in line:
            section = "video"
            continue
        if line.startswith("**Watch") or line.startswith("**DL.AI"):
            section = "watch"
            continue
        if line.startswith("**Read") or line.startswith("**Watch / read"):
            section = "read"
            continue
        if line.startswith("**Build"):
            section = "build"
            continue
        if line.startswith("**Prove"):
            section = "prove"
            continue
        if line.startswith("**Do"):
            section = "do"
            continue
        if "Capstone checklist" in line:
            section = "capstone checklist"
            continue
        if "Practical gate" in line:
            section = "practical gate"
            continue
        if "Pick one or two" in line:
            section = "pick one or two tracks"
            continue

        if not course_num or not line.startswith("- [ ]"):
            continue

        optional = False
        title = ""
        url = ""
        duration = ""
        prove_criteria = ""

        m_link = CHECKBOX_LINK.match(line)
        if m_link:
            optional = bool(m_link.group(1))
            title = m_link.group(2).strip()
            url = m_link.group(3).strip()
            rest = m_link.group(4) or ""
            tm = TIME_RE.search(rest)
            if tm:
                duration = tm.group(1).strip()
        else:
            m_plain = CHECKBOX_PLAIN.match(line)
            if not m_plain:
                continue
            optional = bool(m_plain.group(1))
            body = m_plain.group(2).strip()
            prove_criteria = ""
            if section.lower() == "prove" and not body.startswith("["):
                prove_criteria = re.sub(r"\*\*([^*]+)\*\*", r"\1", body)
                title = prove_criteria[:80] + ("…" if len(prove_criteria) > 80 else "")
                url = ""
            else:
                link_in_body = re.search(r"\[([^\]]+)\]\(([^)]+)\)", body)
                if link_in_body:
                    title = body.replace(link_in_body.group(0), link_in_body.group(1)).strip(" —·")
                    url = link_in_body.group(2)
                else:
                    title = re.sub(r"\*\*([^*]+)\*\*", r"\1", body)
                    url = ""

        if url and "coursera.org" in url:
            continue

        sec_key = section.lower()
        lesson_type = SECTION_TO_TYPE.get(sec_key, "Read")
        if "optional" in line.lower() and not optional:
            optional = "(optional)" in line

        order += 1
        open_how = open_mode(url, lesson_type) if url else "Checkbox"
        row: dict = {
            "order": order,
            "course": int(course_num),
            "course_title": course_title,
            "month": MONTH_BY_COURSE.get(course_num, ""),
            "section": section or "syllabus",
            "type": lesson_type,
            "lesson": title,
            "url": url,
            "duration": duration,
            "required": "No" if optional else "Yes",
            "open_how": open_how,
            "embed_url": embed_url(url) if url else "",
            "status": "Not started",
        }
        if section.lower() == "prove" and prove_criteria:
            row["prove_criteria"] = prove_criteria
            if not url:
                row["lesson"] = "Prove gate"
        lessons.append(row)

    return lessons




def main() -> None:
    if not TRACK.exists():
        raise SystemExit(f"Missing curriculum source: {TRACK}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    text = TRACK.read_text(encoding="utf-8")
    course_outcomes = parse_course_outcomes(text)
    lessons = spine_lessons()
    parsed = parse_track(text)
    base = len(lessons)
    for row in parsed:
        row["order"] += base
    lessons.extend(parsed)

    json_path = OUT_DIR / "lessons.json"
    existing = parse_existing_lessons_json(json_path)
    if not existing:
        existing = parse_existing_lessons_js(LESSONS_JS_PATH)
    lessons = merge_enrichment(lessons, existing)
    lessons = apply_url_fixes(lessons)
    lessons = finalize_lessons(lessons, course_outcomes)

    track_rel = str(TRACK.relative_to(REPO_ROOT))
    payload = write_curriculum_payload(lessons, track_rel)
    encoded = json.dumps(payload, indent=2, ensure_ascii=False)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    json_path.write_text(encoded, encoding="utf-8")

    PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    (PUBLIC_DATA_DIR / "lessons.json").write_text(encoded, encoding="utf-8")

    if LESSONS_JS_PATH.exists():
        LESSONS_JS_PATH.unlink()

    print(f"Wrote {len(lessons)} lessons → data/lessons.json, public/data/lessons.json")


if __name__ == "__main__":
    main()
