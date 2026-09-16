import React, { useMemo } from "react";
import HomeAuthPanel from "./HomeAuthPanel";
import MarkdownProse from "./MarkdownProse";
import NextActionCard from "./NextActionCard";
import ProveDashboard from "./ProveDashboard";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GitBranch,
  Layers,
  LayoutGrid,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

const VALUE_ICONS = [ShieldCheck, Layers, Workflow, Target];

const DEFAULT_VALUE_PROPS = [
  {
    title: "Engineering discipline first",
    body: "Schemas, golden sets, and merge gates—not prompt hacks.",
  },
  {
    title: "One platform spine",
    body: "Sixteen courses extend a single capstone repository.",
  },
  {
    title: "Theory before lecture",
    body: "Foundations on every topic, then the primary video or doc.",
  },
  {
    title: "Prove what you ship",
    body: "Verifiable artifacts at every course boundary.",
  },
];

const DEFAULT_LADDER = [
  { courses: "0–1", title: "Contracts & gateway", outcome: "Extraction + gateway metering" },
  { courses: "2–3", title: "Orchestration & tools", outcome: "LangGraph + MCP audit" },
  { courses: "4–6", title: "Knowledge layer", outcome: "RAG benchmarks + chunks" },
  { courses: "7–9", title: "Trust layer", outcome: "Eval CI + policy + traces" },
  { courses: "10–12", title: "Ship", outcome: "Alpha → deploy → v1.0" },
  { courses: "13–15", title: "Electives", outcome: "Frontier + narrative" },
];

/**
 * Program landing — senior data/platform engineers entering AI platform depth.
 */
