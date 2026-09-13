#!/usr/bin/env python3
"""Validate curriculum docs, HTTP links, and app data consistency."""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DOCS = REPO_ROOT / "docs"
TRACK = DOCS / "AI_System_Engineer_Learning_Track_2027.md"
LESSONS_JSON = REPO_ROOT / "data" / "lessons.json"
LESSONS_JS = REPO_ROOT / "src" / "data" / "lessonsData.js"

LINK_RE = re.compile(r"\[([^\]]*)\]\(([^)]+)\)")
URL_RE = re.compile(r"https?://[^\s\]|)>\"']+")
CHECKBOX_LINK = re.compile(r"^- \[ \] (\(optional\) )?\[([^\]]+)\]\(([^)]+)\)")

# Sites that block bots — treat non-403 failures only as errors
SOFT_FAIL_HOSTS = {
    "www.coursera.org",
    "coursera.org",
    "www.deeplearning.ai",
    "deeplearning.ai",
    "www.youtube.com",
    "youtube.com",
    "youtu.be",
    "www.linkedin.com",
    "linkedin.com",
    "x.com",
    "twitter.com",
    "openai.com",
    "www.openai.com",
    "localhost",
    "127.0.0.1",
}


def extract_http_urls_from_text(text: str) -> set[str]:
    urls = set(URL_RE.findall(text))
    for _label, url in LINK_RE.findall(text):
        url = url.strip()
        if url.startswith("http"):
            urls.add(url.rstrip(")"))
    return urls


def load_lessons() -> list[dict]:
    if not LESSONS_JSON.exists():
        raise SystemExit(f"Missing {LESSONS_JSON} — run npm run curriculum")
    data = json.loads(LESSONS_JSON.read_text(encoding="utf-8"))
    return data.get("lessons", [])


def lesson_urls(lessons: list[dict]) -> set[str]:
    urls: set[str] = set()
    for les in lessons:
        u = (les.get("url") or "").strip()
        if u.startswith("http"):
            urls.add(u)
        for r in les.get("resources") or []:
            ru = (r.get("url") or "").strip()
            if ru.startswith("http"):
                urls.add(ru)
    return urls


def track_checkbox_urls() -> set[str]:
    text = TRACK.read_text(encoding="utf-8")
    urls: set[str] = set()
    for line in text.splitlines():
        m = CHECKBOX_LINK.match(line.strip())
        if m:
            urls.add(m.group(3).strip())
    return urls


