import type { MermaidConfig } from "mermaid"

export const MERMAID_CONFIG: MermaidConfig = {
  startOnLoad: false,
  securityLevel: "strict",
  htmlLabels: false,
  fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
  fontSize: 14,
  theme: "base",
  look: "classic",
  flowchart: {
    curve: "basis",
    padding: 10,
    nodeSpacing: 36,
    rankSpacing: 44,
    diagramPadding: 8,
  },
  sequence: {
    diagramMarginX: 16,
    diagramMarginY: 12,
    actorMargin: 48,
    messageMargin: 32,
  },
  themeVariables: {
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
    fontSize: "14px",
    primaryColor: "#e0f2fe",
    primaryTextColor: "#0c4a6e",
    primaryBorderColor: "#38bdf8",
    secondaryColor: "#dcfce7",
    secondaryTextColor: "#166534",
    secondaryBorderColor: "#4ade80",
    tertiaryColor: "#fef3c7",
    tertiaryTextColor: "#92400e",
    tertiaryBorderColor: "#fbbf24",
    lineColor: "#64748b",
    textColor: "#334155",
    mainBkg: "#ffffff",
    nodeBorder: "#cbd5e1",
    clusterBkg: "#f8fafc",
    clusterBorder: "#e2e8f0",
    edgeLabelBackground: "#ffffff",
    actorBkg: "#f5f3ff",
    actorBorder: "#a78bfa",
    actorTextColor: "#5b21b6",
    signalColor: "#64748b",
    pie1: "#0ea5e9",
    pie2: "#22c55e",
    pie3: "#f59e0b",
    pie4: "#8b5cf6",
    pie5: "#ec4899",
    pie6: "#06b6d4",
  },
  themeCSS: `
    .node rect,
    .node circle,
    .node ellipse,
    .node polygon {
      rx: 8px;
      ry: 8px;
      stroke-width: 1.25px;
    }
    .edgeLabel {
      background-color: #ffffff;
      color: #475569;
    }
  `,
}
