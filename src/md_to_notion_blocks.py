"""Convert markdown (subset) to Notion API block objects."""

from __future__ import annotations

import re
from typing import Any

LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def _valid_notion_url(url: str) -> str | None:
    url = url.strip()
    if url.startswith(("http://", "https://", "mailto:")):
        return url
    return None


BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
CODE_RE = re.compile(r"`([^`]+)`")
SEP_ROW_RE = re.compile(r"^[\s|:-]+$")


def _split_rich_segments(text: str) -> list[tuple[str, dict[str, Any]]]:
    """Return (plain_text, annotations/link) segments in order."""
    if not text:
        return [("", {})]

    segments: list[tuple[str, dict[str, Any]]] = []
    pos = 0
    patterns = [
        (
            LINK_RE,
            lambda m: (
                m.group(1),
                {"link": {"url": u}}
                if (u := _valid_notion_url(m.group(2)))
                else (m.group(1), {}),
            ),
        ),
        (BOLD_RE, lambda m: (m.group(1), {"annotations": {"bold": True}})),
        (CODE_RE, lambda m: (m.group(1), {"annotations": {"code": True}})),
    ]

    while pos < len(text):
        best: tuple[int, int, tuple[str, dict[str, Any]]] | None = None
        for pat, handler in patterns:
            m = pat.search(text, pos)
            if m and (best is None or m.start() < best[0]):
                best = (m.start(), m.end(), handler(m))
        if best is None:
            segments.append((text[pos:], {}))
            break
        start, end, payload = best
        if start > pos:
            segments.append((text[pos:start], {}))
        segments.append(payload)
        pos = end
    return segments


def rich_text(line: str) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for content, meta in _split_rich_segments(line):
        if not content:
            continue
        chunk_size = 2000
        for i in range(0, len(content), chunk_size):
            piece = content[i : i + chunk_size]
            obj: dict[str, Any] = {"type": "text", "text": {"content": piece}}
            if "link" in meta:
                obj["text"]["link"] = meta["link"]
            if "annotations" in meta:
                obj["annotations"] = meta["annotations"]
            out.append(obj)
    if not out:
        out = [{"type": "text", "text": {"content": " "}}]
    return out


def _block(block_type: str, key: str, body: dict[str, Any]) -> dict[str, Any]:
    return {"object": "block", "type": block_type, key: body}


def _callout_block(text: str, emoji: str = "💡") -> dict[str, Any]:
    return {
        "object": "block",
        "type": "callout",
        "callout": {
            "rich_text": rich_text(text),
            "icon": {"type": "emoji", "emoji": emoji},
        },
    }


def _parse_table_cells(line: str) -> list[str]:
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [cell.strip() for cell in line.split("|")]


def _is_separator_row(cells: list[str]) -> bool:
    if not cells:
        return True
    return all(not c or SEP_ROW_RE.match(c.replace(" ", "")) for c in cells)


def _table_as_code_block(table_lines: list[str]) -> dict[str, Any]:
    body = "\n".join(table_lines)[:1900]
    return _block(
        "code",
        "code",
        {"rich_text": [{"type": "text", "text": {"content": body}}], "language": "plain text"},
    )


def _table_as_notion_table(table_lines: list[str]) -> dict[str, Any] | None:
    parsed: list[list[str]] = []
    has_column_header = False
    for line in table_lines:
        cells = _parse_table_cells(line)
        if not any(cells):
            continue
        if _is_separator_row(cells):
            has_column_header = True
            continue
        parsed.append(cells)
    if not parsed:
        return None
    width = max(len(row) for row in parsed)
    if width < 1 or width > 20:
        return None
    if len(parsed) > 100:
        return None

    row_blocks: list[dict[str, Any]] = []
    for row in parsed:
        padded = row + [""] * (width - len(row))
        row_blocks.append(
            {
                "type": "table_row",
                "table_row": {
                    "cells": [rich_text(cell) for cell in padded[:width]],
                },
            }
        )

    return {
        "object": "block",
        "type": "table",
        "table": {
            "table_width": width,
            "has_column_header": has_column_header,
            "has_row_header": False,
            "children": row_blocks,
        },
    }


