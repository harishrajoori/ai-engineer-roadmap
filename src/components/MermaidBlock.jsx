import React, { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";
import { applyMermaidTheme, getMermaidThemeKey } from "../utils/mermaidTheme";

/**
 * Renders a Mermaid diagram from fenced ```mermaid blocks in theory markdown.
 */
export default function MermaidBlock({ chart }) {
  const containerRef = useRef(null);
  const reactId = useId();
  const [error, setError] = useState("");
  const [themeKey, setThemeKey] = useState(() => getMermaidThemeKey());

  useEffect(() => {
    const root = document.documentElement;
    const obs = new MutationObserver(() => {
      setThemeKey(getMermaidThemeKey());
    });
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    mermaid.initialize(applyMermaidTheme());
    const el = containerRef.current;
    if (!el || !chart?.trim()) {
      return;
    }

    const renderId = `mermaid-${reactId.replace(/:/g, "")}-${themeKey}`;

    let cancelled = false;
    (async () => {
      try {
        mermaid.initialize(applyMermaidTheme());
        const { svg } = await mermaid.render(renderId, chart.trim());
        if (!cancelled && el) {
          el.innerHTML = svg;
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not render diagram");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, reactId, themeKey]);

  if (error) {
    return (
      <div className="theory-diagram-card theory-diagram-error">
        <p className="theory-diagram-label">Diagram (preview failed)</p>
        <pre className="theory-mermaid-fallback">{chart}</pre>
      </div>
    );
  }

  return (
    <figure className="theory-diagram-card" aria-label="Architecture diagram">
      <div ref={containerRef} className="theory-mermaid-output" />
    </figure>
  );
}
