/**
 * Topic-scoped implementation repos (validated catalog), not the global portfolio hub.
 */

const GENERIC_REPO_IDS = new Set(["patchy-hub", "ai-engineering-from-scratch"]);

/**
 * @param {object} lesson
 * @param {{ max?: number, includeGeneric?: boolean }} [opts]
 */
export function getTopicImplementationResources(lesson, opts = {}) {
  const max = opts.max ?? 4;
  const includeGeneric = opts.includeGeneric ?? false;

  const rows = (lesson?.resources || []).filter((r) => (r.type || "").toLowerCase() === "implementation");

  const scored = rows
    .map((r) => ({
      ...r,
      matchScore: typeof r.match_score === "number" ? r.match_score : 0,
    }))
    .filter((r) => {
      const source = r.source || "";
      const id = r.repo_id || "";
      if (source === "topic_order_override" && r.matchScore >= 6) {
        return true;
      }
      if (source === "verified_repo_catalog" && r.matchScore < 6) {
        return false;
      }
      if (includeGeneric) {
        return true;
      }
      if (GENERIC_REPO_IDS.has(id) && r.matchScore < 12) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, max);
}
