import React, { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

let mermaidReady = false;

function syncMermaidTheme() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  mermaid.initialize({
    startOnLoad: false,
    theme: isLight ? "neutral" : "dark",
    securityLevel: "loose",
    fontFamily: "inherit",
  });
  mermaidReady = true;
}

/**
 * Renders a Mermaid diagram from fenced ```mermaid blocks in theory markdown.
 */
export default function MermaidBlock({ chart }) {
  const containerRef = useRef(null);
  const reactId = useId();
  const [error, setError] = useState("");

  useEffect(() => {
    syncMermaidTheme();
    const el = containerRef.current;
    if (!el || !chart?.trim()) {
      return;
    }

    const renderId = `mermaid-${reactId.replace(/:/g, "")}`;

    let cancelled = false;
    (async () => {
      try {
        if (!mermaidReady) {
          syncMermaidTheme();
        }
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
  }, [chart, reactId]);

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
