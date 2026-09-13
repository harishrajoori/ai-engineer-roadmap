#!/usr/bin/env python3
"""Parse AI_System_Engineer_Learning_Track_2027.md → JSON + React lessonsData for the local studio."""

from __future__ import annotations

import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TRACK = REPO_ROOT / "docs" / "AI_System_Engineer_Learning_Track_2027.md"
OUT_DIR = REPO_ROOT / "data"
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


def parse_existing_lessons_js(path: Path) -> dict[int, dict]:
    """Load prior enriched lesson rows keyed by order (for merge on regenerate)."""
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
        for key in ENRICH_FIELDS:
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


def write_lessons_js(lessons: list[dict], path: Path) -> None:
    courses_ref = build_courses_ref(lessons)
    body = (
        f"// Auto-generated — run `npm run curriculum` after editing docs/AI_System_Engineer_Learning_Track_2027.md\n"
        f"export const LESSONS_DATA = {json.dumps(lessons, indent=2, ensure_ascii=False)};\n\n"
        f"export const COURSES_REF_DATA = {json.dumps(courses_ref, indent=2, ensure_ascii=False)};\n"
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body, encoding="utf-8")


def open_mode(url: str, lesson_type: str) -> str:
    if lesson_type == "Video" or "youtube.com" in url:
        return "Embed / YouTube"
    if embed := youtube_embed(url):
        return "Embed"
    if "youtube.com" in url or "youtu.be" in url:
        return "YouTube"
    if "deeplearning.ai" in url:
        return "DL.AI browser"
    if lesson_type in ("Build", "Prove", "Do", "Capstone") and not url.startswith("http"):
        return "Local"
    return "Browser"


def embed_url(url: str) -> str:
    return youtube_embed(url) or ""


def spine_lessons() -> list[dict]:
    """Open Video Masterclass block at top of track (not under a Course heading)."""
    rows = [
        (
            "Generative AI with Large Language Models",
            "https://www.youtube.com/learn/generative-ai-with-llms",
            "~16 h",
            1,
        ),
        (
            "AI Agents in LangGraph",
            "https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/",
            "2–3 h",
            2,
        ),
        (
            "Generative AI Engineering with LLMs specialization (cherry-pick)",
            "https://www.youtube.com/specializations/generative-ai-engineering-with-llms",
            "optional",
            2,
        ),
    ]
    out: list[dict] = []
    for i, (title, url, dur, maps_to) in enumerate(rows, start=1):
        optional = "cherry-pick" in title
        out.append(
            {
                "order": i,
                "course": maps_to,
                "course_title": f"Open Video Spine → Course {maps_to}",
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
        if line.startswith("**Watch"):
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
            # Frontier row: **vLLM** — [docs](url)
            link_in_body = re.search(r"\[([^\]]+)\]\(([^)]+)\)", body)
            if link_in_body:
                title = body.replace(link_in_body.group(0), link_in_body.group(1)).strip(" —·")
                url = link_in_body.group(2)
            else:
                title = re.sub(r"\*\*([^*]+)\*\*", r"\1", body)
                url = ""

        sec_key = section.lower()
        lesson_type = SECTION_TO_TYPE.get(sec_key, "Read")
        if "optional" in line.lower() and not optional:
            optional = "(optional)" in line

        order += 1
        open_how = open_mode(url, lesson_type) if url else "Checkbox"
        lessons.append(
            {
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
        )

    return lessons




def main() -> None:
    if not TRACK.exists():
        raise SystemExit(f"Missing curriculum source: {TRACK}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    text = TRACK.read_text(encoding="utf-8")
    lessons = spine_lessons()
    parsed = parse_track(text)
    base = len(lessons)
    for row in parsed:
        row["order"] += base
    lessons.extend(parsed)

    existing = parse_existing_lessons_js(LESSONS_JS_PATH)
    lessons = merge_enrichment(lessons, existing)
    lessons = apply_url_fixes(lessons)

    (OUT_DIR / "lessons.json").write_text(
        json.dumps({"generated_from": str(TRACK.relative_to(REPO_ROOT)), "lessons": lessons}, indent=2),
        encoding="utf-8",
    )
    write_lessons_js(lessons, LESSONS_JS_PATH)
    print(f"Wrote {len(lessons)} lessons → data/lessons.json, src/data/lessonsData.js")


if __name__ == "__main__":
    main()
