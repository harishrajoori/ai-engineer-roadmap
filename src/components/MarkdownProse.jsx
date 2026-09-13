import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/**
 * Shared GFM renderer for theory, primer, and inline home copy.
 *
 * @param {object} props
 * @param {string} props.children Markdown source
 * @param {"theory" | "primer" | "inline"} [props.variant]
 * @param {boolean} [props.math] Enable KaTeX (topic theory only)
 */
export default function MarkdownProse({ children, variant = "theory", math = false }) {
  const className =
    variant === "inline"
      ? "markdown-inline"
      : variant === "primer"
        ? "markdown-theory prose-learning prose-primer"
        : "markdown-theory prose-learning prose-theory";

  const plugins = math
    ? { remark: [remarkGfm, remarkMath], rehype: [rehypeKatex] }
    : { remark: [remarkGfm], rehype: [] };

  const tableWrap = {
    table: ({ children }) => (
      <div className="prose-learning-table-wrap">
        <table>{children}</table>
      </div>
    ),
  };

  const components =
    variant === "inline"
      ? {
          p: ({ children: c }) => <span className="markdown-inline-root">{c}</span>,
        }
      : tableWrap;

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={plugins.remark} rehypePlugins={plugins.rehype} components={components}>
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
