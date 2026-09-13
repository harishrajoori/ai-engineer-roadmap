import React from "react";
import {
  CheckSquare,
  ClipboardCopy,
  Code2,
  Download,
  ExternalLink,
  Factory,
  ShieldCheck,
  Square,
} from "lucide-react";
import {
  buildProveWorksheetMarkdown,
  downloadTextFile,
  isChecklistItemChecked,
  requiredChecklistProgress,
  toggleChecklistItem,
} from "../utils/proveWorkflow";

/**
 * End-to-end Lab & Prove helper: scenario, rubric checklist, portfolio + artifact URLs.
 */
export default function LabProvePanel({
  lesson,
  courseRef = {},
  proveUrl = "",
  onSaveProveUrl,
  portfolioRepoUrl = "",
  onSavePortfolioRepoUrl,
  proveChecklistMap = {},
  onProveChecklistChange,
}) {
  if (!lesson) {
    return null;
  }

  const courseId = lesson.course;
  const provePack = courseRef.prove_pack || {};
  const realWorld = courseRef.real_world || {};
  const acceptance = provePack.acceptance || [];
  const progress = requiredChecklistProgress(acceptance, proveChecklistMap, courseId);

  const topicBlurb =
    lesson.prove_criteria ||
    (lesson.type === "Prove"
      ? "Submit proof of work (repo, notebook, benchmark, or dashboard) and link it below."
      : lesson.type === "Build"
        ? "Implement this build milestone in your portfolio repo, then link the PR, tag, or demo."
        : "Work toward the course prove gate in your portfolio repo as you progress—link evidence when you have it.");

  const handleCopy = async (text) => {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  const handleDownloadWorksheet = () => {
    const md = buildProveWorksheetMarkdown({
      lesson,
      courseRef,
      portfolioRepoUrl,
      proveUrl,
      checklistMap: proveChecklistMap,
    });
    const slug = String(lesson.lesson || "prove")
      .replace(/[^a-z0-9]+/gi, "-")
      .slice(0, 40);
    downloadTextFile(`prove-course-${courseId}-${slug}.md`, md);
  };

  return (
    <div className="lab-prove-panel">
      <div className="learning-lab-card">
        <Code2 size={28} className="learning-lab-icon" aria-hidden />
        <h3>Hands-on lab & prove gate</h3>
        <p className="lab-prove-topic-blurb">{topicBlurb}</p>
        {lesson.url && lesson.type === "Build" && (
          <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="learning-resource-link inline">
            <ExternalLink size={14} />
            Open build reference
          </a>
        )}
        <p className="learning-lab-hint">
          Run tests in <strong>your</strong> repo (e.g. pytest). This studio tracks checklist + links—it does not
          auto-grade.
        </p>
      </div>

      {realWorld.summary && (
        <section className="lab-prove-section" aria-labelledby="lab-real-world-heading">
          <h4 id="lab-real-world-heading" className="lab-prove-section-title">
            <Factory size={16} aria-hidden />
            Real-world use case
          </h4>
          <p className="lab-prove-body">{realWorld.summary}</p>
          {realWorld.maps_to_prove && (
            <p className="lab-prove-muted">
              <strong>Prove gate:</strong> {realWorld.maps_to_prove}
            </p>
          )}
          {realWorld.practice_ladder?.length > 0 && (
            <ol className="lab-prove-ladder">
              {realWorld.practice_ladder.map((step) => (
                <li key={step.step ?? step.name}>
                  <span className="lab-prove-ladder-name">{step.name}</span>
                  <span>{step.action}</span>
                  <span className="lab-prove-muted">
                    <strong>Exit:</strong> {step.exit}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {acceptance.length > 0 && (
        <section className="lab-prove-section" aria-labelledby="lab-checklist-heading">
          <div className="lab-prove-section-head">
            <h4 id="lab-checklist-heading" className="lab-prove-section-title">
              <ShieldCheck size={16} aria-hidden />
              {provePack.title || "Course acceptance checklist"}
            </h4>
            {progress.total > 0 && (
              <span className="lab-prove-progress">
                Required: {progress.done}/{progress.total}
              </span>
            )}
          </div>
          <ul className="lab-prove-checklist">
            {acceptance.map((row, index) => {
              const checked = isChecklistItemChecked(proveChecklistMap, courseId, index);
              return (
                <li key={index}>
                  <button
                    type="button"
                    className={`lab-prove-check-row ${checked ? "is-checked" : ""}`}
                    onClick={() =>
                      onProveChecklistChange?.(toggleChecklistItem(proveChecklistMap, courseId, index))
                    }
                  >
                    {checked ? <CheckSquare size={18} /> : <Square size={18} />}
                    <span>
                      {row.criterion}
                      {!row.required && <em className="lab-prove-optional"> (optional)</em>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="lab-prove-section" aria-labelledby="lab-links-heading">
        <h4 id="lab-links-heading" className="lab-prove-section-title">Your evidence</h4>

        {onSavePortfolioRepoUrl && (
          <div className="learning-prove-form">
            <label htmlFor="portfolio-repo-input">Portfolio repo (one GitHub repo for the whole program)</label>
            <input
              id="portfolio-repo-input"
              type="url"
              className="chat-input"
              placeholder="https://github.com/you/ai-systems-capstone"
              value={portfolioRepoUrl}
              onChange={(e) => onSavePortfolioRepoUrl(e.target.value.trim())}
            />
            {portfolioRepoUrl && (
              <a
                href={portfolioRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="learning-resource-link"
              >
                <ExternalLink size={14} />
                Open portfolio repo
              </a>
            )}
          </div>
        )}

        {onSaveProveUrl && (
          <div className="learning-prove-form">
            <label htmlFor="prove-url-input">
              Milestone link for this topic (PR, release, Colab, demo)
            </label>
            <input
              id="prove-url-input"
              type="url"
              className="chat-input"
              placeholder="https://github.com/you/repo/releases/tag/v0.2"
              value={proveUrl}
              onChange={(e) => onSaveProveUrl(lesson.order, e.target.value.trim())}
            />
            {proveUrl && (
              <a href={proveUrl} target="_blank" rel="noopener noreferrer" className="learning-resource-link">
                <ExternalLink size={14} />
                Open milestone artifact
              </a>
            )}
          </div>
        )}
      </section>

      {(provePack.commands?.length > 0 || provePack.readme_example) && (
        <section className="lab-prove-section" aria-labelledby="lab-artifacts-heading">
          <h4 id="lab-artifacts-heading" className="lab-prove-section-title">README & commands</h4>
          {provePack.commands?.map((cmd) => (
            <div key={cmd} className="lab-prove-copy-row">
              <code className="lab-prove-cmd">{cmd}</code>
              <button
                type="button"
                className="filter-btn"
                onClick={() => handleCopy(cmd)}
                title="Copy command"
              >
                <ClipboardCopy size={12} />
              </button>
            </div>
          ))}
          {provePack.readme_example && (
            <details className="prove-pack-example lab-prove-readme-details">
              <summary>Example README table/snippet</summary>
              <pre>{provePack.readme_example}</pre>
              <button
                type="button"
                className="filter-btn"
                onClick={() => handleCopy(provePack.readme_example)}
              >
                <ClipboardCopy size={12} />
                Copy snippet
              </button>
            </details>
          )}
        </section>
      )}

      <div className="lab-prove-actions">
        <button type="button" className="filter-btn" onClick={handleDownloadWorksheet}>
          <Download size={14} />
          Download prove worksheet
        </button>
      </div>
    </div>
  );
}
