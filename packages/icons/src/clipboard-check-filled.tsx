import type { IconlyIconProps } from "./types"

export function IconlyClipboardCheck({
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
        d="M8.25 3.75C6.59315 3.75 5.25 5.09315 5.25 6.75V17.25C5.25 18.9069 6.59315 20.25 8.25 20.25H16.75C18.4069 20.25 19.75 18.9069 19.75 17.25V6.75C19.75 5.09315 18.4069 3.75 16.75 3.75H15.25V3C15.25 2.58579 14.9142 2.25 14.5 2.25H10.5C10.0858 2.25 9.75 2.58579 9.75 3V3.75H8.25ZM11.25 3.75H13.75V4.5C13.75 4.91421 13.4142 5.25 13 5.25H12C11.5858 5.25 11.25 4.91421 11.25 4.5V3.75ZM7.5 6.75C7.5 6.19772 7.94772 5.75 8.5 5.75H16.5C17.0523 5.75 17.5 6.19772 17.5 6.75V17.25C17.5 17.8023 17.0523 18.25 16.5 18.25H8.5C7.94772 18.25 7.5 17.8023 7.5 17.25V6.75Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.0303 10.9697C16.3232 11.2626 16.3232 11.7374 16.0303 12.0303L12.2803 15.7803C11.9874 16.0732 11.5126 16.0732 11.2197 15.7803L9.21967 13.7803C8.92678 13.4874 8.92678 13.0126 9.21967 12.7197C9.51256 12.4268 9.98744 12.4268 10.2803 12.7197L11.75 14.1893L14.9697 10.9697C15.2626 10.6768 15.7374 10.6768 16.0303 10.9697Z"
        fill={color}
      />
    </svg>
  )
}
