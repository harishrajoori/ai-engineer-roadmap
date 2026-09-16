import React from "react";
import { capstoneTrackBadge } from "../utils/capstoneTrack";

/**
 * Course 10 scope legend (integration vs caching vs reference).
 */
export default function CapstoneScopeLegend({ capstoneScope }) {
  const legend = capstoneScope?.legend;
  const counts = capstoneScope?.counts || {};
  if (!legend?.length) {
    return null;
  }

  return (
    <section className="course-overview-block capstone-scope-legend" aria-label="Course 10 scope buckets">
      <h2>How to read these 20 topics</h2>
      <p className="course-overview-hint">
        Most rows are <strong>Wire</strong> (integration). Only <strong>Caching</strong> and the final{" "}
        <strong>Demo</strong> prove need fresh evidence—do not treat every row as a new skill month.
      </p>
      <ul className="capstone-scope-list">
        {legend.map((row) => {
          const meta = capstoneTrackBadge(row.track);
          const count = counts[row.track] ?? 0;
          if (!count) {
            return null;
          }
          return (
            <li key={row.track} className="capstone-scope-item">
              <span className={`capstone-track-pill ${meta?.className || ""}`} title={row.hint}>
                {row.label}
                <span className="capstone-track-pill-sub">{row.subtitle}</span>
              </span>
              <span className="capstone-scope-count">{count} topic{count === 1 ? "" : "s"}</span>
              <span className="capstone-scope-hint">{row.hint}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
