export function enhanceMermaidSvg(container: HTMLElement): void {
  const svg = container.querySelector("svg")
  if (!svg) return

  svg.style.display = "block"
  svg.style.height = "auto"
  svg.style.maxWidth = "100%"

  container.querySelectorAll("foreignObject").forEach((foreignObject) => {
    foreignObject.setAttribute("overflow", "visible")

    foreignObject.querySelectorAll("div, span, p").forEach((node) => {
      const element = node as HTMLElement
      element.style.whiteSpace = "normal"
      element.style.wordBreak = "break-word"
      element.style.overflowWrap = "anywhere"
      element.style.overflow = "visible"
      element.style.textOverflow = "clip"
      element.style.lineHeight = "1.35"
      element.style.textAlign = "center"
      element.style.boxSizing = "border-box"
      element.style.padding = "6px 10px"
    })
  })

  try {
    const bbox = svg.getBBox()
    if (bbox.width > 0 && bbox.height > 0) {
      const padding = 16
      const viewBox = [
        Math.floor(bbox.x - padding),
        Math.floor(bbox.y - padding),
        Math.ceil(bbox.width + padding * 2),
        Math.ceil(bbox.height + padding * 2),
      ].join(" ")

      svg.setAttribute("viewBox", viewBox)
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet")
      svg.removeAttribute("height")
      svg.style.width = "100%"
    }
  } catch {
    // getBBox can fail before layout; rendered SVG is still usable.
  }
}
