const DIAGRAM_HEADER =
  /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram-v2|erDiagram|pie|mindmap|timeline|gantt|journey|quadrantChart|xychart-beta)\b/i

function normalizeQuotes(value: string): string {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00a0/g, " ")
}

function fixSlashBracketNodes(chart: string): string {
  return chart.replace(
    /(\b[A-Za-z]\w*)\s*\/\s*([^\[\]\n{}]+?)\]/g,
    (_, id: string, label: string) => `${id}[${label.trim()}]`
  )
}

function fixMixedBracketNodes(chart: string): string {
  return chart
    .replace(
      /(\b[A-Za-z]\w*)\(([^()\[\]\n]+?)\]/g,
      (_, id: string, label: string) => {
        return `${id}[${label.trim()}]`
      }
    )
    .replace(
      /(\b[A-Za-z]\w*)\[([^\[\]\n]+?)\)/g,
      (_, id: string, label: string) => {
        return `${id}[${label.trim()}]`
      }
    )
    .replace(
      /(\b[A-Za-z]\w*)\{([^{}\[\]\n]+?)\]/g,
      (_, id: string, label: string) => {
        return `${id}[${label.trim()}]`
      }
    )
}

function normalizeDiagramHeader(chart: string): string {
  const lines = chart.split("\n")
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0)
  if (firstContentIndex === -1) return chart

  const firstLine = lines[firstContentIndex]?.trim() ?? ""

  if (DIAGRAM_HEADER.test(firstLine)) {
    if (/^graph\b/i.test(firstLine)) {
      lines[firstContentIndex] = firstLine.replace(/^graph\b/i, "flowchart")
    }
    return lines.join("\n")
  }

  if (
    /^subgraph\b/i.test(firstLine) ||
    /^[A-Za-z]\w*(\[|\s*-->)/.test(firstLine)
  ) {
    lines.splice(firstContentIndex, 0, "flowchart TD")
    return lines.join("\n")
  }

  return chart
}

function normalizeArrows(chart: string): string {
  return chart
    .replace(/--\s*>\s*/g, " --> ")
    .replace(/<--\s*/g, "<-- ")
    .replace(/-\.\s*/g, "-. ")
    .replace(/==\s*/g, "== ")
}

function stripTrailingCommas(chart: string): string {
  return chart.replace(/,\s*$/gm, "")
}

export function prepareMermaidChart(raw: string): string {
  let chart = normalizeQuotes(raw.trim())

  chart = chart
    .replace(/^```mermaid\s*/i, "")
    .replace(/```$/, "")
    .trim()
  chart = normalizeDiagramHeader(chart)
  chart = fixSlashBracketNodes(chart)
  chart = fixMixedBracketNodes(chart)
  chart = normalizeArrows(chart)
  chart = stripTrailingCommas(chart)

  return chart
}

function extractFlowchartEdges(
  chart: string
): Array<{ from: string; to: string }> {
  const edges: Array<{ from: string; to: string }> = []

  for (const line of chart.split("\n")) {
    const trimmed = line.trim()
    if (
      !trimmed ||
      trimmed.startsWith("classDef") ||
      trimmed.startsWith("class ")
    ) {
      continue
    }

    const edgeMatch = trimmed.match(
      /(\b[A-Za-z]\w*)\s*(?:\[([^\]]+)\])?\s*-->\s*(\b[A-Za-z]\w*)\s*(?:\[([^\]]+)\])?/
    )

    if (edgeMatch) {
      edges.push({ from: edgeMatch[1]!, to: edgeMatch[3]! })
    }
  }

  return edges
}

function extractNodeLabels(chart: string): Map<string, string> {
  const labels = new Map<string, string>()

  for (const match of chart.matchAll(/(\b[A-Za-z]\w*)\s*\[([^\]]+)\]/g)) {
    labels.set(match[1]!, match[2]!.trim())
  }

  for (const match of chart.matchAll(
    /(\b[A-Za-z]\w*)\s*\/\s*([^\[\]\n{}]+?)\]/g
  )) {
    labels.set(match[1]!, match[2]!.trim())
  }

  return labels
}

function rebuildSimpleFlowchart(chart: string): string | null {
  const edges = extractFlowchartEdges(chart)
  if (edges.length === 0) return null

  const labels = extractNodeLabels(chart)
  const lines = ["flowchart LR"]

  for (const [id, label] of labels) {
    lines.push(`  ${id}["${label.replace(/"/g, "'")}"]`)
  }

  for (const edge of edges) {
    lines.push(`  ${edge.from} --> ${edge.to}`)
  }

  return lines.join("\n")
}

export function getMermaidRenderCandidates(raw: string): string[] {
  const prepared = prepareMermaidChart(raw)
  const candidates = [prepared]

  const rebuilt = rebuildSimpleFlowchart(raw)
  if (rebuilt && rebuilt !== prepared) {
    candidates.push(rebuilt)
  }

  const rebuiltPrepared = rebuildSimpleFlowchart(prepared)
  if (rebuiltPrepared && !candidates.includes(rebuiltPrepared)) {
    candidates.push(rebuiltPrepared)
  }

  return [...new Set(candidates)]
}
