"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Children, isValidElement } from "react"
import type { Components } from "react-markdown"

import { MermaidDiagram } from "./mermaid-diagram"

function getCodeText(children: React.ReactNode): string {
  return String(children).replace(/\n$/, "")
}

function isMermaidBlock(children: React.ReactNode): boolean {
  const child = Children.toArray(children)[0]
  return isValidElement(child) && child.type === MermaidDiagram
}

export function createMarkdownCodeBlockComponents(options: {
  compact?: boolean
}): Pick<Components, "code" | "pre"> {
  const compact = options.compact ?? false

  return {
    code: ({ className, children, ...props }) => {
      const language = className?.match(/language-(\w+)/)?.[1]
      const text = getCodeText(children)

      if (language === "mermaid") {
        return <MermaidDiagram chart={text} compact={compact} />
      }

      const isBlock = Boolean(className?.includes("language-"))

      if (isBlock) {
        return (
          <code
            className={cn(
              "font-mono",
              compact ? "text-[11px]" : "text-[13px]",
              className
            )}
            {...props}
          >
            {children}
          </code>
        )
      }

      return (
        <code
          className={cn(
            "rounded-md bg-muted px-1.5 py-0.5 font-mono text-foreground",
            compact ? "rounded px-1 text-[11px]" : "text-[13px]"
          )}
          {...props}
        >
          {children}
        </code>
      )
    },
    pre: ({ children }) => {
      if (isMermaidBlock(children)) {
        return <>{children}</>
      }

      return (
        <pre
          className={cn(
            "mb-4 overflow-x-auto rounded-xl bg-muted/70 p-4 font-mono leading-6 text-foreground last:mb-0",
            compact && "mb-2 rounded-lg p-2.5 text-[11px] leading-5 last:mb-0"
          )}
        >
          {children}
        </pre>
      )
    },
  }
}
