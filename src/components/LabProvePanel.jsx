import React from "react";
import {
  CheckSquare,
  ClipboardCopy,
  Code2,
  Download,
  ExternalLink,
  Factory,
  ListOrdered,
  ShieldCheck,
  Square,
} from "lucide-react";
import MarkdownProse from "./MarkdownProse";
import {
  buildProveWorksheetMarkdown,
  downloadTextFile,
  isChecklistItemChecked,
  requiredChecklistProgress,
  toggleChecklistItem,
} from "../utils/proveWorkflow";
import { getTopicImplementationResources } from "../utils/implementationResources";

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
  portfolioStarter = null,
}) {
  if (!lesson) {
    return null;
  }

  const courseId = lesson.course;
  const provePack = courseRef.prove_pack || {};
  const realWorld = courseRef.real_world || {};
  const labPlan = lesson.lab_plan || null;
  const deLab = labPlan?.de_lab || null;
  const topicImplRepos = getTopicImplementationResources(lesson, { max: 4 });
  const showPortfolioStarter = Boolean(portfolioStarter?.repo_url && lesson.is_start_here);
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

      {labPlan?.lab_practice?.markdown && (
        <section className="lab-prove-section lab-prove-lab-practice" aria-labelledby="lab-practice-heading">
          <h4 id="lab-practice-heading" className="lab-prove-section-title">
            <Code2 size={16} aria-hidden />
            {labPlan.lab_practice.title || "Lab & Practice"}
          </h4>
          <div className="lab-prove-scenario-prose">
            <MarkdownProse math>{labPlan.lab_practice.markdown}</MarkdownProse>
          </div>
        </section>
      )}

      {deLab?.scenario_markdown && (
        <section className="lab-prove-section lab-prove-de-scenario" aria-labelledby="lab-de-scenario-heading">
          <h4 id="lab-de-scenario-heading" className="lab-prove-section-title">
            <Factory size={16} aria-hidden />
            {deLab.scenario_title || "Practical scenario (data engineering)"}
          </h4>
          <div className="lab-prove-scenario-prose">
            <MarkdownProse math>{deLab.scenario_markdown}</MarkdownProse>
          </div>
          {deLab.code_snippets?.length > 0 && (
            <div className="lab-prove-code-blocks">
              <p className="lab-prove-muted">
                <strong>Copy into your portfolio repo</strong> — adapt names/paths; keep synthetic data only.
              </p>
              {deLab.code_snippets.map((block) => (
                <div key={block.filename || block.title} className="lab-prove-code-card">
                  <div className="lab-prove-code-card-head">
                    <span className="lab-prove-code-title">{block.title}</span>
                    {block.filename && <code className="lab-prove-code-filename">{block.filename}</code>}
                    <button
                      type="button"
                      className="filter-btn lab-prove-code-copy"
                      onClick={() => handleCopy(block.code)}
                      title="Copy code"
                    >
                      <ClipboardCopy size={12} />
                      Copy
                    </button>
                  </div>
                  <pre className="lab-prove-code-pre">
                    <code>{block.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
          {realWorld.maps_to_prove && (
            <p className="lab-prove-muted lab-prove-prove-gate">
              <strong>Course prove gate:</strong> {realWorld.maps_to_prove}
            </p>
          )}
        </section>
      )}

      {topicImplRepos.length > 0 && (
        <section className="lab-prove-section lab-prove-topic-repos" aria-labelledby="lab-topic-repos-heading">
          <h4 id="lab-topic-repos-heading" className="lab-prove-section-title">
            Code for this topic
          </h4>
          <p className="lab-prove-muted">
            Validated implementation repos matched to this lesson (not your portfolio hub).
          </p>
          <ul className="lab-prove-impl-link-list">
            {topicImplRepos.map((repo) => (
              <li key={repo.url} className="lab-prove-topic-repo-card">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="learning-resource-link"
                >
                  <ExternalLink size={14} />
                  {repo.title}
                </a>
                {repo.description && <p className="lab-prove-body">{repo.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {labPlan?.steps?.length > 0 && (
        <section className="lab-prove-section" aria-labelledby="lab-impl-plan-heading">
          <h4 id="lab-impl-plan-heading" className="lab-prove-section-title">
            <ListOrdered size={16} aria-hidden />
            {labPlan.title || "Implementation plan"}
          </h4>
          {labPlan.done_when && (
            <p className="lab-prove-muted">
              <strong>Done when:</strong> {labPlan.done_when}
            </p>
          )}
          <ol className="lab-prove-impl-steps">
            {labPlan.steps.map((step) => (
              <li key={step.id || step.title} className="lab-prove-impl-step">
                <span className="lab-prove-impl-step-title">{step.title}</span>
                {step.detail && <p className="lab-prove-body">{step.detail}</p>}
                {step.bullets?.length > 0 && (
                  <ul className="lab-prove-impl-bullets">
                    {step.bullets.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
          {labPlan.implementation_links?.length > 0 && (
            <div className="lab-prove-impl-links">
              <p className="lab-prove-muted">
                <strong>Reference implementations</strong> (also under More resources):
              </p>
              <ul className="lab-prove-impl-link-list">
                {labPlan.implementation_links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="learning-resource-link"
                    >
                      <ExternalLink size={14} />
                      {link.title}
                    </a>
                    {link.description && (
                      <span className="lab-prove-muted"> — {link.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {labPlan.local_setup?.steps?.length > 0 && (
            <div className="lab-prove-local-setup">
              <p className="lab-prove-muted">
                <strong>Local workspace</strong> ({labPlan.local_setup.workspace || "~/ai-systems-lab"})
              </p>
              {labPlan.local_setup.prerequisites?.length > 0 && (
                <p className="lab-prove-body">
                  Prerequisites: {labPlan.local_setup.prerequisites.join(" · ")}
                </p>
              )}
              {labPlan.local_setup.reference_url && (
                <p className="lab-prove-muted">
                  Closest reference repo:{" "}
                  <a
                    href={labPlan.local_setup.reference_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="learning-resource-link inline"
                  >
                    {labPlan.local_setup.reference_repo || "Open repo"}
                  </a>
                </p>
              )}
              <ol className="lab-prove-local-steps">
                {labPlan.local_setup.steps.map((line, i) => (
                  <li key={i}>
                    <code className="lab-prove-cmd lab-prove-local-line">{line}</code>
                  </li>
                ))}
              </ol>
              {labPlan.local_setup.env_vars?.length > 0 && (
                <details className="prove-pack-example">
                  <summary>Environment variables (.env)</summary>
                  <pre>{labPlan.local_setup.env_vars.join("\n")}</pre>
                </details>
              )}
              {labPlan.local_setup.portfolio_note && (
                <p className="lab-prove-muted">{labPlan.local_setup.portfolio_note}</p>
              )}
            </div>
          )}

          <button
            type="button"
            className="filter-btn"
            onClick={() =>
              handleCopy(
                [
                  labPlan.title || "Implementation plan",
                  labPlan.done_when ? `Done when: ${labPlan.done_when}` : "",
                  "",
                  ...labPlan.steps.flatMap((step) => [
                    step.title,
                    step.detail || "",
                    ...(step.bullets || []).map((b) => `- ${b}`),
                    "",
                  ]),
                ]
                  .filter(Boolean)
                  .join("\n"),
              )
            }
          >
            <ClipboardCopy size={12} />
            Copy implementation plan
          </button>
        </section>
      )}

      {realWorld.summary && !deLab?.scenario_markdown && (
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

      {realWorld.where_it_applies?.length > 0 && (
        <section className="lab-prove-section" aria-labelledby="lab-de-areas-heading">
          <h4 id="lab-de-areas-heading" className="lab-prove-section-title">
            Where this shows up at work
          </h4>
          <ul className="lab-prove-de-areas">
            {realWorld.where_it_applies.map((row) => (
              <li key={row.area} className="lab-prove-de-area-card">
                <strong>{row.area}</strong>
                <p className="lab-prove-body">{row.example}</p>
                <p className="lab-prove-muted">
                  <strong>You build:</strong> {row.you_build}
                </p>
              </li>
            ))}
          </ul>
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

      {showPortfolioStarter && (
        <section className="lab-prove-section lab-prove-starter" aria-labelledby="lab-starter-heading">
          <h4 id="lab-starter-heading" className="lab-prove-section-title">
            {portfolioStarter.title || "Portfolio starter"}
          </h4>
          {portfolioStarter.description && (
            <p className="lab-prove-body">{portfolioStarter.description}</p>
          )}
          <div className="lab-prove-starter-links">
            <a
              href={portfolioStarter.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="learning-resource-link"
            >
              <ExternalLink size={14} />
              Reference hub repo
            </a>
            {portfolioStarter.roadmap_url && (
              <a
                href={portfolioStarter.roadmap_url}
                target="_blank"
                rel="noopener noreferrer"
                className="learning-resource-link"
              >
                <ExternalLink size={14} />
                Hub roadmap layout
              </a>
            )}
          </div>
          {portfolioStarter.suggested_name && (
            <p className="lab-prove-muted">
              Suggested repo name: <strong>{portfolioStarter.suggested_name}</strong> (public, synthetic data only)
            </p>
          )}
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
