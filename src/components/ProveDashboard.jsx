import React, { useMemo } from "react";
import { CheckCircle2, Circle, ExternalLink, Link2 } from "lucide-react";
import { buildProveDashboardRows } from "../utils/nextAction";
import {
  buildProgramPortfolioSummaryMarkdown,
  downloadTextFile,
  savePortfolioRepoUrl,
} from "../utils/proveWorkflow";

/**
 * Sixteen-course prove status board (artifact + checklist progress).
 */
export default function ProveDashboard({
  coursesRef = {},
  proveChecklistMap = {},
  portfolioRepoUrl = "",
  onPortfolioRepoChange,
  onOpenCourse,
  progressMap = {},
  lessons = [],
}) {
  const rows = useMemo(
    () => buildProveDashboardRows(coursesRef, proveChecklistMap, portfolioRepoUrl),
    [coursesRef, proveChecklistMap, portfolioRepoUrl]
  );

  const portfolioDone = rows.filter((r) => r.checklist.complete && r.checklist.total > 0).length;
  const portfolioTotal = rows.filter((r) => r.checklist.total > 0).length;

  return (
    <section id="prove-dashboard" className="home-prove-dashboard" aria-labelledby="prove-dashboard-heading">
      <div className="home-prove-dashboard-head">
        <h2 id="prove-dashboard-heading">Prove dashboard</h2>
        <p className="home-section-lead">
          Portfolio readiness by course. Check items in each course&apos;s <strong>Lab &amp; Prove</strong> tab; link
          your repo once.
        </p>
        <p className="home-prove-dashboard-summary">
          <strong>{portfolioDone}/{portfolioTotal}</strong> prove packs with required checklist complete
        </p>
      </div>

      <label className="home-prove-portfolio-field">
        <span className="home-prove-portfolio-label">
          <Link2 size={16} aria-hidden />
          Portfolio repo URL
        </span>
        <input
          type="url"
          className="home-prove-portfolio-input"
          placeholder="https://github.com/you/ai-platform-lab"
          value={portfolioRepoUrl}
          onChange={(e) => {
            const v = savePortfolioRepoUrl(e.target.value);
            onPortfolioRepoChange?.(v);
          }}
        />
      </label>

      <button
        type="button"
        className="home-cta home-cta-secondary home-prove-export-summary"
        onClick={() => {
          const md = buildProgramPortfolioSummaryMarkdown({
            coursesRef,
            proveChecklistMap,
            portfolioRepoUrl,
            progressMap,
            lessons,
          });
          downloadTextFile(`ai-systems-engineer-portfolio-summary-${new Date().toISOString().slice(0, 10)}.md`, md);
        }}
      >
        Download portfolio summary (Markdown)
      </button>

      <ul className="home-prove-dashboard-list">
        {rows.map((row) => {
          const pct =
            row.checklist.total > 0 ? Math.round((row.checklist.done / row.checklist.total) * 100) : null;
          const done = row.checklist.complete && row.checklist.total > 0;
          return (
            <li key={row.courseId}>
              <button
                type="button"
                className={`home-prove-dashboard-row ${done ? "is-done" : ""}`}
                onClick={() => onOpenCourse?.(row.courseId)}
              >
                <span className="home-prove-dashboard-course">Course {row.courseId}</span>
                <span className="home-prove-dashboard-title">{row.title}</span>
                <span className="home-prove-dashboard-prove">{row.proveTitle}</span>
                <span className="home-prove-dashboard-check" aria-label={done ? "Checklist complete" : "In progress"}>
                  {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  {row.checklist.total > 0 ? `${row.checklist.done}/${row.checklist.total}` : "—"}
                  {pct != null ? ` (${pct}%)` : ""}
                </span>
                <ExternalLink size={14} className="home-prove-dashboard-chevron" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