def markdown_to_blocks(md: str, max_blocks: int = 1800) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    lines = md.splitlines()
    i = 0
    in_code = False
    code_lang = ""
    code_lines: list[str] = []
    table_lines: list[str] = []

    def flush_table() -> None:
        nonlocal table_lines
        if not table_lines:
            return
        notion_table = _table_as_notion_table(table_lines)
        if notion_table:
            blocks.append(notion_table)
        else:
            blocks.append(_table_as_code_block(table_lines))
        table_lines = []

    def flush_code() -> None:
        nonlocal code_lines, code_lang
        if not code_lines:
            return
        body = "\n".join(code_lines)[:1900]
        blocks.append(
            _block(
                "code",
                "code",
                {
                    "rich_text": [{"type": "text", "text": {"content": body}}],
                    "language": code_lang or "plain text",
                },
            )
        )
        code_lines = []
        code_lang = ""

    while i < len(lines) and len(blocks) < max_blocks:
        line = lines[i]
        stripped = line.strip()

        if in_code:
            if stripped.startswith("```"):
                flush_code()
                in_code = False
            else:
                code_lines.append(line)
            i += 1
            continue

        if stripped.startswith("```"):
            flush_table()
            in_code = True
            code_lang = stripped[3:].strip() or "plain text"
            i += 1
            continue

        if stripped.startswith("|") and "|" in stripped[1:]:
            flush_code()
            table_lines.append(line)
            i += 1
            continue
        flush_table()

        if not stripped:
            i += 1
            continue

        if stripped in ("---", "***", "___"):
            flush_code()
            blocks.append(_block("divider", "divider", {}))
            i += 1
            continue

        if stripped.startswith("#"):
            flush_code()
            level = len(stripped) - len(stripped.lstrip("#"))
            title = stripped[level:].strip()
            htype = {1: "heading_1", 2: "heading_2", 3: "heading_3"}.get(level, "heading_3")
            blocks.append(_block(htype, htype, {"rich_text": rich_text(title)}))
            i += 1
            continue

        if stripped.startswith(">"):
            flush_code()
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote_lines.append(lines[i].strip().lstrip(">").strip())
                i += 1
            full_quote = " ".join(filter(None, quote_lines))
            alert_match = re.match(r"^\[!(NOTE|IMPORTANT|TIP|WARNING|CAUTION)\]\s*(.*)$", full_quote, re.IGNORECASE)
            if alert_match:
                kind, content = alert_match.group(1).upper(), alert_match.group(2)
                emoji_map = {
                    "NOTE": "📘",
                    "IMPORTANT": "⚠️",
                    "TIP": "💡",
                    "WARNING": "⚠️",
                    "CAUTION": "🚨",
                }
                blocks.append(_callout_block(content if content else kind, emoji_map.get(kind, "💡")))
            elif full_quote.startswith("**") or full_quote.startswith("🎯") or full_quote.startswith("📌") or full_quote.startswith("⚡"):
                blocks.append(_callout_block(full_quote, "📌"))
            else:
                blocks.append(_block("quote", "quote", {"rich_text": rich_text(full_quote)}))
            continue

        todo = re.match(r"^- \[([ xX])\] (.+)$", stripped)
        if todo:
            flush_code()
            checked = todo.group(1).lower() == "x"
            blocks.append(
                _block(
                    "to_do",
                    "to_do",
                    {"rich_text": rich_text(todo.group(2)), "checked": checked},
                )
            )
            i += 1
            continue

        if stripped.startswith("- ") or stripped.startswith("* "):
            flush_code()
            blocks.append(
                _block(
                    "bulleted_list_item",
                    "bulleted_list_item",
                    {"rich_text": rich_text(stripped[2:].strip())},
                )
            )
            i += 1
            continue

        num = re.match(r"^\d+\.\s+(.+)$", stripped)
        if num:
            flush_code()
            blocks.append(
                _block(
                    "numbered_list_item",
                    "numbered_list_item",
                    {"rich_text": rich_text(num.group(1))},
                )
            )
            i += 1
            continue

        flush_code()
        blocks.append(_block("paragraph", "paragraph", {"rich_text": rich_text(stripped)}))
        i += 1

    flush_table()
    flush_code()
    return blocks[:max_blocks]
