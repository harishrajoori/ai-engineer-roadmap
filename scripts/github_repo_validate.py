"""Validate GitHub repos have real code before they ship in curriculum resources."""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATH = REPO_ROOT / "data" / "implementation_repo_catalog.json"

_GITHUB_RE = re.compile(
    r"^https?://github\.com/(?P<owner>[^/]+)/(?P<repo>[^/]+)(?:/tree/(?P<branch>[^/]+)(?:/(?P<subpath>.+))?)?/?$",
    re.I,
)


@dataclass
class ParsedGitHub:
    owner: str
    repo: str
    branch: str | None
    subpath: str | None


def parse_github_url(url: str) -> ParsedGitHub | None:
    url = (url or "").strip().rstrip("/")
    m = _GITHUB_RE.match(url.split("?")[0])
    if not m:
        return None
    sub = m.group("subpath")
    if sub:
        sub = sub.rstrip("/")
    return ParsedGitHub(
        owner=m.group("owner"),
        repo=m.group("repo"),
        branch=m.group("branch"),
        subpath=sub or None,
    )


def _api_get(path: str) -> dict[str, Any] | list[Any] | None:
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN") or ""
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "ai-engineer-roadmap-validator",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"https://api.github.com{path}", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise


def validate_github_repo(url: str) -> dict[str, Any]:
    """Return validation dict with ok: bool and reasons."""
    parsed = parse_github_url(url)
    if not parsed:
        return {"ok": False, "reason": "not_a_github_url", "url": url}

    base = f"/repos/{parsed.owner}/{parsed.repo}"
    meta = _api_get(base)
    if not meta or not isinstance(meta, dict):
        return {"ok": False, "reason": "repo_not_found", "url": url}

    if meta.get("disabled"):
        return {"ok": False, "reason": "repo_disabled", "url": url}
    if meta.get("archived"):
        return {"ok": False, "reason": "archived", "url": url}

    size_kb = int(meta.get("size") or 0)
    if size_kb < 5:
        return {"ok": False, "reason": "repo_too_small", "size_kb": size_kb, "url": url}

    languages = _api_get(f"{base}/languages")
    lang_keys = list(languages.keys()) if isinstance(languages, dict) else []
    code_langs = {k for k in lang_keys if k.lower() not in {"markdown", "json", "yaml"}}
    if not code_langs and size_kb < 50:
        return {"ok": False, "reason": "no_code_languages", "languages": lang_keys, "url": url}

    subpath_ok = True
    if parsed.subpath:
        branch = parsed.branch or meta.get("default_branch") or "main"
        enc_path = parsed.subpath.replace("/", "%2F")
        contents = _api_get(f"{base}/contents/{parsed.subpath}?ref={branch}")
        if contents is None:
            subpath_ok = False
        elif isinstance(contents, dict):
            subpath_ok = bool(contents.get("type") == "file" or contents.get("size", 0) > 0)
        elif isinstance(contents, list):
            subpath_ok = len(contents) > 0

    return {
        "ok": subpath_ok,
        "reason": "ok" if subpath_ok else "subpath_missing_or_empty",
        "url": url,
        "full_name": meta.get("full_name"),
        "stars": meta.get("stargazers_count"),
        "size_kb": size_kb,
        "languages": lang_keys[:8],
        "default_branch": meta.get("default_branch"),
        "pushed_at": meta.get("pushed_at"),
    }


def load_catalog() -> dict[str, Any]:
    if not CATALOG_PATH.exists():
        return {"schema_version": 1, "repos": []}
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def save_catalog(data: dict[str, Any]) -> None:
    CATALOG_PATH.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def validate_catalog(only_missing: bool = False, pause_s: float = 0.35) -> tuple[int, int]:
    data = load_catalog()
    repos = data.get("repos") or []
    ok_count = 0
    fail_count = 0
    for entry in repos:
        if not isinstance(entry, dict):
            continue
        if only_missing and entry.get("github_validation", {}).get("ok"):
            ok_count += 1
            continue
        url = (entry.get("url") or "").strip()
        if not url:
            continue
        try:
            result = validate_github_repo(url)
        except urllib.error.HTTPError as exc:
            result = {"ok": False, "reason": f"http_{exc.code}", "url": url}
        except Exception as exc:  # noqa: BLE001 — validator surfaces all failures
            result = {"ok": False, "reason": str(exc)[:120], "url": url}
        entry["github_validation"] = result
        if result.get("ok"):
            ok_count += 1
        else:
            fail_count += 1
        time.sleep(pause_s)
    save_catalog(data)
    return ok_count, fail_count


def check_catalog() -> list[str]:
    """CI: every repo must have github_validation.ok true."""
    data = load_catalog()
    errors: list[str] = []
    for entry in data.get("repos") or []:
        title = entry.get("title") or entry.get("id") or "?"
        val = entry.get("github_validation") or {}
        if not val.get("ok"):
            errors.append(f"{title}: missing or failed validation ({val.get('reason', 'none')})")
    return errors


def main() -> int:
    args = sys.argv[1:]
    if "--check" in args:
        errs = check_catalog()
        if errs:
            for e in errs:
                print(e, file=sys.stderr)
            return 1
        print(f"implementation_repo_catalog OK ({len(load_catalog().get('repos') or [])} repos)")
        return 0
    only_missing = "--only-missing" in args
    ok, fail = validate_catalog(only_missing=only_missing)
    print(f"Validated: {ok} ok, {fail} failed → {CATALOG_PATH}")
    if fail:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
