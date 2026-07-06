import type { IconlyIconProps } from "./types"

export function IconlyTarget({
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
        d="M12.25 2.25C6.57375 2.25 2.125 6.69875 2.125 12.375C2.125 18.0512 6.57375 22.5 12.25 22.5C17.9262 22.5 22.375 18.0512 22.375 12.375C22.375 6.69875 17.9262 2.25 12.25 2.25ZM4.375 12.375C4.375 7.89051 8.01551 4.25 12.5 4.25C16.9845 4.25 20.625 7.89051 20.625 12.375C20.625 16.8595 16.9845 20.5 12.5 20.5C8.01551 20.5 4.375 16.8595 4.375 12.375Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.25 7C9.35051 7 7 9.35051 7 12.25C7 15.1495 9.35051 17.5 12.25 17.5C15.1495 17.5 17.5 15.1495 17.5 12.25C17.5 9.35051 15.1495 7 12.25 7ZM9.25 12.25C9.25 10.317 10.817 8.75 12.75 8.75C14.683 8.75 16.25 10.317 16.25 12.25C16.25 14.183 14.683 15.75 12.75 15.75C10.817 15.75 9.25 14.183 9.25 12.25Z"
        fill={color}
      />
      <path
        d="M12.25 10.75C11.5596 10.75 11 11.3096 11 12C11 12.6904 11.5596 13.25 12.25 13.25C12.9404 13.25 13.5 12.6904 13.5 12C13.5 11.3096 12.9404 10.75 12.25 10.75Z"
        fill={color}
      />
    </svg>
  )
}
