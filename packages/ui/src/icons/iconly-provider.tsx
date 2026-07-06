"use client"

import type { ComponentType, ReactNode } from "react"
import { IconlyProvider as BaseIconlyProvider } from "react-iconly"

type IconlyProviderComponent = ComponentType<{
  children: ReactNode
  set?: "light" | "bold" | "two-tone" | "bulk" | "broken" | "curved"
  primaryColor?: string
  stroke?: "light" | "regular" | "bold"
}>

const Provider = BaseIconlyProvider as IconlyProviderComponent

type AppIconlyProviderProps = {
  children: ReactNode
}

export function AppIconlyProvider({ children }: AppIconlyProviderProps) {
  return (
    <Provider set="light" primaryColor="currentColor" stroke="regular">
      {children}
    </Provider>
  )
}

export { BaseIconlyProvider as IconlyProvider }