export default function HomeStage({
  courses = [],
  coursesRef = {},
  totalCount = 0,
  completedCount = 0,
  progressPct = 0,
  programWalkthrough = {},
  programBriefMarkdown = "",
  onBeginStepOne,
  onOpenCourseOverview,
  onOpenCourse,
  onContinueLesson,
  resumeLabel = "",
  userProfile = null,
  googleOAuthEnabled = false,
  cloudSyncConfigured = false,
  cloudSyncStatus = "idle",
  onGoogleLogin,
  onGoogleLogout,
  onGoogleAuthError,
  googleAuthError = "",
  onOpenSettings,
  nextAction = null,
  proveChecklistMap = {},
  portfolioRepoUrl = "",
  onPortfolioRepoChange,
  onOpenLessonFromHome,
}) {
  const hasProgress = completedCount > 0;
  const phases = programWalkthrough.phases || [];

  const headline = programWalkthrough.home_headline || "Master AI platform engineering.";
  const subhead =
    programWalkthrough.home_subhead ||
    "Build production LLM platforms with the same rigor you apply to data pipelines and distributed services.";
  const valueProps = programWalkthrough.home_value_props?.length
    ? programWalkthrough.home_value_props
    : DEFAULT_VALUE_PROPS;
  const artifactLadder = programWalkthrough.home_artifact_ladder?.length
    ? programWalkthrough.home_artifact_ladder
    : DEFAULT_LADDER;
  const workflowSteps = programWalkthrough.home_workflow?.length
    ? programWalkthrough.home_workflow
    : (programWalkthrough.first_three_clicks || []).map((line, i) => ({
        title: `Step ${i + 1}`,
        detail: line.replace(/\*\*/g, ""),
      }));

  const courseMap = useMemo(() => {
    return courses
      .slice()
      .sort((a, b) => a.course - b.course)
      .map((c) => {
        const ref = coursesRef[String(c.course)] || coursesRef[c.course] || {};
        return {
          num: c.course,
          title: ref.walkthrough?.plain_title || c.title,
          tier: c.tier,
        };
      });
  }, [courses, coursesRef]);

  return (
    <div className="home-stage">
      <div className="home-stage-inner home-stage-wide">
        <section className="home-hero-mega" aria-label="Program introduction">
          <p className="home-eyebrow">
            <Sparkles size={14} aria-hidden />
            {programWalkthrough.audience || "Senior data & platform engineers"}
          </p>
          <h1 className="home-hero-title">{headline}</h1>
          <p className="home-hero-sub">{subhead}</p>

          <div className="home-stat-row home-hero-stats" aria-label="Program scale">
            <div className="home-stat">
              <span className="home-stat-value">16</span>
              <span className="home-stat-label">Courses</span>
            </div>
            <div className="home-stat">
              <span className="home-stat-value">{totalCount || "141"}</span>
              <span className="home-stat-label">Topics</span>
            </div>
            <div className="home-stat">
              <span className="home-stat-value">1</span>
              <span className="home-stat-label">Capstone repo</span>
            </div>
            {hasProgress && (
              <div className="home-stat">
                <span className="home-stat-value">{progressPct}%</span>
                <span className="home-stat-label">Your progress</span>
              </div>
            )}
          </div>

          <div className="home-hero-cta">
            <button type="button" className="home-cta home-cta-hero home-cta-primary" onClick={onBeginStepOne}>
              <PlayCircle size={22} aria-hidden />
              Start Course 0
            </button>
            {programBriefMarkdown && (
              <a className="home-cta home-cta-hero home-cta-secondary" href="#program-brief">
                <BookOpen size={20} aria-hidden />
                Read program brief
              </a>
            )}
            <button type="button" className="home-cta home-cta-hero home-cta-ghost" onClick={onOpenCourseOverview}>
              Course 0 overview
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>

          {hasProgress && onContinueLesson && (
            <button type="button" className="home-continue-link" onClick={onContinueLesson}>
              <CheckCircle2 size={16} aria-hidden />
              Continue where you left off
              {resumeLabel ? ` · ${resumeLabel}` : ""}
            </button>
          )}
        </section>

        <NextActionCard
          action={nextAction}
          onOpenLesson={onOpenLessonFromHome}
          onOpenCourse={onOpenCourse}
        />

        <ProveDashboard
          coursesRef={coursesRef}
          proveChecklistMap={proveChecklistMap}
          portfolioRepoUrl={portfolioRepoUrl}
          onPortfolioRepoChange={onPortfolioRepoChange}
          onOpenCourse={onOpenCourse}
        />

        <section className="home-value-section" aria-labelledby="home-value-heading">
          <h2 id="home-value-heading" className="home-section-title">Why this studio</h2>
          <div className="home-value-grid">
            {valueProps.map((item, index) => {
              const Icon = VALUE_ICONS[index % VALUE_ICONS.length];
              return (
                <article key={item.title} className="home-value-card">
                  <div className="home-value-icon" aria-hidden>
                    <Icon size={22} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-roadmap-section" aria-labelledby="home-roadmap-heading">
          <h2 id="home-roadmap-heading" className="home-section-title">
            <GitBranch size={22} aria-hidden />
            What you build
          </h2>
          <p className="home-section-lead">
            One repository, sixteen increments. Each row is a prove-ready capability—not a video playlist.
          </p>
          <div className="home-artifact-grid">
            {artifactLadder.map((row) => (
              <article key={row.courses} className="home-artifact-card">
                <span className="home-artifact-courses">Courses {row.courses}</span>
                <h3>{row.title}</h3>
                <p>{row.outcome}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-workflow-section" aria-labelledby="home-workflow-heading">
          <h2 id="home-workflow-heading" className="home-section-title">How to use the studio</h2>
          <ol className="home-workflow-list">
            {workflowSteps.map((step, i) => (
              <li key={step.title || i}>
                <span className="home-step-num">{i + 1}</span>
                <div>
                  <strong>{step.title || `Step ${i + 1}`}</strong>
                  <p>{step.detail || step}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {phases.length > 0 && (
          <section className="home-paths" aria-labelledby="home-phases">
            <h2 id="home-phases" className="home-section-title">Four phases</h2>
            <div className="home-phase-list home-phase-list-grid">
              {phases.map((phase) => (
                <article key={phase.id} className="home-phase-card">
                  <h3>{phase.label}</h3>
                  <p>{phase.plain}</p>
                  <p className="home-phase-courses">
                    Courses {phase.courses[0]}
                    {phase.courses.length > 1 ? `–${phase.courses[phase.courses.length - 1]}` : ""}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <HomeAuthPanel
          userProfile={userProfile}
          googleOAuthEnabled={googleOAuthEnabled}
          cloudSyncConfigured={cloudSyncConfigured}
          cloudSyncStatus={cloudSyncStatus}
          onGoogleLogin={onGoogleLogin}
          onGoogleLogout={onGoogleLogout}
          onGoogleAuthError={onGoogleAuthError}
          googleAuthError={googleAuthError}
          onOpenSettings={onOpenSettings}
        />

        <section className="home-program-map" aria-labelledby="home-map-heading">
          <h2 id="home-map-heading" className="home-section-title">
            <LayoutGrid size={22} aria-hidden />
            Course index
          </h2>
          <p className="home-section-lead">Open a course overview, then start at the topic marked START HERE.</p>
          <ul className="home-course-map-list">
            {courseMap.map((row) => (
              <li key={row.num}>
                <button type="button" className="home-course-map-btn" onClick={() => onOpenCourse?.(row.num)}>
                  <span className="home-course-map-num">Course {row.num}</span>
                  <span className="home-course-map-title">{row.title}</span>
                  <span className={`home-path-tag tag-${row.tier.toLowerCase()}`}>{row.tier}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {programBriefMarkdown && (
          <section id="program-brief" className="home-program-brief" aria-labelledby="program-brief-heading">
            <details className="home-brief-details">
              <summary className="home-brief-summary">
                <h2 id="program-brief-heading">Full program brief</h2>
                <span className="home-brief-summary-hint">Architecture, pacing, glossary, success criteria</span>
              </summary>
              <div className="home-program-brief-body prose-learning">
                <MarkdownProse>{programBriefMarkdown}</MarkdownProse>
              </div>
            </details>
          </section>
        )}

        <p className="home-footer-note">
          {totalCount} topics · theory-first on every row · public or synthetic data in your portfolio repo
        </p>
      </div>
    </div>
  );
}
