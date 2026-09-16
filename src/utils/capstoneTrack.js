/** Course 10 scope labels (mirrors scripts/capstone_track.py). */

export const CAPSTONE_TRACK_META = {
  wire: {
    label: "Wire",
    subtitle: "Integration",
    className: "capstone-track-wire",
    title: "Connect existing modules—no new frameworks",
  },
  caching: {
    label: "Caching",
    subtitle: "New evidence",
    className: "capstone-track-caching",
    title: "Prompt caching metrics for the alpha prove gate",
  },
  reference: {
    label: "Reference",
    subtitle: "Skim",
    className: "capstone-track-reference",
    title: "Revisit docs/video—safe to skip if time-boxed",
  },
  demo: {
    label: "Demo",
    subtitle: "Prove",
    className: "capstone-track-demo",
    title: "Tag alpha + one-command demo script",
  },
  defer: {
    label: "Defer",
    subtitle: "Optional",
    className: "capstone-track-defer",
    title: "Phase 2—do not block alpha",
  },
};

/**
 * @param {string | undefined} track
 */
export function capstoneTrackBadge(track) {
  if (!track) {
    return null;
  }
  return CAPSTONE_TRACK_META[track] || null;
}
