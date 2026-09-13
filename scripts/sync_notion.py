#!/usr/bin/env python3
"""
Push curriculum from lessons.json (+ course progress CSV) into Notion via API.

One-time: create integration + share parent page → setup
Ongoing: edit track → generate_lessons.py → sync_notion.py sync

Requires env NOTION_TOKEN (integration secret). IDs stored in .notion_ids.json (local).
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

OUT_DIR = Path(__file__).resolve().parent
LESSONS_JSON = OUT_DIR / "lessons.json"
PROGRESS_CSV = OUT_DIR / "notion_course_progress.csv"
IDS_FILE = OUT_DIR / ".notion_ids.json"
LOCAL_DIR = OUT_DIR.parent

from md_to_notion_blocks import markdown_to_blocks  # noqa: E402

NOTION_VERSION = "2022-06-28"
API = "https://api.notion.com/v1"


def normalize_notion_id(raw: str) -> str:
    """
    Accept raw page ID, dashed UUID, or Notion URL slug (e.g. Title-abc123...).
    Returns canonical UUID with dashes for the API.
    """
    cleaned = raw.strip()
    hex_chars = re.sub(r"[^0-9a-fA-F]", "", cleaned)
    if len(hex_chars) < 32:
        raise SystemExit(
            f"Invalid Notion page/database ID (need 32 hex characters). Got: {raw!r}"
        )
    hex32 = hex_chars[-32:].lower()
    return f"{hex32[0:8]}-{hex32[8:12]}-{hex32[12:16]}-{hex32[16:20]}-{hex32[20:32]}"


def _headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def notion_request(
    token: str,
    method: str,
    path: str,
    body: dict[str, Any] | None = None,
) -> dict[str, Any]:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        headers=_headers(token),
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="replace")
        hint = _http_hint(e.code, path, err)
        raise SystemExit(f"Notion API {e.code} {path}: {err}\n{hint}") from e


def _http_hint(code: int, path: str, err_body: str) -> str:
    if code != 404:
        return ""
    if "object_not_found" in err_body and (
        path.startswith("/pages/") or path == "/databases"
    ):
        return (
            "Fix: Open your target page in Notion (the one in NOTION_PARENT_PAGE_ID) → "
            "top-right ··· → Connections → add your integration (e.g. automation). "
            "Then re-run. Copy the page ID from the browser URL (32 hex after the title)."
        )
    return ""


def load_ids() -> dict[str, str]:
    if IDS_FILE.exists():
        return json.loads(IDS_FILE.read_text(encoding="utf-8"))
    return {}


def save_ids(ids: dict[str, str]) -> None:
    IDS_FILE.write_text(json.dumps(ids, indent=2), encoding="utf-8")
    print(f"Saved database IDs → {IDS_FILE}")


def rt(text: str) -> dict[str, Any]:
    if not text:
        return {"rich_text": []}
    return {"rich_text": [{"type": "text", "text": {"content": text[:2000]}}]}


def url_prop(value: str) -> dict[str, Any]:
    if not value:
        return {"url": None}
    return {"url": value}


def select_prop(value: str) -> dict[str, Any]:
    if not value:
        return {"select": None}
    return {"select": {"name": value.strip()[:100]}}


def lesson_icon(lesson_type: str) -> dict[str, Any]:
    icons = {
        "Video": "📺",
        "Paper": "📄",
        "Masterclass": "🎬",
        "Read": "📖",
        "Build": "🛠️",
        "Prove": "🏆",
        "Frontier": "⚡",
        "Capstone": "🏗️",
        "Syllabus": "📋",
        "Do": "✅",
    }
    return {"type": "emoji", "emoji": icons.get(lesson_type, "📌")}


def course_icon(course_num: int) -> dict[str, Any]:
    course_emojis = [
        "⚡",  # 0: Boot
        "🧠",  # 1: Foundations
        "🕸️",  # 2: LangGraph
        "🔌",  # 3: MCP
        "🔍",  # 4: Hybrid retrieval
        "📄",  # 5: Document parsing
        "🕸️",  # 6: GraphRAG
        "🧪",  # 7: Evals
        "🚦",  # 8: CI/CD Gates
        "🛡️",  # 9: Policy & Tracing
        "🏗️",  # 10: Capstone Alpha
        "🚢",  # 11: Deploy & Helm
        "📜",  # 12: Lineage
        "🚀",  # 13: Frontier (vLLM/DSPy)
        "💼",  # 14: Portfolio / LoRA
        "🎯",  # 15: Interviews
    ]
    emoji = course_emojis[course_num] if 0 <= course_num < len(course_emojis) else "📚"
    return {"type": "emoji", "emoji": emoji}


def lesson_properties(row: dict[str, Any], include_status: bool = True) -> dict[str, Any]:
    props: dict[str, Any] = {
        "lesson": {"title": [{"type": "text", "text": {"content": row["lesson"][:2000]}}]},
        "order": {"number": row["order"]},
        "course": {"number": row["course"]},
        "month": select_prop(row.get("month", "")),
        "type": select_prop(row.get("type", "")),
        "url": url_prop(row.get("url", "")),
        "embed_url": url_prop(row.get("embed_url", "")),
        "open_how": select_prop(row.get("open_how", "")),
        "duration": rt(row.get("duration", "")),
        "required": select_prop(row.get("required", "")),
        "notes": rt(row.get("course_title", "")),
    }
    if include_status:
        props["status"] = select_prop(row.get("status", "Not started"))
    return props


def progress_properties(row: dict[str, str]) -> dict[str, Any]:
    title = f"Course {row['course']}"
    return {
        "course": {"title": [{"type": "text", "text": {"content": title}}]},
        "course_num": {"number": int(row["course"])},
        "month": select_prop(row.get("month", "")),
        "title": rt(row.get("title", "")),
        "status": select_prop(row.get("status", "Not started")),
        "prove_url": url_prop(row.get("prove_url", "")),
        "prove_hint": rt(row.get("prove_hint", "")),
    }


def create_lessons_database(token: str, parent_page_id: str) -> str:
    body = {
        "parent": {"type": "page_id", "page_id": parent_page_id},
        "icon": {"type": "emoji", "emoji": "📚"},
        "title": [{"type": "text", "text": {"content": "Lessons (AI Sys Eng 2027)"}}],
        "properties": {
            "lesson": {"title": {}},
            "order": {"number": {"format": "number"}},
            "course": {"number": {"format": "number"}},
            "month": {"select": {}},
            "type": {"select": {}},
            "url": {"url": {}},
            "embed_url": {"url": {}},
            "open_how": {"select": {}},
            "duration": {"rich_text": {}},
            "required": {"select": {}},
            "status": {"select": {}},
            "notes": {"rich_text": {}},
            "prove_url": {"url": {}},
        },
    }
    res = notion_request(token, "POST", "/databases", body)
    return res["id"]


def create_progress_database(token: str, parent_page_id: str) -> str:
    body = {
        "parent": {"type": "page_id", "page_id": parent_page_id},
        "icon": {"type": "emoji", "emoji": "📊"},
        "title": [{"type": "text", "text": {"content": "Course progress (AI Sys Eng 2027)"}}],
        "properties": {
            "course": {"title": {}},
            "course_num": {"number": {"format": "number"}},
            "month": {"select": {}},
            "title": {"rich_text": {}},
            "status": {"select": {}},
            "prove_url": {"url": {}},
            "prove_hint": {"rich_text": {}},
        },
    }
    res = notion_request(token, "POST", "/databases", body)
    return res["id"]


def query_all_pages(token: str, database_id: str) -> list[dict[str, Any]]:
    pages: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        body: dict[str, Any] = {"page_size": 100}
        if cursor:
            body["start_cursor"] = cursor
        res = notion_request(token, "POST", f"/databases/{database_id}/query", body)
        pages.extend(res.get("results", []))
        if not res.get("has_more"):
            break
        cursor = res.get("next_cursor")
    return pages


def page_order(page: dict[str, Any]) -> int | None:
    props = page.get("properties", {})
    order_prop = props.get("order", {})
    return order_prop.get("number")


def page_course_num(page: dict[str, Any]) -> int | None:
    props = page.get("properties", {})
    num = props.get("course_num", {})
    return num.get("number")


def sync_lessons(token: str, database_id: str, lessons: list[dict[str, Any]]) -> None:
    existing = query_all_pages(token, database_id)
    by_order = {page_order(p): p["id"] for p in existing if page_order(p) is not None}
    created = updated = 0
    for row in lessons:
        oid = row["order"]
        props = lesson_properties(row, include_status=oid not in by_order)
        icon = lesson_icon(row.get("type", ""))
        if oid in by_order:
            notion_request(
                token,
                "PATCH",
                f"/pages/{by_order[oid]}",
                {"icon": icon, "properties": {k: v for k, v in props.items() if k != "status"}},
            )
            updated += 1
        else:
            notion_request(
                token,
                "POST",
                "/pages",
                {"parent": {"database_id": database_id}, "icon": icon, "properties": props},
            )
            created += 1
        time.sleep(0.35)
    print(f"Lessons: {created} created, {updated} updated (status left unchanged on existing rows)")


def sync_progress(token: str, database_id: str) -> None:
    if not PROGRESS_CSV.exists():
        print("Skip progress: notion_course_progress.csv missing")
        return
    rows = list(csv.DictReader(PROGRESS_CSV.read_text(encoding="utf-8").splitlines()))
    existing = query_all_pages(token, database_id)
    by_num = {page_course_num(p): p["id"] for p in existing if page_course_num(p) is not None}
    created = updated = 0
    for row in rows:
        num = int(row["course"])
        props = progress_properties(row)
        icon = course_icon(num)
        if num in by_num:
            notion_request(
                token,
                "PATCH",
                f"/pages/{by_num[num]}",
                {
                    "icon": icon,
                    "properties": {
                        k: v
                        for k, v in props.items()
                        if k not in ("status", "prove_url")
                    },
                },
            )
            updated += 1
        else:
            notion_request(
                token,
                "POST",
                "/pages",
                {"parent": {"database_id": database_id}, "icon": icon, "properties": props},
            )
            created += 1
        time.sleep(0.35)
    print(f"Course progress: {created} created, {updated} updated")


def list_child_pages(token: str, parent_page_id: str) -> list[dict[str, Any]]:
    """Direct child pages under a Notion page."""
    pages: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        path = f"/blocks/{parent_page_id}/children?page_size=100"
        if cursor:
            path += f"&start_cursor={cursor}"
        res = notion_request(token, "GET", path)
        for block in res.get("results", []):
            if block.get("type") == "child_page":
                t = block.get("child_page", {}).get("title", "")
                pages.append({"id": block["id"], "title": t})
        if not res.get("has_more"):
            break
        cursor = res.get("next_cursor")
    return pages


def archive_page(token: str, page_id: str) -> None:
    notion_request(token, "PATCH", f"/pages/{page_id}", {"archived": True})


def append_block_batch(token: str, parent_block_id: str, batch: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not batch:
        return []
    res = notion_request(
        token,
        "PATCH",
        f"/blocks/{parent_block_id}/children",
        {"children": batch},
    )
    time.sleep(0.35)
    return res.get("results", [])


def append_blocks_to_parent(token: str, parent_id: str, blocks: list[dict[str, Any]]) -> None:
    """Append blocks; Notion tables must be sent alone with row children inline."""
    pending: list[dict[str, Any]] = []
    for block in blocks:
        if block.get("type") == "table":
            if pending:
                append_block_batch(token, parent_id, pending)
                pending = []
            append_block_batch(token, parent_id, [block])
            continue
        pending.append(block)
        if len(pending) >= 100:
            append_block_batch(token, parent_id, pending)
            pending = []
    if pending:
        append_block_batch(token, parent_id, pending)


def append_markdown_page(token: str, parent_page_id: str, title: str, md_path: Path) -> None:
    text = md_path.read_text(encoding="utf-8")[:400000]
    children = markdown_to_blocks(text)
    page_icons = {
        "Learning Track 2027": {"type": "emoji", "emoji": "🗺️"},
        "Plan 2027": {"type": "emoji", "emoji": "🎯"},
        "Reference 2027": {"type": "emoji", "emoji": "📖"},
    }
    icon = page_icons.get(title, {"type": "emoji", "emoji": "📄"})
    page = notion_request(
        token,
        "POST",
        "/pages",
        {
            "parent": {"type": "page_id", "page_id": parent_page_id},
            "icon": icon,
            "properties": {
                "title": {
                    "title": [{"type": "text", "text": {"content": title[:2000]}}],
                },
            },
        },
    )
    page_id = page["id"]
    append_blocks_to_parent(token, page_id, children)
    print(f"Created page: {title} ({md_path.name}, {len(children)} top-level blocks)")


def _page_title(page: dict[str, Any]) -> str:
    for prop in page.get("properties", {}).values():
        if prop.get("type") == "title":
            return "".join(t.get("plain_text", "") for t in prop.get("title", []))
    return "(untitled)"


def cmd_verify(token: str, parent_raw: str) -> None:
    me = notion_request(token, "GET", "/users/me")
    bot = me.get("name") or me.get("id") or "integration"
    print(f"Token OK — integration: {bot}")
    if not parent_raw:
        print("NOTION_PARENT_PAGE_ID not set; skipping page check.")
        return
    parent_id = normalize_notion_id(parent_raw)
    print(f"Resolved parent page UUID: {parent_id}")
    page = notion_request(token, "GET", f"/pages/{parent_id}")
    print(f"Parent page accessible: {_page_title(page)}")
    print("Ready for: python3 sync_notion.py setup")


def cmd_setup(token: str, parent_page_id: str) -> None:
    ids = load_ids()
    if not ids.get("lessons_db_id"):
        ids["lessons_db_id"] = create_lessons_database(token, parent_page_id)
        print(f"Created lessons DB: {ids['lessons_db_id']}")
    if not ids.get("progress_db_id"):
        ids["progress_db_id"] = create_progress_database(token, parent_page_id)
        print(f"Created progress DB: {ids['progress_db_id']}")
    ids["parent_page_id"] = parent_page_id
    save_ids(ids)


def cmd_sync(token: str) -> None:
    if not LESSONS_JSON.exists():
        raise SystemExit("Run generate_lessons.py first (missing lessons.json)")
    ids = load_ids()
    lessons_db = ids.get("lessons_db_id") or os.environ.get("NOTION_LESSONS_DB_ID")
    progress_db = ids.get("progress_db_id") or os.environ.get("NOTION_PROGRESS_DB_ID")
    if not lessons_db:
        raise SystemExit("No lessons DB id. Run: sync_notion.py setup --parent-page-id <id>")
    payload = json.loads(LESSONS_JSON.read_text(encoding="utf-8"))
    sync_lessons(token, lessons_db, payload["lessons"])
    if progress_db:
        sync_progress(token, progress_db)


def cmd_import_md(token: str, replace: bool = False) -> None:
    ids = load_ids()
    parent_raw = ids.get("parent_page_id") or os.environ.get("NOTION_PARENT_PAGE_ID")
    if not parent_raw:
        raise SystemExit("Set NOTION_PARENT_PAGE_ID or run setup first")
    parent = normalize_notion_id(parent_raw)
    files = [
        ("Learning Track 2027", LOCAL_DIR / "AI_System_Engineer_Learning_Track_2027.md"),
        ("Plan 2027", LOCAL_DIR / "AI_System_Engineer_plan_2027.md"),
        ("Reference 2027", LOCAL_DIR / "AI_System_Engineer_Learning_Track_2027_REFERENCE.md"),
    ]
    titles = {t for t, _ in files}
    if replace:
        for child in list_child_pages(token, parent):
            if child["title"] in titles:
                archive_page(token, child["id"])
                print(f"Archived old page: {child['title']}")
                time.sleep(0.35)
    for title, path in files:
        if path.exists():
            append_markdown_page(token, parent, title, path)
            time.sleep(0.5)
        else:
            print(f"Skip missing {path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync AI 2027 curriculum to Notion")
    parser.add_argument(
        "command",
        choices=["verify", "setup", "sync", "import-md", "all"],
        help="verify=test token+page; setup=create DBs; sync=upsert; import-md=markdown pages; all=full",
    )
    parser.add_argument(
        "--parent-page-id",
        help="Notion page ID (32 hex, no dashes) under workspace — databases created here",
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="import-md: archive existing child pages with same titles before re-import",
    )
    args = parser.parse_args()
    token = os.environ.get("NOTION_TOKEN", "").strip()
    if not token:
        raise SystemExit(
            "Set NOTION_TOKEN to your integration secret "
            "(https://www.notion.so/my-integrations)"
        )

    parent_raw = args.parent_page_id or os.environ.get("NOTION_PARENT_PAGE_ID", "")
    parent = normalize_notion_id(parent_raw) if parent_raw else ""

    if args.command == "verify":
        cmd_verify(token, parent_raw)
        return

    if args.command in ("setup", "all"):
        if not parent:
            raise SystemExit("--parent-page-id or NOTION_PARENT_PAGE_ID required for setup")
        cmd_verify(token, parent_raw)
        cmd_setup(token, parent)

    if args.command in ("sync", "all"):
        cmd_sync(token)

    if args.command in ("import-md", "all"):
        cmd_import_md(token, replace=args.replace)


if __name__ == "__main__":
    main()
