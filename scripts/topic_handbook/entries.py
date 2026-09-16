"""Handbook rows: legacy order index + stable-key index (survives syllabus reorder)."""

from __future__ import annotations

import json
from pathlib import Path

_REPO = Path(__file__).resolve().parents[2]
_JSON_PATH = _REPO / "data" / "topic_handbook.json"
_KEY_PATH = _REPO / "data" / "topic_handbook_by_key.json"


def _load_order() -> dict[int, dict]:
    if not _JSON_PATH.exists():
        return {}
    raw = json.loads(_JSON_PATH.read_text(encoding="utf-8"))
    return {int(k): v for k, v in raw.items()}


def _load_by_key() -> dict[str, dict]:
    if not _KEY_PATH.exists():
        return {}
    return json.loads(_KEY_PATH.read_text(encoding="utf-8"))


HANDBOOK_BY_ORDER: dict[int, dict] = _load_order()
HANDBOOK_BY_KEY: dict[str, dict] = _load_by_key()
