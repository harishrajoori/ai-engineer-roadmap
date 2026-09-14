import React, { useMemo } from "react";
import HomeAuthPanel from "./HomeAuthPanel";
import MarkdownProse from "./MarkdownProse";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  LayoutGrid,
  PlayCircle,
  Sparkles,
} from "lucide-react";

/**
 * Program landing for learners new to AI (data-engineering background).
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
}) {
  const hasProgress = completedCount > 0;
  const phases = programWalkthrough.phases || [];

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
      <div className="home-stage-inner">
        <div className="home-hero">
          <p className="home-eyebrow">
            <Sparkles size={14} aria-hidden />
            {programWalkthrough.audience || "7+ YOE data/platform engineers → AI platform depth"}
          </p>
          <h1 className="home-title">AI platform engineering — for data &amp; platform engineers</h1>

          {programWalkthrough.what_is_platform && (
            <div className="home-llm-box home-platform-box">
              <h2 className="home-llm-title">What you are learning</h2>
              <p>{programWalkthrough.what_is_platform}</p>
            </div>
          )}

          {programWalkthrough.what_you_build_overall && (
            <p className="home-lead">{programWalkthrough.what_you_build_overall}</p>
          )}

          {programWalkthrough.what_is_llm && (
            <p className="home-llm-aside">{programWalkthrough.what_is_llm}</p>
          )}

          <div className="home-cta-row">
            {hasProgress && onContinueLesson && (
              <button type="button" className="home-cta home-cta-primary" onClick={onContinueLesson}>
                Continue where I left off
                <ArrowRight size={18} />
              </button>
            )}
            {programBriefMarkdown && (
              <a className="home-cta home-cta-secondary" href="#program-brief">
                <BookOpen size={18} />
                Read program brief
              </a>
            )}
            <button type="button" className="home-cta home-cta-primary" onClick={onBeginStepOne}>
              <PlayCircle size={18} />
              Start Course 0 — extraction boot
            </button>
            <button type="button" className="home-cta home-cta-secondary" onClick={onOpenCourseOverview}>
              <BookOpen size={18} />
              Course 0 overview map
            </button>
          </div>
          {hasProgress && resumeLabel && (
            <p className="home-resume-hint">
              <CheckCircle2 size={14} aria-hidden />
              {progressPct}% complete · next: {resumeLabel}
            </p>
          )}
        </div>

        {programBriefMarkdown && (
          <section id="program-brief" className="home-program-brief" aria-labelledby="program-brief-heading">
            <h2 id="program-brief-heading">Program brief</h2>
            <p className="course-overview-hint">
              Full map: platform scope, architecture, pacing, and what each course adds. Skim the TOC, then dive
              sections as needed.
            </p>
            <div className="home-program-brief-body prose-learning">
              <MarkdownProse>{programBriefMarkdown}</MarkdownProse>
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

        <section className="home-how" aria-labelledby="home-first-clicks">
          <h2 id="home-first-clicks">Your first three clicks</h2>
          <ol className="home-steps">
            {(programWalkthrough.first_three_clicks || []).map((line, i) => (
              <li key={i}>
                <span className="home-step-num">{i + 1}</span>
                <div className="home-step-body">
                  <MarkdownProse variant="inline">{line}</MarkdownProse>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {programWalkthrough.theory_first_rule && (
          <p className="home-theory-first-callout">{programWalkthrough.theory_first_rule}</p>
        )}

        <section className="home-how" aria-labelledby="home-every-topic">
          <h2 id="home-every-topic">On every topic, same order</h2>
          <ol className="home-steps home-steps-compact">
            {(programWalkthrough.every_topic_same_order || []).map((line, i) => (
              <li key={i}>
                <span className="home-step-num">{i + 1}</span>
                <div><p>{line}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="home-how" aria-labelledby="home-every-course">
          <h2 id="home-every-course">On every course, same order</h2>
          <ol className="home-steps home-steps-compact">
            {(programWalkthrough.every_course_same_order || []).map((line, i) => (
              <li key={i}>
                <span className="home-step-num">{i + 1}</span>
                <div><p>{line}</p></div>
              </li>
            ))}
          </ol>
        </section>

        {phases.length > 0 && (
          <section className="home-paths" aria-labelledby="home-phases">
            <h2 id="home-phases">
              <Compass size={20} aria-hidden />
              Four phases (16 courses)
            </h2>
            <div className="home-phase-list">
              {phases.map((phase) => (
                <div key={phase.id} className="home-phase-card">
                  <h3>{phase.label}</h3>
                  <p>{phase.plain}</p>
                  <p className="home-phase-courses">
                    Courses {phase.courses[0]}
                    {phase.courses.length > 1 ? `–${phase.courses[phase.courses.length - 1]}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="home-program-map" aria-labelledby="home-map-heading">
          <h2 id="home-map-heading">
            <LayoutGrid size={20} aria-hidden />
            Whole program at a glance
          </h2>
          <p className="course-overview-hint">
            Click a row to open that course overview, then press Open first topic on the guide.
          </p>
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

        {programWalkthrough.studio_panels_plain && (
          <section className="home-capstone home-panels-plain">
            <h2>What each part of the screen does</h2>
            <ul className="course-overview-list">
              {Object.entries(programWalkthrough.studio_panels_plain).map(([key, text]) => (
                <li key={key}>
                  <strong>{key === "left" ? "Left rail" : key === "middle" ? "Middle panel" : key === "center" ? "Center" : "Right panel"}:</strong>{" "}
                  {text}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="home-footer-note">
          {totalCount} topics total · work in order · Foundations theory is the default on every new topic
        </p>
      </div>
    </div>
  );
}
