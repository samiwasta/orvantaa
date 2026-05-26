type LockSnapshot = {
  htmlOverflow: string
  htmlHeight: string
  bodyOverflow: string
  bodyPosition: string
  bodyTop: string
  bodyWidth: string
  bodyPaddingRight: string
  bodyTouchAction: string
}

let lockCount = 0
let scrollY = 0
let snapshot: LockSnapshot | null = null

function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth
}

export function lockBodyScroll() {
  if (typeof document === "undefined") return

  if (lockCount === 0) {
    scrollY = window.scrollY
    const html = document.documentElement
    const body = document.body

    snapshot = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
      bodyTouchAction: body.style.touchAction,
    }

    const scrollbarWidth = getScrollbarWidth()
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    html.style.overflow = "hidden"
    html.style.height = "100%"
    body.style.overflow = "hidden"
    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.width = "100%"
    body.style.touchAction = "none"
  }

  lockCount++
}

export function unlockBodyScroll() {
  if (typeof document === "undefined") return
  if (lockCount === 0) return

  lockCount--

  if (lockCount !== 0 || !snapshot) return

  const html = document.documentElement
  const body = document.body

  html.style.overflow = snapshot.htmlOverflow
  html.style.height = snapshot.htmlHeight
  body.style.overflow = snapshot.bodyOverflow
  body.style.position = snapshot.bodyPosition
  body.style.top = snapshot.bodyTop
  body.style.width = snapshot.bodyWidth
  body.style.paddingRight = snapshot.bodyPaddingRight
  body.style.touchAction = snapshot.bodyTouchAction

  snapshot = null
  window.scrollTo(0, scrollY)
}
