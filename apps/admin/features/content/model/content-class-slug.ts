import { formatClassDisplayName } from "@/features/classes/model/class-list-item"

export function contentClassSlug(className: string): string {
  return encodeURIComponent(className.trim())
}

export function decodeContentClassSlug(slug: string): string {
  return decodeURIComponent(slug).trim()
}

export function contentClassHref(className: string): string {
  return `/content/${contentClassSlug(className)}`
}

export function formatContentClassPageTitle(className: string): string {
  return formatClassDisplayName(className)
}
