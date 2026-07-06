import type { IconlyIconProps } from "./types"

export function IconlySearchFilled({
  size = 24,
  color = "currentColor",
  className,
  "aria-hidden": ariaHidden = true,
  style,
}: IconlyIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5136 2.20233C6.51764 2.20233 2.45264 6.26733 2.45264 11.2643C2.45264 16.2603 6.51764 20.3243 11.5136 20.3243C16.5096 20.3243 20.5746 16.2603 20.5746 11.2643C20.5746 6.26733 16.5096 2.20233 11.5136 2.20233Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.1371 17.9767C19.0831 17.9767 18.2251 18.8327 18.2251 19.8867C18.2251 20.9407 19.0831 21.7977 20.1371 21.7977C21.1901 21.7977 22.0471 20.9407 22.0471 19.8867C22.0471 18.8327 21.1901 17.9767 20.1371 17.9767Z"
        fill={color}
      />
    </svg>
  )
}
