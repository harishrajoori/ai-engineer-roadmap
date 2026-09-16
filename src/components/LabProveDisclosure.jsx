import React from "react";
import { ChevronDown } from "lucide-react";

/**
 * Collapsible Lab & Prove block (progressive disclosure).
 */
export default function LabProveDisclosure({
  summary,
  defaultOpen = false,
  children,
  className = "",
  id,
}) {
  return (
    <details className={`lab-prove-disclosure ${className}`} open={defaultOpen || undefined}>
      <summary className="lab-prove-disclosure-summary" id={id}>
        <ChevronDown size={16} className="lab-prove-disclosure-chevron" aria-hidden />
        <span>{summary}</span>
      </summary>
      <div className="lab-prove-disclosure-body">{children}</div>
    </details>
  );
}
