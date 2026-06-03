"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import { FileSpreadsheet, Upload } from "lucide-react"
import { useRef, useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import { CSV_IMPORT_HEADERS } from "../model/school-student-csv"
import { importSchoolStudentsCsvAction } from "../server/student-actions"

type SchoolStudentCsvImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
  schoolCode: string
}

export function SchoolStudentCsvImportDialog({
  open,
  onOpenChange,
  schoolId,
  schoolCode,
}: SchoolStudentCsvImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [csvText, setCsvText] = useState("")
  const [dragOver, setDragOver] = useState(false)

  const { run, pending, formError, reset } = useActionRunner(
    (text: string) => importSchoolStudentsCsvAction(schoolId, schoolCode, text),
    {
      onSuccess: () => {
        onOpenChange(false)
        resetFile()
      },
    }
  )

  function resetFile() {
    setFileName(null)
    setCsvText("")
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetFile()
      reset()
    }
    onOpenChange(next)
  }

  async function readFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return
    }
    const text = await file.text()
    setFileName(file.name)
    setCsvText(text)
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) void readFile(file)
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void readFile(file)
  }

  function handleImport() {
    if (!csvText.trim()) return
    run(csvText)
  }

  const headerLine = CSV_IMPORT_HEADERS.join(",")

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import students from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV with one student per row. Student code and password are
            generated automatically for each imported student.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              dragOver
                ? "border-[#6C5CE7] bg-[#6C5CE7]/5"
                : "border-border/80 bg-muted/15 hover:border-[#6C5CE7]/40 hover:bg-muted/25"
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
              {fileName ? (
                <FileSpreadsheet className="size-5" aria-hidden />
              ) : (
                <Upload className="size-5" aria-hidden />
              )}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                {fileName ? fileName : "Drop CSV here or click to browse"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">.csv files only</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
            <p className="text-xs font-medium text-foreground">Example header row</p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed break-all text-muted-foreground">
              {headerLine}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              All columns in the header row are required. Student code and password are
              generated automatically.
            </p>
          </div>

          {formError ? (
            <p className="whitespace-pre-line text-sm font-medium text-destructive">
              {formError}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={() => handleOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-[#6C5CE7] font-semibold text-white hover:bg-[#6C5CE7]/90"
            disabled={pending || !csvText.trim()}
            onClick={handleImport}
          >
            {pending ? "Importing..." : "Import students"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
