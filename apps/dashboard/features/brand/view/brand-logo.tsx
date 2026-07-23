import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"

const SIZE = {
  sm: "h-5 w-auto max-w-[104px]",
  md: "h-6 w-auto max-w-[128px]",
  lg: "h-7 w-auto max-w-[148px]",
} as const

type BrandLogoProps = {
  className?: string
  size?: keyof typeof SIZE
  priority?: boolean
}

export function BrandLogo({
  className,
  size = "md",
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/orvantaa-logo.png"
      alt="Orvantaa"
      width={1159}
      height={267}
      priority={priority}
      className={cn("object-contain object-center", SIZE[size], className)}
    />
  )
}
