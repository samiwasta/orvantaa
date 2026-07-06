import type { IconlyIconProps } from "./types"

export function IconlyCategoryFilled({
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
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(2 2)" fill={color} fillRule="nonzero">
          <path d="M5.9199 11.4697C7.3299 11.4697 8.4599 12.6107 8.4599 14.0307V17.4397C8.4599 18.8497 7.3299 19.9997 5.9199 19.9997H2.5399C1.1399 19.9997 0 18.8497 0 17.4397V14.0307C0 12.6107 1.1399 11.4697 2.5399 11.4697H5.9199ZM17.46 11.4697C18.86 11.4697 20 12.6107 20 14.0307V17.4397C20 18.8497 18.86 19.9997 17.46 19.9997H14.08C12.67 19.9997 11.54 18.8497 11.54 17.4397V14.0307C11.54 12.6107 12.67 11.4697 14.08 11.4697H17.46ZM5.9199 0C7.3299 0 8.4599 1.15 8.4599 2.561V5.97C8.4599 7.39 7.3299 8.53 5.9199 8.53H2.5399C1.1399 8.53 0 7.39 0 5.97V2.561C0 1.15 1.1399 0 2.5399 0H5.9199ZM17.46 0C18.86 0 20 1.15 20 2.561V5.97C20 7.39 18.86 8.53 17.46 8.53H14.08C12.67 8.53 11.54 7.39 11.54 5.97V2.561C11.54 1.15 12.67 0 14.08 0H17.46Z" />
        </g>
      </g>
    </svg>
  )
}
