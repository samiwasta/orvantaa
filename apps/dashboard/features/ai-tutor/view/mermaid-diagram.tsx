"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useId, useRef, useState } from "react"

import { MERMAID_CONFIG } from "../lib/mermaid-config"
import { getMermaidRenderCandidates } from "../lib/prepare-mermaid-chart"

let mermaidInitialized = false

type MermaidDiagramProps = {
  chart: string
  compact?: boolean
}

async function renderMermaidSvg(id: string, chart: string): Promise<string> {
  const mermaid = (await import("mermaid")).default

  if (!mermaidInitialized) {
    mermaid.initialize(MERMAID_CONFIG)
    mermaidInitialized = true
  }

  const { svg } = await mermaid.render(id, chart)
  return svg
}

async function renderMermaidWithFallback(
  baseId: string,
  rawChart: string
): Promise<string> {
  const candidates = getMermaidRenderCandidates(rawChart)
  let lastError: Error | null = null

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index]!
    try {
      return await renderMermaidSvg(`${baseId}-${index}`, candidate)
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Could not render diagram.")
    }
  }

  throw lastError ?? new Error("Could not render diagram.")
}

export function MermaidDiagram({ chart, compact }: MermaidDiagramProps) {
  const baseId = useId().replace(/:/g, "")
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) return

    setError(null)
    container.innerHTML = ""

    void (async () => {
      try {
        const svg = await renderMermaidWithFallback(baseId, chart)
        if (cancelled || !containerRef.current) return
        containerRef.current.innerHTML = svg
      } catch (renderError) {
        if (cancelled) return
        setError(
          renderError instanceof Error
            ? renderError.message
            : "Could not render diagram."
        )
      }
    })()

    return () => {
      cancelled = true
    }
  }, [baseId, chart])

  if (error) {
    return (
      <div
        className={cn(
          "my-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3",
          compact && "my-2"
        )}
      >
        <p className="mb-2 text-xs text-destructive">
          Diagram could not be rendered. The explanation below still applies.
        </p>
        <pre
          className={cn(
            "overflow-x-auto font-mono text-[12px] leading-5 text-foreground",
            compact && "text-[11px]"
          )}
        >
          {chart}
        </pre>
      </div>
    )
  }

  return (
    <div className={cn("my-3 flex justify-center", compact && "my-2")}>
      <div
        className={cn(
          "w-full rounded-xl border border-border/60 bg-white px-3 py-4",
          compact ? "max-w-full" : "max-w-[26rem]"
        )}
      >
        <div
          ref={containerRef}
          className="flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full"
          aria-label="Diagram"
        />
      </div>
    </div>
  )
}
