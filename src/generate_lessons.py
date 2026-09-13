#!/usr/bin/env python3
"""Parse AI_System_Engineer_Learning_Track_2027.md → CSV + JSON for Notion and local hub."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

TRACK = Path(__file__).resolve().parent.parent / "AI_System_Engineer_Learning_Track_2027.md"
OUT_DIR = Path(__file__).resolve().parent

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
    "coursera": "Coursera",
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


def open_mode(url: str, lesson_type: str) -> str:
    if lesson_type == "Coursera" or "coursera.org" in url:
        return "Coursera app"
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
    """Coursera Plus block at top of track (not under a Course heading)."""
    rows = [
        (
            "Generative AI with Large Language Models",
            "https://www.coursera.org/learn/generative-ai-with-llms",
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
            "https://www.coursera.org/specializations/generative-ai-engineering-with-llms",
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
                "course_title": f"Coursera spine → Course {maps_to}",
                "month": MONTH_BY_COURSE.get(str(maps_to), ""),
                "section": "coursera_spine",
                "type": "Coursera",
                "lesson": title,
                "url": url,
                "duration": dur,
                "required": "No" if optional else "Yes",
                "open_how": open_mode(url, "Coursera"),
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

        if line.startswith("### Coursera") or "Coursera (required" in line or "Coursera / DL.AI" in line:
            section = "coursera"
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


def write_csv(lessons: list[dict], path: Path) -> None:
    fields = [
        "order",
        "course",
        "month",
        "type",
        "lesson",
        "url",
        "embed_url",
        "open_how",
        "duration",
        "required",
        "status",
        "prove_url",
        "notes",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for row in lessons:
            w.writerow({**row, "prove_url": "", "notes": row.get("course_title", "")})


def write_course_csv(lessons: list[dict], path: Path) -> None:
    """One row per course for Notion progress board."""
    prove_hints = {
        0: "Public GitHub reconciler",
        1: "Release v0.2 + README metrics",
        2: "HITL demo in README",
        3: "MCP README + redacted config",
        4: "Hybrid benchmark table",
        5: "chunks.jsonl + schema",
        6: "Validator test + query",
        7: "Golden set ≥30 + eval report",
        8: "CI regression screenshot",
        9: "Trace + policy test",
        10: "Tag alpha + caching evidence",
        11: "Deploy screenshot + adding-a-tool.md",
        12: "Tag v1.0 + lineage sample",
        13: "README why we added X",
        14: "Posts + resume",
        15: "Offer or feedback notes",
    }
    fields = ["course", "month", "title", "status", "prove_url", "prove_hint"]
    titles = {}
    for les in lessons:
        c = les["course"]
        if c not in titles and les.get("course_title"):
            titles[c] = les["course_title"]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for c in range(16):
            w.writerow(
                {
                    "course": c,
                    "month": MONTH_BY_COURSE.get(str(c), ""),
                    "title": titles.get(c, f"Course {c}"),
                    "status": "Not started",
                    "prove_url": "",
                    "prove_hint": prove_hints.get(c, ""),
                }
            )


def write_html(lessons: list[dict], path: Path) -> None:
    data = json.dumps(lessons, ensure_ascii=False)
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Systems Engineer 2027 — Platform Command Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #070A11;
      --bg-alt: #0C101B;
      --sidebar: #090D17;
      --surface: #111827;
      --surface-card: #141E33;
      --surface-hover: #1A2744;
      --text: #F8FAFC;
      --text-sub: #CBD5E1;
      --muted: #8493A8;
      --accent: #6366F1;
      --accent-light: #818CF8;
      --accent-glow: rgba(99, 102, 241, 0.3);
      --accent-grad: linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #06B6D4 100%);
      --done: #10B981;
      --done-bg: rgba(16, 185, 129, 0.12);
      --border: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(99, 102, 241, 0.6);
      --glass: rgba(17, 24, 39, 0.75);
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 14px;
      --shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }}
    
    /* Top Command Header */
    header.hub-header {{
      background: var(--sidebar);
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      z-index: 20;
    }}
    .brand-group {{
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }}
    .brand-logo {{
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: var(--accent-grad);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.05rem;
      color: #fff;
      box-shadow: 0 0 16px var(--accent-glow);
    }}
    .brand-title h1 {{
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }}
    .brand-title p {{
      font-size: 0.72rem;
      color: var(--muted);
      font-weight: 500;
    }}
    
    .stats-bar {{
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }}
    .stat-pill {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 0.35rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
    }}
    .stat-pill .dot {{
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 8px var(--accent);
    }}
    .stat-pill.done-stat .dot {{
      background: var(--done);
      box-shadow: 0 0 8px var(--done);
    }}
    .progress-track {{
      width: 140px;
      height: 6px;
      background: rgba(255,255,255,0.08);
      border-radius: 999px;
      overflow: hidden;
    }}
    .progress-fill {{
      height: 100%;
      width: 0%;
      background: var(--accent-grad);
      border-radius: 999px;
      transition: width 0.4s ease;
    }}
    
    /* Layout Container */
    .app-layout {{
      flex: 1;
      display: grid;
      grid-template-columns: 310px 1fr 380px;
      overflow: hidden;
      position: relative;
    }}
    
    /* Left Sidebar: Phases & Courses */
    aside.course-sidebar {{
      background: var(--sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }}
    .sidebar-header {{
      padding: 1rem 1.25rem 0.6rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
    }}
    .course-scroll {{
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem 0.85rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }}
    .phase-label {{
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748B;
      padding: 0.85rem 0.6rem 0.35rem;
    }}
    button.course-card {{
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      text-align: left;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-sub);
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }}
    button.course-card:hover {{
      background: var(--surface);
      color: #fff;
    }}
    button.course-card.active {{
      background: var(--surface-card);
      border-color: rgba(99, 102, 241, 0.4);
      color: #fff;
      font-weight: 600;
      box-shadow: 0 4px 16px -2px rgba(0,0,0,0.4), inset 0 0 12px rgba(99, 102, 241, 0.1);
    }}
    .course-icon {{
      font-size: 1.1rem;
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: rgba(255,255,255,0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }}
    button.course-card.active .course-icon {{
      background: rgba(99, 102, 241, 0.2);
    }}
    .course-info {{
      flex: 1;
      min-width: 0;
    }}
    .course-name {{
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 0.8rem;
    }}
    .course-meta-sub {{
      font-size: 0.68rem;
      color: var(--muted);
      margin-top: 1px;
    }}
    .course-badge-pill {{
      font-size: 0.68rem;
      font-weight: 600;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.06);
      color: var(--muted);
      font-family: 'JetBrains Mono', monospace;
    }}
    button.course-card.active .course-badge-pill {{
      background: rgba(99, 102, 241, 0.25);
      color: var(--accent-light);
    }}
    
    /* Main Content Area */
    main.hub-main {{
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: var(--bg);
      border-right: 1px solid var(--border);
      overflow: hidden;
    }}
    
    /* Media Stage (Top of Main) */
    .media-stage {{
      background: #000;
      border-bottom: 1px solid var(--border);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 260px;
      max-height: 380px;
    }}
    .media-stage iframe {{
      width: 100%;
      height: 100%;
      max-height: 340px;
      aspect-ratio: 16/9;
      border: 0;
    }}
    .empty-stage {{
      padding: 2.5rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      max-width: 480px;
    }}
    .empty-stage-icon {{
      font-size: 2.5rem;
      filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.4));
    }}
    .empty-stage h3 {{
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
    }}
    .empty-stage p {{
      font-size: 0.8rem;
      color: var(--muted);
      line-height: 1.45;
    }}
    .stage-launch-btn {{
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--accent-grad);
      color: #fff;
      font-weight: 600;
      font-size: 0.82rem;
      padding: 0.55rem 1.15rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
      box-shadow: 0 4px 16px var(--accent-glow);
      transition: transform 0.15s ease;
      cursor: pointer;
      border: none;
    }}
    .stage-launch-btn:hover {{
      transform: translateY(-2px);
    }}
    
    /* Filter Bar */
    .filter-bar {{
      padding: 0.75rem 1.25rem;
      background: var(--bg-alt);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }}
    .filter-chips {{
      display: flex;
      gap: 0.35rem;
      overflow-x: auto;
    }}
    .chip {{
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-sub);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }}
    .chip:hover, .chip.active {{
      background: var(--surface-hover);
      border-color: rgba(99, 102, 241, 0.5);
      color: #fff;
    }}
    .chip.active {{
      background: rgba(99, 102, 241, 0.2);
      border-color: var(--accent);
      color: var(--accent-light);
    }}
    .search-wrap {{
      flex: 1;
      min-width: 150px;
      position: relative;
    }}
    .search-input {{
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      font-size: 0.8rem;
      padding: 0.4rem 0.75rem 0.4rem 2rem;
      border-radius: 999px;
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s ease;
    }}
    .search-input:focus {{
      border-color: var(--accent);
    }}
    .search-icon {{
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.8rem;
      color: var(--muted);
    }}
    
    /* Lesson List Feed */
    .lesson-feed {{
      flex: 1;
      overflow-y: auto;
      padding: 1rem 1.25rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }}
    .lesson-item {{
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }}
    .lesson-item:hover {{
      background: var(--surface-card);
      border-color: rgba(255,255,255,0.14);
      transform: translateY(-1px);
    }}
    .lesson-item.selected {{
      border-color: var(--accent);
      background: var(--surface-card);
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.18);
    }}
    .lesson-item.done {{
      background: rgba(16, 185, 129, 0.04);
      border-color: rgba(16, 185, 129, 0.2);
    }}
    .lesson-item.done .lesson-title {{
      color: var(--muted);
      text-decoration: line-through;
    }}
    
    .checkbox-custom {{
      width: 1.15rem;
      height: 1.15rem;
      border-radius: 5px;
      border: 1.5px solid rgba(255,255,255,0.25);
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }}
    .lesson-item.done .checkbox-custom {{
      background: var(--done);
      border-color: var(--done);
    }}
    .checkbox-custom::after {{
      content: "✓";
      color: #fff;
      font-size: 0.75rem;
      font-weight: 800;
      display: none;
    }}
    .lesson-item.done .checkbox-custom::after {{
      display: block;
    }}
    
    .lesson-body {{
      flex: 1;
      min-width: 0;
    }}
    .lesson-title {{
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.4;
      color: var(--text);
    }}
    .lesson-subtitle {{
      font-size: 0.72rem;
      color: var(--muted);
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}
    
    /* Type Badges */
    .badge {{
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
      font-family: 'JetBrains Mono', monospace;
      white-space: nowrap;
    }}
    .badge-Video {{ background: rgba(236, 72, 153, 0.15); color: #F472B6; border: 1px solid rgba(236, 72, 153, 0.35); }}
    .badge-Coursera {{ background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.35); }}
    .badge-Read {{ background: rgba(139, 92, 246, 0.15); color: #C084FC; border: 1px solid rgba(139, 92, 246, 0.35); }}
    .badge-Build {{ background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.35); }}
    .badge-Prove {{ background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.35); }}
    .badge-Capstone {{ background: rgba(249, 115, 22, 0.15); color: #FB923C; border: 1px solid rgba(249, 115, 22, 0.35); }}
    .badge-Frontier {{ background: rgba(6, 182, 212, 0.15); color: #22D3EE; border: 1px solid rgba(6, 182, 212, 0.35); }}
    .badge-Do, .badge-Syllabus {{ background: rgba(148, 163, 184, 0.15); color: #CBD5E1; border: 1px solid rgba(148, 163, 184, 0.35); }}
    
    /* Right Pane: Inspector, Notes & Prove Hub */
    aside.inspector-pane {{
      background: var(--sidebar);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }}
    .inspector-tabs {{
      display: flex;
      border-bottom: 1px solid var(--border);
      background: var(--bg-alt);
    }}
    .tab-btn {{
      flex: 1;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--muted);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.8rem 0.5rem;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }}
    .tab-btn:hover {{
      color: var(--text);
    }}
    .tab-btn.active {{
      color: #fff;
      border-bottom-color: var(--accent);
      background: rgba(99, 102, 241, 0.05);
    }}
    
    .inspector-content {{
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }}
    .inspector-section {{
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }}
    .section-title {{
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
    }}
    .lesson-meta-card {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }}
    .meta-row {{
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
    }}
    .meta-row .label {{
      color: var(--muted);
    }}
    .meta-row .val {{
      font-weight: 600;
      color: var(--text-sub);
    }}
    
    .notes-textarea {{
      width: 100%;
      height: 180px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      padding: 0.85rem;
      resize: vertical;
      outline: none;
      line-height: 1.45;
    }}
    .notes-textarea:focus {{
      border-color: var(--accent);
    }}
    
    .prove-box {{
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }}
    .prove-input {{
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      font-size: 0.8rem;
      padding: 0.5rem 0.75rem;
      font-family: inherit;
    }}
    
    @media (max-width: 1100px) {{
      .app-layout {{ grid-template-columns: 260px 1fr; }}
      aside.inspector-pane {{ display: none; }}
    }}
  </style>
</head>
<body>

  <!-- Hub Header -->
  <header class="hub-header">
    <div class="brand-group">
      <div class="brand-logo">AI</div>
      <div class="brand-title">
        <h1>AI Systems Engineer 2027</h1>
        <p>Staff AI Platform Engineer Certification Runway</p>
      </div>
    </div>
    
    <div class="stats-bar">
      <div class="stat-pill">
        <span class="dot"></span>
        <span id="stat-active-phase">Phase 1 · Foundations</span>
      </div>
      <div class="stat-pill done-stat">
        <span class="dot"></span>
        <span id="stat-progress-text">0 / 145 Done (0%)</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" id="global-progress-bar"></div>
      </div>
    </div>
  </header>

  <!-- Hub App Grid -->
  <div class="app-layout">
    
    <!-- Left: Course Navigator -->
    <aside class="course-sidebar">
      <div class="sidebar-header">Curriculum & Roadmap</div>
      <div class="course-scroll" id="course-nav"></div>
    </aside>

    <!-- Center: Main Stage & Lesson Feed -->
    <main class="hub-main">
      
      <!-- Top Media Player / Launcher -->
      <div class="media-stage" id="media-stage">
        <div class="empty-stage" id="empty-stage-prompt">
          <div class="empty-stage-icon">⚡</div>
          <h3>Select a Lesson to Begin</h3>
          <p>Choose any lesson from the feed below to watch embedded lectures, launch deep links, or verify implementation checkpoints.</p>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="filter-bar">
        <div class="filter-chips">
          <button class="chip active" data-type="" onclick="setTypeFilter('', this)">All</button>
          <button class="chip" data-type="Video" onclick="setTypeFilter('Video', this)">📺 Video</button>
          <button class="chip" data-type="Coursera" onclick="setTypeFilter('Coursera', this)">🎓 Coursera</button>
          <button class="chip" data-type="Read" onclick="setTypeFilter('Read', this)">📖 Read</button>
          <button class="chip" data-type="Build" onclick="setTypeFilter('Build', this)">🛠️ Build</button>
          <button class="chip" data-type="Prove" onclick="setTypeFilter('Prove', this)">🏆 Prove</button>
          <button class="chip" data-type="Frontier" onclick="setTypeFilter('Frontier', this)">⚡ Frontier</button>
        </div>
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="search" class="search-input" id="search-input" placeholder="Filter lessons (or press /)..." />
        </div>
      </div>

      <!-- Lesson Card Feed -->
      <div class="lesson-feed" id="lesson-feed"></div>
    </main>

    <!-- Right: Inspector, Notes & Proof Hub -->
    <aside class="inspector-pane">
      <div class="inspector-tabs">
        <button class="tab-btn active" onclick="setTab('overview', this)">Overview</button>
        <button class="tab-btn" onclick="setTab('notes', this)">Scratchpad</button>
        <button class="tab-btn" onclick="setTab('prove', this)">Prove Gate</button>
      </div>

      <div class="inspector-content" id="tab-overview">
        <div class="inspector-section">
          <div class="section-title">Active Lesson</div>
          <h2 id="insp-title" style="font-size:0.95rem;font-weight:700;line-height:1.4">Select a lesson</h2>
          <div id="insp-tags" style="display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap"></div>
        </div>

        <div class="inspector-section">
          <div class="section-title">Context & Attributes</div>
          <div class="lesson-meta-card">
            <div class="meta-row">
              <span class="label">Course</span>
              <span class="val" id="insp-course">—</span>
            </div>
            <div class="meta-row">
              <span class="label">Target Month</span>
              <span class="val" id="insp-month">—</span>
            </div>
            <div class="meta-row">
              <span class="label">Runtime / Effort</span>
              <span class="val" id="insp-duration">—</span>
            </div>
            <div class="meta-row">
              <span class="label">Launch Target</span>
              <span class="val" id="insp-mode">—</span>
            </div>
          </div>
        </div>

        <div class="inspector-section" id="insp-actions" style="display:flex;flex-direction:column;gap:0.5rem">
          <!-- Dynamic Action Buttons -->
        </div>
      </div>

      <div class="inspector-content" id="tab-notes" style="display:none">
        <div class="inspector-section">
          <div class="section-title">Persistent Study Notes</div>
          <p style="font-size:0.75rem;color:var(--muted)">Notes are saved automatically in your browser for this specific lesson.</p>
          <textarea class="notes-textarea" id="notes-textarea" placeholder="Record key architectural takeaways, trade-offs, or code snippets..."></textarea>
        </div>
      </div>

      <div class="inspector-content" id="tab-prove" style="display:none">
        <div class="inspector-section">
          <div class="section-title">Prove Gate Evidence</div>
          <div class="prove-box">
            <h4 style="font-size:0.85rem;font-weight:700;color:var(--done)">🏆 Verifiable Evidence</h4>
            <p style="font-size:0.75rem;color:var(--text-sub)">Paste your GitHub Repo, PR link, or metric artifact score:</p>
            <input type="url" class="prove-input" id="prove-url-input" placeholder="https://github.com/your-username/repo..." />
            <button class="stage-launch-btn" style="width:100%;justify-content:center" onclick="saveProveUrl()">Save Gate Proof</button>
          </div>
        </div>
      </div>

    </aside>
  </div>

  <script>
    const LESSONS = {data};
    const STORAGE_KEY = "ai-sys-eng-2027-progress";
    const NOTES_KEY = "ai-sys-eng-2027-notes";
    const PROVE_KEY = "ai-sys-eng-2027-prove";

    let progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{{}}");
    let notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "{{}}");
    let proveUrls = JSON.parse(localStorage.getItem(PROVE_KEY) || "{{}}");

    let currentCourse = 0;
    let selectedOrder = null;
    let activeTypeFilter = "";
    let activeSearch = "";

    const COURSE_EMOJIS = [
      "⚡", "🧠", "🕸️", "🔌", "🔍", "📄", "🕸️", "🧪", 
      "🚦", "🛡️", "🏗️", "🚢", "📜", "🚀", "💼", "🎯"
    ];

    const COURSE_PHASES = {{
      0: "Pre-Start (Pre-Oct 2026)",
      1: "Phase 1: Determinism & Agents",
      2: "Phase 1: Determinism & Agents",
      3: "Phase 1: Determinism & Agents",
      4: "Phase 2: Retrieval & Parsing",
      5: "Phase 2: Retrieval & Parsing",
      6: "Phase 2: Retrieval & Parsing",
      7: "Phase 3: Evals & Security",
      8: "Phase 3: Evals & Security",
      9: "Phase 3: Evals & Security",
      10: "Phase 4: Capstone Platform",
      11: "Phase 4: Capstone Platform",
      12: "Phase 4: Capstone Platform",
      13: "Phase 5: Frontier & Hiring",
      14: "Phase 5: Frontier & Hiring",
      15: "Phase 5: Frontier & Hiring"
    }};

    function saveProgress() {{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      updateGlobalStats();
      renderCourseSidebar();
    }}

    function updateGlobalStats() {{
      const total = LESSONS.length;
      const done = LESSONS.filter(l => progress[l.order]).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      
      const bar = document.getElementById("global-progress-bar");
      const text = document.getElementById("stat-progress-text");
      const phase = document.getElementById("stat-active-phase");

      if (bar) bar.style.width = pct + "%";
      if (text) text.textContent = `${{done}} / ${{total}} Done (${{pct}}%)`;
      if (phase) phase.textContent = COURSE_PHASES[currentCourse] || "AI Systems Track";
    }}

    function renderCourseSidebar() {{
      const nav = document.getElementById("course-nav");
      const courses = [...new Set(LESSONS.map(l => l.course))].sort((a,b) => a-b);
      nav.innerHTML = "";

      let lastPhase = "";
      courses.forEach(c => {{
        const phase = COURSE_PHASES[c] || "";
        if (phase !== lastPhase) {{
          const pEl = document.createElement("div");
          pEl.className = "phase-label";
          pEl.textContent = phase;
          nav.appendChild(pEl);
          lastPhase = phase;
        }}

        const courseLessons = LESSONS.filter(l => l.course === c);
        const doneCount = courseLessons.filter(l => progress[l.order]).length;
        const sample = courseLessons[0] || {{}};
        
        const btn = document.createElement("button");
        btn.className = "course-card" + (c === currentCourse ? " active" : "");
        const emoji = COURSE_EMOJIS[c] || "📚";
        
        btn.innerHTML = `
          <div class="course-icon">${{emoji}}</div>
          <div class="course-info">
            <div class="course-name">Course ${{c}}</div>
            <div class="course-meta-sub">${{sample.month || ""}}</div>
          </div>
          <div class="course-badge-pill">${{doneCount}}/${{courseLessons.length}}</div>
        `;

        btn.onclick = () => {{
          currentCourse = c;
          renderCourseSidebar();
          renderLessonFeed();
          updateGlobalStats();
        }};
        nav.appendChild(btn);
      }});
    }}

    function filteredLessons() {{
      return LESSONS.filter(l => {{
        if (l.course !== currentCourse) return false;
        if (activeTypeFilter && l.type !== activeTypeFilter) return false;
        if (activeSearch && !l.lesson.toLowerCase().includes(activeSearch)) return false;
        return true;
      }});
    }}

    function renderMediaStage(lesson) {{
      const stage = document.getElementById("media-stage");
      if (!lesson) {{
        stage.innerHTML = `
          <div class="empty-stage">
            <div class="empty-stage-icon">⚡</div>
            <h3>Select a Lesson</h3>
            <p>Select any item below to view lectures or execute tasks.</p>
          </div>
        `;
        return;
      }}

      if (lesson.embed_url) {{
        stage.innerHTML = `<iframe allowfullscreen src="${{lesson.embed_url}}"></iframe>`;
      }} else if (lesson.url) {{
        stage.innerHTML = `
          <div class="empty-stage">
            <div class="empty-stage-icon">🔗</div>
            <h3>${{lesson.lesson}}</h3>
            <p style="color:var(--muted)">Target: ${{lesson.open_how}} · ${{lesson.duration || "Self-paced"}}</p>
            <a href="${{lesson.url}}" target="_blank" rel="noopener" class="stage-launch-btn">↗ Launch Resource in ${{lesson.open_how}}</a>
          </div>
        `;
      }} else {{
        stage.innerHTML = `
          <div class="empty-stage">
            <div class="empty-stage-icon">🛠️</div>
            <h3>${{lesson.lesson}}</h3>
            <p>Hands-on repository milestone. Test and verify invariants locally.</p>
            <button class="stage-launch-btn" onclick="toggleComplete(${{lesson.order}})">
              ${{progress[lesson.order] ? "↩ Mark Incomplete" : "✓ Mark Done"}}
            </button>
          </div>
        `;
      }}
    }}

    function renderInspector(lesson) {{
      if (!lesson) return;
      document.getElementById("insp-title").textContent = lesson.lesson;
      
      const badgeClass = "badge-" + (lesson.type || "Do");
      document.getElementById("insp-tags").innerHTML = `
        <span class="badge ${{badgeClass}}">${{lesson.type}}</span>
        <span style="font-size:0.72rem;color:var(--muted)">${{lesson.required === "Yes" ? "⭐ Required" : "Optional"}}</span>
      `;

      document.getElementById("insp-course").textContent = lesson.course_title || `Course ${{lesson.course}}`;
      document.getElementById("insp-month").textContent = lesson.month || "—";
      document.getElementById("insp-duration").textContent = lesson.duration || "Flexible";
      document.getElementById("insp-mode").textContent = lesson.open_how || "Browser";

      const actions = document.getElementById("insp-actions");
      actions.innerHTML = `
        ${{lesson.url ? `<a href="${{lesson.url}}" target="_blank" rel="noopener" class="stage-launch-btn" style="justify-content:center">↗ Open External Link</a>` : ""}}
        <button class="stage-launch-btn" style="background:var(--surface);border:1px solid var(--border);color:var(--text);justify-content:center" onclick="toggleComplete(${{lesson.order}})">
          ${{progress[lesson.order] ? "↩ Mark Incomplete" : "✓ Mark Complete"}}
        </button>
      `;

      // Load notes
      const noteField = document.getElementById("notes-textarea");
      noteField.value = notes[lesson.order] || "";
      noteField.oninput = (e) => {{
        notes[lesson.order] = e.target.value;
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      }};

      // Load prove URL
      const proveField = document.getElementById("prove-url-input");
      proveField.value = proveUrls[lesson.order] || "";
    }}

    function saveProveUrl() {{
      if (!selectedOrder) return;
      const proveField = document.getElementById("prove-url-input");
      proveUrls[selectedOrder] = proveField.value;
      localStorage.setItem(PROVE_KEY, JSON.stringify(proveUrls));
      alert("Prove gate saved!");
    }}

    function toggleComplete(order) {{
      progress[order] = !progress[order];
      saveProgress();
      renderLessonFeed();
      const cur = LESSONS.find(l => l.order === order);
      if (cur) {{
        renderMediaStage(cur);
        renderInspector(cur);
      }}
    }}

    function renderLessonFeed() {{
      const feed = document.getElementById("lesson-feed");
      feed.innerHTML = "";
      const list = filteredLessons();

      if (list.length === 0) {{
        feed.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--muted);font-size:0.85rem">No lessons found matching your filter criteria.</div>`;
        return;
      }}

      list.forEach(lesson => {{
        const isDone = !!progress[lesson.order];
        const isSelected = selectedOrder === lesson.order;
        const card = document.createElement("div");
        card.className = "lesson-item" + (isSelected ? " selected" : "") + (isDone ? " done" : "");

        const badgeClass = "badge-" + (lesson.type || "Do");
        card.innerHTML = `
          <div class="checkbox-custom" onclick="event.stopPropagation(); toggleComplete(${{lesson.order}})"></div>
          <div class="lesson-body">
            <div class="lesson-title">${{lesson.lesson}}</div>
            <div class="lesson-subtitle">
              <span>${{lesson.duration || lesson.open_how}}</span>
              ${{lesson.required === "Yes" ? '<span style="color:var(--accent-light)">• Required</span>' : ""}}
            </div>
          </div>
          <span class="badge ${{badgeClass}}">${{lesson.type}}</span>
        `;

        card.onclick = () => {{
          selectedOrder = lesson.order;
          renderMediaStage(lesson);
          renderInspector(lesson);
          renderLessonFeed();
        }};
        feed.appendChild(card);
      }});
    }}

    function setTypeFilter(type, btn) {{
      activeTypeFilter = type;
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      if (btn) btn.classList.add("active");
      renderLessonFeed();
    }}

    function setTab(tabId, btn) {{
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      if (btn) btn.classList.add("active");
      
      document.getElementById("tab-overview").style.display = tabId === "overview" ? "flex" : "none";
      document.getElementById("tab-notes").style.display = tabId === "notes" ? "flex" : "none";
      document.getElementById("tab-prove").style.display = tabId === "prove" ? "flex" : "none";
    }}

    // Search and Keyboard Hotkeys
    document.getElementById("search-input").oninput = (e) => {{
      activeSearch = e.target.value.toLowerCase();
      renderLessonFeed();
    }};

    window.addEventListener("keydown", (e) => {{
      if (e.key === "/" && document.activeElement.tagName !== "TEXTAREA" && document.activeElement.tagName !== "INPUT") {{
        e.preventDefault();
        document.getElementById("search-input").focus();
      }}
    }});

    // Initialize
    renderCourseSidebar();
    updateGlobalStats();
    renderLessonFeed();
    
    // Select first lesson by default
    const first = LESSONS.find(l => l.course === currentCourse);
    if (first) {{
      selectedOrder = first.order;
      renderMediaStage(first);
      renderInspector(first);
      renderLessonFeed();
    }}
  </script>
</body>
</html>
"""
    path.write_text(html, encoding="utf-8")


def main() -> None:
    text = TRACK.read_text(encoding="utf-8")
    lessons = spine_lessons()
    parsed = parse_track(text)
    # Re-order parsed lessons after spine
    base = len(lessons)
    for row in parsed:
        row["order"] += base
    lessons.extend(parsed)
    write_csv(lessons, OUT_DIR / "notion_lessons.csv")
    write_course_csv(lessons, OUT_DIR / "notion_course_progress.csv")
    (OUT_DIR / "lessons.json").write_text(
        json.dumps({"generated_from": str(TRACK.name), "lessons": lessons}, indent=2),
        encoding="utf-8",
    )
    write_html(lessons, OUT_DIR / "index.html")
    print(
        f"Wrote {len(lessons)} lessons → notion_lessons.csv, lessons.json, index.html, notion_course_progress.csv"
    )


if __name__ == "__main__":
    main()
