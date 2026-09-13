import React, { useState } from "react";
import MarkdownProse from "./MarkdownProse";
import {
  BookMarked,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Factory,
  Map,
  TriangleAlert,
} from "lucide-react";

/**
 * Real-world DE practice, primer, glossary, concept map, and prove rubric.
 */
export default function CourseEnrichmentPanels({
  courseNum,
  programPrimerMarkdown,
  glossary = [],
  courseRef,
}) {
  const [primerOpen, setPrimerOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [realWorldOpen, setRealWorldOpen] = useState(false);
  const [conceptMapOpen, setConceptMapOpen] = useState(false);
  const [provePackOpen, setProvePackOpen] = useState(false);
  const conceptMap = courseRef?.concept_map || [];
  const provePack = courseRef?.prove_pack || {};
  const realWorld = courseRef?.real_world || {};
  const hasRealWorld = Boolean(realWorld.summary);

  return (
    <>
      {hasRealWorld && (
        <section className="course-overview-block real-world-block">
          <button
            type="button"
            className="course-enrichment-toggle"
            onClick={() => setRealWorldOpen((o) => !o)}
            aria-expanded={realWorldOpen}
          >
            {realWorldOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <Factory size={18} />
            <span>Later: how this shows up in data jobs (optional)</span>
          </button>
          {realWorldOpen && (
            <>
          <p className="real-world-summary">{realWorld.summary}</p>

          {realWorld.where_it_applies?.length > 0 && (
            <div className="real-world-grid">
              {realWorld.where_it_applies.map((row) => (
                <article key={row.area} className="real-world-card">
                  <h3>{row.area}</h3>
                  <p className="real-world-example">
                    <strong>Example:</strong> {row.example}
                  </p>
                  <p className="real-world-build">
                    <strong>You build:</strong> {row.you_build}
                  </p>
                  {row.skills_from_course?.length > 0 && (
                    <p className="real-world-skills">
                      <strong>From this course:</strong> {row.skills_from_course.join(" · ")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

          {realWorld.practice_ladder?.length > 0 && (
            <div className="practice-ladder">
              <h3>Practice ladder (do in order)</h3>
              <ol className="practice-ladder-list">
                {realWorld.practice_ladder.map((step) => (
                  <li key={step.step ?? step.name}>
                    <span className="practice-ladder-step">{step.name}</span>
                    <p>{step.action}</p>
                    <p className="practice-ladder-exit">
                      <strong>Exit:</strong> {step.exit}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {realWorld.week_at_work && (
            <p className="real-world-week">
              <strong>This month at work:</strong> {realWorld.week_at_work}
            </p>
          )}
          {realWorld.maps_to_prove && (
            <p className="real-world-prove-link">
              <strong>Maps to prove gate:</strong> {realWorld.maps_to_prove}
            </p>
          )}
          {realWorld.anti_patterns?.length > 0 && (
            <div className="real-world-anti">
              <h3>
                <TriangleAlert size={16} aria-hidden />
                Anti-patterns
              </h3>
              <ul className="course-overview-list">
                {realWorld.anti_patterns.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
            </>
          )}
        </section>
      )}

      {courseNum === 0 && programPrimerMarkdown && (
        <section className="course-overview-block course-primer-block">
          <button
            type="button"
            className="course-enrichment-toggle"
            onClick={() => setPrimerOpen((o) => !o)}
            aria-expanded={primerOpen}
          >
            {primerOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <BookMarked size={18} />
            <span>Full program primer (read once)</span>
          </button>
          {primerOpen && (
            <div className="course-primer-body">
              <MarkdownProse variant="primer">{programPrimerMarkdown}</MarkdownProse>
            </div>
          )}
        </section>
      )}

      {glossary.length > 0 && (
        <section className="course-overview-block">
          <button
            type="button"
            className="course-enrichment-toggle"
            onClick={() => setGlossaryOpen((o) => !o)}
            aria-expanded={glossaryOpen}
          >
            {glossaryOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <BookMarked size={18} />
            <span>Glossary ({glossary.length} terms)</span>
          </button>
          {glossaryOpen && (
            <div className="glossary-table-wrap">
              <table className="glossary-table">
                <thead>
                  <tr>
                    <th>Term</th>
                    <th>Meaning</th>
                    <th>Data engineering angle</th>
                  </tr>
                </thead>
                <tbody>
                  {glossary.map((g) => (
                    <tr key={g.id || g.term}>
                      <td>{g.term}</td>
                      <td>{g.definition}</td>
                      <td className="glossary-de">{g.de_analogy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {conceptMap.length > 0 && (
        <section className="course-overview-block">
          <button
            type="button"
            className="course-enrichment-toggle"
            onClick={() => setConceptMapOpen((o) => !o)}
            aria-expanded={conceptMapOpen}
          >
            {conceptMapOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <Map size={18} />
            <span>Concept map (this month)</span>
          </button>
          {conceptMapOpen && (
            <ul className="course-overview-list course-enrichment-body">
              {conceptMap.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {provePack?.acceptance?.length > 0 && (
        <section className="course-overview-block prove-pack-block">
          <button
            type="button"
            className="course-enrichment-toggle"
            onClick={() => setProvePackOpen((o) => !o)}
            aria-expanded={provePackOpen}
          >
            {provePackOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <ClipboardCheck size={18} />
            <span>Prove acceptance — {provePack.title || "rubric"}</span>
          </button>
          {provePackOpen && (
            <>
          <table className="glossary-table prove-pack-table">
            <thead>
              <tr>
                <th>Criterion</th>
                <th>Required</th>
              </tr>
            </thead>
            <tbody>
              {provePack.acceptance.map((row, i) => (
                <tr key={i}>
                  <td>{row.criterion}</td>
                  <td>{row.required ? "Yes" : "Optional"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {provePack.readme_example && (
            <details className="prove-pack-example">
              <summary>Example README snippet</summary>
              <pre>{provePack.readme_example}</pre>
            </details>
          )}
          {provePack.commands?.length > 0 && (
            <p className="course-overview-hint">
              Try:{" "}
              {provePack.commands.map((c) => (
                <code key={c} className="inline-cmd">{c}</code>
              ))}
            </p>
          )}
            </>
          )}
        </section>
      )}
    </>
  );
}
