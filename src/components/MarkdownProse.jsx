import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import MermaidBlock from "./MermaidBlock";

/**
 * Shared GFM renderer for theory, primer, and inline home copy.
 *
 * @param {object} props
 * @param {string} props.children Markdown source
 * @param {"theory" | "primer" | "inline" | "chat"} [props.variant]
 * @param {boolean} [props.math] Enable KaTeX (topic theory only)
 */
export default function MarkdownProse({ children, variant = "theory", math = false }) {
  const className =
    variant === "inline"
      ? "markdown-inline"
      : variant === "chat"
        ? "markdown-theory prose-learning prose-chat"
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

  const theoryComponents = {
    ...tableWrap,
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
      const lang = /language-(\w+)/.exec(className || "");
      const language = lang?.[1];
      const text = String(children).replace(/\n$/, "");
      if (language === "mermaid") {
        return <MermaidBlock chart={text} />;
      }
      if (className) {
        return (
          <pre className="theory-code-block">
            <code className={className}>{children}</code>
          </pre>
        );
      }
      return <code className="theory-inline-code">{children}</code>;
    },
  };

  const components =
    variant === "inline"
      ? {
          p: ({ children: c }) => <span className="markdown-inline-root">{c}</span>,
        }
      : variant === "theory" || variant === "primer"
        ? theoryComponents
        : tableWrap;

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={plugins.remark} rehypePlugins={plugins.rehype} components={components}>
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