def check_url(url: str, timeout: float) -> tuple[str, str | None]:
    """Return (url, error_message or None)."""
    from urllib.parse import urlparse

    parsed = urlparse(url)
    host = (parsed.hostname or parsed.netloc).lower()
    req = urllib.request.Request(
        url,
        method="HEAD",
        headers={"User-Agent": "ai-engineer-roadmap-validate/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status >= 400:
                return url, f"HTTP {resp.status}"
        return url, None
    except urllib.error.HTTPError as e:
        if e.code in (403, 405, 429) and host in SOFT_FAIL_HOSTS:
            return url, None
        if e.code == 405:
            # Some servers disallow HEAD
            try:
                req_get = urllib.request.Request(
                    url,
                    method="GET",
                    headers={"User-Agent": "ai-engineer-roadmap-validate/1.0"},
                )
                with urllib.request.urlopen(req_get, timeout=timeout) as resp:
                    if resp.status >= 400:
                        return url, f"HTTP {resp.status}"
                return url, None
            except Exception as exc:  # noqa: BLE001
                return url, str(exc)
        if e.code == 403 and host in SOFT_FAIL_HOSTS:
            return url, None
        return url, f"HTTP {e.code}"
    except Exception as exc:  # noqa: BLE001
        if host in SOFT_FAIL_HOSTS:
            return url, None
        return url, str(exc)


def validate_app_data(lessons: list[dict]) -> list[str]:
    errors: list[str] = []
    if not lessons:
        errors.append("lessons.json is empty")
        return errors

    orders = [l.get("order") for l in lessons]
    if len(orders) != len(set(orders)):
        errors.append("Duplicate lesson order ids in lessons.json")

    courses = sorted({l.get("course") for l in lessons})
    if courses != list(range(min(courses), max(courses) + 1)):
        errors.append(f"Non-contiguous course numbers: {courses}")

    for les in lessons:
        if les.get("type") == "Video":
            url = les.get("url") or ""
            open_how = les.get("open_how") or ""
            has_vid = bool(les.get("youtube_id")) or "youtube.com" in url or "youtu.be" in url
            external_ok = any(
                x in url or x in open_how
                for x in ("deeplearning.ai", "coursera.org", "DL.AI", "Coursera", "Embed / YouTube")
            )
            if not has_vid and not external_ok:
                errors.append(f"Video lesson missing play target: order={les.get('order')} {les.get('lesson')}")

    if not LESSONS_JS.exists():
        errors.append(f"Missing {LESSONS_JS}")
    else:
        js = LESSONS_JS.read_text(encoding="utf-8")
        if "export const LESSONS_DATA" not in js:
            errors.append("lessonsData.js missing LESSONS_DATA export")
        if "export const COURSES_REF_DATA" not in js:
            errors.append("lessonsData.js missing COURSES_REF_DATA export")

    return errors


def validate_track_vs_lessons(lessons: list[dict]) -> list[str]:
    warnings: list[str] = []
    track_urls = track_checkbox_urls()
    app_primary = {(l.get("url") or "").strip() for l in lessons if (l.get("url") or "").startswith("http")}
    missing_in_app = sorted(track_urls - app_primary)
    extra_in_app = sorted(app_primary - track_urls)

    # Spine / generated rows may add URLs not in checkbox form
    if len(missing_in_app) > 15:
        warnings.append(f"{len(missing_in_app)} track checkbox URLs not found as primary lesson URLs (first 5): {missing_in_app[:5]}")
    elif missing_in_app:
        warnings.append(f"Track URLs not in app primary url field: {missing_in_app[:10]}")

    if len(extra_in_app) > 30:
        warnings.append(f"{len(extra_in_app)} app lesson URLs not from track checkboxes (spine/enrichment ok)")
    return warnings


def collect_all_urls(lessons: list[dict]) -> set[str]:
    urls: set[str] = set()
    for path in DOCS.glob("*.md"):
        urls |= extract_http_urls_from_text(path.read_text(encoding="utf-8"))
    urls |= lesson_urls(lessons)
    return urls


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-http", action="store_true", help="Skip network link checks")
    parser.add_argument("--timeout", type=float, default=12.0)
    parser.add_argument("--workers", type=int, default=12)
    args = parser.parse_args()

    failures: list[str] = []
    warnings: list[str] = []

    if not TRACK.exists():
        failures.append(f"Missing track: {TRACK}")

    master = DOCS / "AI_System_Engineer_Master_Plan.md"
    if not master.exists():
        failures.append(f"Missing master plan: {master}")

    lessons = load_lessons()
    failures.extend(validate_app_data(lessons))
    warnings.extend(validate_track_vs_lessons(lessons))

    rel_dead = []
    for path in DOCS.glob("*.md"):
        for _l, url in LINK_RE.findall(path.read_text(encoding="utf-8")):
            url = url.strip()
            if url.startswith("http") or url.startswith("#") or url.startswith("mailto:"):
                continue
            if url.startswith("./") or (url.endswith(".md") and not url.startswith("http")):
                target = (path.parent / url.removeprefix("./")).resolve()
                if not target.exists():
                    rel_dead.append(f"{path.name} → {url}")
    if rel_dead:
        failures.extend([f"Broken relative link: {x}" for x in rel_dead])

    urls = sorted(collect_all_urls(lessons))
    print(f"Lessons: {len(lessons)} | Unique HTTP URLs: {len(urls)}")

    if not args.skip_http:
        broken: list[str] = []
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures = {pool.submit(check_url, u, args.timeout): u for u in urls}
            for fut in as_completed(futures):
                url, err = fut.result()
                if err:
                    broken.append(f"{url} — {err}")
        if broken:
            failures.append(f"{len(broken)} broken HTTP URLs")
            for line in sorted(broken)[:25]:
                print(f"  FAIL {line}")
            if len(broken) > 25:
                print(f"  ... and {len(broken) - 25} more")

    for w in warnings:
        print(f"WARN {w}")

    if failures:
        print("\nVALIDATION FAILED:")
        for f in failures:
            print(f"  - {f}")
        return 1

    print("\nVALIDATION OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
