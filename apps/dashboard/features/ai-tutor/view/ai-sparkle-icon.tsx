import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"

type AiSparkleIconProps = {
  className?: string
  size?: number
}

export function AiSparkleIcon({ className, size = 24 }: AiSparkleIconProps) {
  return (
    <Image
      src="/sparkle.svg"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      aria-hidden
    />
  )
}
