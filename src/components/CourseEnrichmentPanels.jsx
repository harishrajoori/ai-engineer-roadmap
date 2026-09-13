import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookMarked, ChevronDown, ChevronRight, ClipboardCheck, Map } from "lucide-react";

/**
 * DE primer, glossary, concept map, and prove rubric for course overview.
 */
export default function CourseEnrichmentPanels({
  courseNum,
  programPrimerMarkdown,
  glossary = [],
  courseRef,
}) {
  const [primerOpen, setPrimerOpen] = useState(courseNum === 0);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const conceptMap = courseRef?.concept_map || [];
  const provePack = courseRef?.prove_pack || {};

  return (
    <>
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
            <span>Start here — AI for data engineers</span>
          </button>
          {primerOpen && (
            <div className="markdown-theory prose-learning course-primer-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{programPrimerMarkdown}</ReactMarkdown>
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
          <h2>
            <Map size={18} />
            Concept map (this month)
          </h2>
          <ul className="course-overview-list">
            {conceptMap.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {provePack?.acceptance?.length > 0 && (
        <section className="course-overview-block prove-pack-block">
          <h2>
            <ClipboardCheck size={18} />
            Prove acceptance — {provePack.title || "rubric"}
          </h2>
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
        </section>
      )}
    </>
  );
}
