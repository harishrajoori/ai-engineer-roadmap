import React, { useCallback, useMemo } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const STORAGE_KEY = "ai_hub_course0_first_hour";

const STEPS = [
  {
    id: "overview",
    label: "Skim Course 0 overview (primer + walkthrough)",
    hint: "5–10 min — know where START HERE lives",
  },
  {
    id: "start_here",
    label: "Open START HERE — schemas & extraction topic",
    hint: "Read Foundations before the first video",
  },
  {
    id: "first_video",
    label: "Complete one required Watch or Read in Course 0",
    hint: "Mark complete when done",
  },
  {
    id: "portfolio",
    label: "Paste your public portfolio repo URL on the Prove dashboard",
    hint: "Synthetic data only",
  },
];

function readChecked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeChecked(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/**
 * Lightweight first-hour path for new learners (replaces full wizard).
 */
export default function Course0FirstHourChecklist({
  progressMap = {},
  portfolioRepoUrl = "",
  onStartCourse0,
  onOpenCourse0Overview,
}) {
  const [manual, setManual] = React.useState(() => readChecked());

  const auto = useMemo(() => {
    const course0Done = Object.keys(progressMap).some((k) => {
      const order = Number(k);
      return progressMap[k] && order >= 1 && order <= 20;
    });
    return {
      start_here: course0Done,
      first_video: course0Done,
      portfolio: Boolean((portfolioRepoUrl || "").trim()),
    };
  }, [progressMap, portfolioRepoUrl]);

  const isChecked = useCallback(
    (id) => Boolean(manual[id] || auto[id]),
    [manual, auto]
  );

  const toggle = (id) => {
    if (auto[id]) {
      return;
    }
    setManual((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writeChecked(next);
      return next;
    });
  };

  const doneCount = STEPS.filter((s) => isChecked(s.id)).length;

  return (
    <section className="course0-first-hour" aria-labelledby="course0-first-hour-heading">
      <div className="course0-first-hour-head">
        <Clock size={18} aria-hidden />
        <div>
          <h2 id="course0-first-hour-heading">Course 0 in your first hour</h2>
          <p className="course0-first-hour-lead">
            Four checkpoints — not another long doc. {doneCount}/{STEPS.length} done.
          </p>
        </div>
      </div>
      <ol className="course0-first-hour-list">
        {STEPS.map((step, index) => {
          const checked = isChecked(step.id);
          return (
            <li key={step.id} className={checked ? "is-done" : ""}>
              <button
                type="button"
                className="course0-first-hour-check"
                onClick={() => toggle(step.id)}
                aria-pressed={checked}
                aria-label={checked ? "Mark step incomplete" : "Mark step complete"}
              >
                {checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              <div className="course0-first-hour-body">
                <span className="course0-first-hour-step">Step {index + 1}</span>
                <span className="course0-first-hour-label">{step.label}</span>
                <span className="course0-first-hour-hint">{step.hint}</span>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="course0-first-hour-actions">
        <button type="button" className="home-cta home-cta-primary" onClick={onStartCourse0}>
          Start Course 0
        </button>
        <button type="button" className="home-cta home-cta-secondary" onClick={onOpenCourse0Overview}>
          Course 0 overview
        </button>
      </div>
    </section>
  );
}
