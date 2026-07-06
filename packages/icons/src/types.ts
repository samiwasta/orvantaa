import type { ComponentType, SVGProps } from "react"

export type IconlyIconProps = {
  size?: number
  color?: string
  className?: string
  strokeWidth?: number
  "aria-hidden"?: boolean
} & Pick<SVGProps<SVGSVGElement>, "style">

export type IconComponent = ComponentType<IconlyIconProps>
