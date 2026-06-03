"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { FileSpreadsheet, Plus, UserPlus } from "lucide-react"
import { useState } from "react"

type SchoolAddStudentMenuProps = {
  disabled?: boolean
  onAddManually: () => void
  onAddViaCsv: () => void
}

export function SchoolAddStudentMenu({
  disabled,
  onAddManually,
  onAddViaCsv,
}: SchoolAddStudentMenuProps) {
  const [open, setOpen] = useState(false)

  function handleManual() {
    setOpen(false)
    onAddManually()
  }

  function handleCsv() {
    setOpen(false)
    onAddViaCsv()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          className="h-9 shrink-0 rounded-lg bg-[#6C5CE7] px-4 text-sm font-semibold text-white hover:bg-[#6C5CE7]/90"
        >
          <Plus className="size-4" aria-hidden />
          Add student
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={handleManual}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <UserPlus className="size-4 shrink-0 text-[#6C5CE7]" aria-hidden />
            Add manually
          </button>
          <button
            type="button"
            onClick={handleCsv}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FileSpreadsheet className="size-4 shrink-0 text-[#6C5CE7]" aria-hidden />
            Import CSV
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
