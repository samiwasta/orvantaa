import { useMediaQuery } from "@workspace/ui/hooks/use-media-query"
import { MOBILE_MEDIA_QUERY } from "@workspace/ui/hooks/use-mobile"
import {
  lockBodyScroll,
  unlockBodyScroll,
} from "@workspace/ui/lib/body-scroll-lock"
import * as React from "react"

export { MOBILE_MEDIA_QUERY }

export function useBodyScrollLock(
  active: boolean,
  options?: {
    /** Only lock when this media query matches (e.g. small screens). */
    mediaQuery?: string
  }
) {
  const mediaQuery = options?.mediaQuery
  const matchesMedia = useMediaQuery(mediaQuery ?? "(min-width: 0px)")
  const shouldLock = Boolean(active && (!mediaQuery || matchesMedia))

  React.useEffect(() => {
    if (!shouldLock) return

    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [shouldLock])
}
