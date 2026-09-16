"""Optional platform-extension callouts (Astra path) for advanced theory."""

from __future__ import annotations

from typing import Any

_EXTENSION_BY_COURSE: dict[int, str] = {
    9: (
        "**Platform extension (optional):** After core prove gates, add **multi-tenant gateway metadata** "
        "(per-app budgets and model allowlists), **FinOps showback** fields on every trace, and **policy audit "
        "events** on deny—not only HTTP errors. See program brief § platform extension checklist."
    ),
    10: (
        "**Platform extension (optional):** Capstone integration is the right place to document **SLOs** "
        "(latency, eval pass rate, fallback rate) and **failure injection** notes—what happens when the gateway "
        "throttles or MCP is denied. Second-app onboarding should reuse this `alpha` stack, not fork internals."
    ),
    11: (
        "**Platform extension (optional):** Treat deploy as **IaC + pipeline**: PR updates chart/compose, CI runs "
        "eval/policy smoke, and `DEPLOY.md` includes rollback. Extension proves: multi-tenant routes, secrets "
        "rotation without redeploy, and a minimal **second service** on the shared gateway template."
    ),
}


def platform_extension_callout(lesson: dict[str, Any]) -> str | None:
    """Short markdown block for courses 9–11 advanced theory; None if not applicable."""
    try:
        course = int(lesson.get("course"))
    except (TypeError, ValueError):
        return None
    return _EXTENSION_BY_COURSE.get(course)
