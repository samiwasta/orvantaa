import type { ComponentType, CSSProperties, MouseEventHandler } from "react"

export type IconProps = {
  className?: string
  size?: number
  strokeWidth?: number
  fill?: string
  stroke?: string
  "aria-hidden"?: boolean
  style?: CSSProperties
  onClick?: MouseEventHandler<HTMLSpanElement>
}

export type IconComponent = ComponentType<IconProps>

export type LucideIcon = IconComponent
export type LucideProps = IconProps
