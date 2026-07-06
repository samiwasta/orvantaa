import type { IconlyIconProps } from "./types"

export function IconlyTime({
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
        d="M12.25 7.25C12.6642 7.25 13 7.58579 13 8V12.0625C13 12.3044 12.894 12.5354 12.7105 12.6978L10.2105 14.9478C9.91761 15.2105 9.44289 15.1923 9.17261 14.908C8.90233 14.6237 8.92051 14.168 9.2134 13.9053L11.5 11.8447V8C11.5 7.58579 11.8358 7.25 12.25 7.25Z"
        fill={color}
      />
    </svg>
  )
}
