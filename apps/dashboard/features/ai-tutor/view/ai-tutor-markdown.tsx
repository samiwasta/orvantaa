"use client"

import { cn } from "@workspace/ui/lib/utils"
import type { Components } from "react-markdown"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type AiTutorMarkdownProps = {
  content: string
  className?: string
  variant?: "default" | "compact"
}

const defaultMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-4 text-2xl font-bold tracking-tight text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-3 text-xl font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-base font-semibold text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 mb-2 text-sm font-semibold text-foreground first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-[15px] leading-7 text-foreground last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-4 text-[15px] leading-7 text-foreground last:mb-0 sm:pl-6">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-4 text-[15px] leading-7 text-foreground last:mb-0 sm:pl-6">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-7 [&>p]:mb-2 [&>p:last-child]:mb-0">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-[#6C5CE7]/35 py-0.5 pl-4 text-muted-foreground last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border/60" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-[#6C5CE7] underline underline-offset-2 hover:text-[#5d4ed6]"
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.includes("language-"))

    if (isBlock) {
      return (
        <code className={cn("font-mono text-[13px]", className)} {...props}>
          {children}
        </code>
      )
    }

    return (
      <code
        className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-xl bg-muted/70 p-4 font-mono text-[13px] leading-6 text-foreground last:mb-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto last:mb-0">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border/60 bg-muted/40">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-border/40 last:border-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 align-top text-foreground">{children}</td>
  ),
}

const compactMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h3 className="mt-3 mb-1.5 text-sm font-semibold text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-3 mb-1.5 text-sm font-semibold text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2.5 mb-1 text-sm font-semibold text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-2 mb-1 text-xs font-semibold text-foreground first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-2 text-[13px] leading-5 text-foreground last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-4 text-[13px] leading-5 text-foreground last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-4 text-[13px] leading-5 text-foreground last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-5 [&>p]:mb-1 [&>p:last-child]:mb-0">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-[#6C5CE7]/35 py-0.5 pl-3 text-[13px] text-muted-foreground last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border/60" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-[#6C5CE7] underline underline-offset-2 hover:text-[#5d4ed6]"
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.includes("language-"))

    if (isBlock) {
      return (
        <code className={cn("font-mono text-[11px]", className)} {...props}>
          {children}
        </code>
      )
    }

    return (
      <code
        className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg bg-muted/70 p-2.5 font-mono text-[11px] leading-5 text-foreground last:mb-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-left text-xs">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border/60 bg-muted/40">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-border/40 last:border-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-2 py-1.5 font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1.5 align-top text-foreground">{children}</td>
  ),
}

export function AiTutorMarkdown({
  content,
  className,
  variant = "default",
}: AiTutorMarkdownProps) {
  const components =
    variant === "compact"
      ? compactMarkdownComponents
      : defaultMarkdownComponents

  return (
    <div className={cn("ai-tutor-markdown min-w-0", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
