"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

type DashboardChromeContextValue = {
  /** Hide sidebar, top header, and mobile bottom nav (e.g. live proctored quiz). */
  immersive: boolean
  setImmersive: (value: boolean) => void
}

const DashboardChromeContext = createContext<DashboardChromeContextValue>({
  immersive: false,
  setImmersive: () => undefined,
})

export function DashboardChromeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [immersive, setImmersiveState] = useState(false)
  const setImmersive = useCallback((value: boolean) => {
    setImmersiveState(value)
  }, [])

  const value = useMemo(
    () => ({ immersive, setImmersive }),
    [immersive, setImmersive]
  )

  return (
    <DashboardChromeContext.Provider value={value}>
      {children}
    </DashboardChromeContext.Provider>
  )
}

export function useDashboardChrome() {
  return useContext(DashboardChromeContext)
}
