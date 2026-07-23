"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Check, ChevronDown, Search } from "lucide-react"
import * as React from "react"

export type FieldSelectOption = {
  value: string
  label: string
}

type FieldSelectProps = {
  id: string
  name?: string
  value: string
  placeholder?: string
  options: FieldSelectOption[]
  disabled?: boolean
  invalid?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  leadingIcon?: React.ReactNode
  className?: string
  onChange: (value: string) => void
}

export function FieldSelect({
  id,
  name,
  value,
  placeholder = "Select…",
  options,
  disabled = false,
  invalid = false,
  searchable = false,
  searchPlaceholder = "Search…",
  leadingIcon,
  className,
  onChange,
}: FieldSelectProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [highlightIndex, setHighlightIndex] = React.useState(0)

  const selected = options.find((option) => option.value === value) ?? null

  const filtered = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!searchable || !trimmed) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(trimmed)
    )
  }, [options, query, searchable])

  React.useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  React.useEffect(() => {
    if (!open) {
      setQuery("")
      return
    }
    const selectedIndex = options.findIndex((option) => option.value === value)
    setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0)
    if (searchable) {
      queueMicrotask(() => searchRef.current?.focus())
    }
  }, [open, searchable, value, options])

  React.useEffect(() => {
    if (!open) return
    const item = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${highlightIndex}"]`
    )
    item?.scrollIntoView({ block: "nearest" })
  }, [highlightIndex, open])

  function selectValue(next: string) {
    onChange(next)
    setOpen(false)
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault()
      setOpen(true)
    }
  }

  function onListKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
      return
    }
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setHighlightIndex((index) =>
        filtered.length === 0 ? 0 : (index + 1) % filtered.length
      )
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlightIndex((index) =>
        filtered.length === 0
          ? 0
          : (index - 1 + filtered.length) % filtered.length
      )
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      const option = filtered[highlightIndex]
      if (option) selectValue(option.value)
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-invalid={invalid || undefined}
        onClick={() => {
          if (!disabled) setOpen((current) => !current)
        }}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-xl border-0 bg-[#F3F4F8] px-3 text-left text-sm shadow-none transition outline-none",
          "focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#4169E1]/30",
          open && "bg-white ring-2 ring-[#4169E1]/30",
          disabled && "cursor-not-allowed opacity-60",
          leadingIcon && "pl-10"
        )}
      >
        {leadingIcon ? (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 [&_svg]:size-4">
            {leadingIcon}
          </span>
        ) : null}
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selected ? "text-foreground" : "text-slate-400"
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-[#E4E9F5] bg-white shadow-[0_18px_40px_-24px_rgba(45,70,140,0.45)]"
          onKeyDown={onListKeyDown}
        >
          {searchable ? (
            <div className="border-b border-[#EEF1F8] p-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setHighlightIndex(0)
                  }}
                  className="h-9 w-full rounded-lg border-0 bg-[#F3F4F8] pr-3 pl-8 text-sm outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#4169E1]/30"
                />
              </div>
            </div>
          ) : null}

          <div
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-labelledby={id}
            tabIndex={-1}
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-slate-500">No matches</p>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value
                const isHighlighted = index === highlightIndex
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    data-index={index}
                    aria-selected={isSelected}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition",
                      isHighlighted && "bg-[#F5F7FF]",
                      isSelected && "font-medium text-[#4169E1]"
                    )}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onClick={() => selectValue(option.value)}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                    {isSelected ? (
                      <Check className="size-4 shrink-0" aria-hidden />
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
