"""Curated handbook rows keyed by lesson `order` (1–141). Loaded from data/topic_handbook.json."""

from __future__ import annotations

import json
from pathlib import Path

_REPO = Path(__file__).resolve().parents[2]
_JSON_PATH = _REPO / "data" / "topic_handbook.json"


def _load() -> dict[int, dict]:
    if not _JSON_PATH.exists():
        return {}
    raw = json.loads(_JSON_PATH.read_text(encoding="utf-8"))
    return {int(k): v for k, v in raw.items()}


HANDBOOK_BY_ORDER: dict[int, dict] = _load()
