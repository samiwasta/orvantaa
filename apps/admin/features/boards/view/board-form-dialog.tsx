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
import { Field, FieldError, FieldHint, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useEffect, useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import {
  type BoardInput,
  type BoardKind,
  type BoardListItem,
  deriveBoardCodeFromName,
  deriveBoardSlugFromName,
} from "../model/board-list-item"
import { createBoardAction, updateBoardAction } from "../server/actions"

type BoardFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  board?: BoardListItem | null
}

export function BoardFormDialog({
  open,
  onOpenChange,
  board,
}: BoardFormDialogProps) {
  const isEdit = Boolean(board)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)
  const [codeEdited, setCodeEdited] = useState(false)
  const [kind, setKind] = useState<BoardKind>("board")
  const [code, setCode] = useState("")

  const { run, pending, fieldErrors, formError, reset } = useActionRunner<
    [BoardInput] | [string, BoardInput],
    BoardListItem
  >(
    ((...args: unknown[]) =>
      isEdit
        ? updateBoardAction(args[0] as string, args[1] as BoardInput)
        : createBoardAction(args[0] as BoardInput)) as never,
    {
      successMessage: isEdit ? "Board updated" : "Board created",
      onSuccess: () => onOpenChange(false),
    }
  )

  useEffect(() => {
    if (!open) return
    reset()
    setName(board?.name ?? "")
    setSlug(board?.slug ?? "")
    setSlugEdited(Boolean(board))
    setKind(board?.kind ?? "board")
    setCode(board?.code ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, board])

  function handleNameChange(value: string) {
    setName(value)
    if (!slugEdited) setSlug(deriveBoardSlugFromName(value))
    if (!codeEdited) setCode(deriveBoardCodeFromName(value))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const input: BoardInput = {
      name,
      slug,
      kind,
      code: code.trim() === "" ? null : code.trim(),
    }
    if (isEdit && board) {
      run(board.id, input)
    } else {
      run(input)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit board" : "Add board"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this board or university."
              : "Create an education board or university such as CBSE or ICSE."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="board-name" required>
              Name
            </FieldLabel>
            <Input
              id="board-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Central Board of Secondary Education"
              autoFocus
            />
            <FieldError>{fieldErrors.name?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="board-slug" required>
              Slug
            </FieldLabel>
            <Input
              id="board-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugEdited(true)
              }}
              placeholder="e.g. cbse"
            />
            <FieldHint>
              Auto-filled from the name (e.g. CBSE → cbse). You can edit if needed.
            </FieldHint>
            <FieldError>{fieldErrors.slug?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel required>Type</FieldLabel>
            <Select value={kind} onValueChange={(v) => setKind(v as BoardKind)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="board">Board</SelectItem>
                <SelectItem value="university">University</SelectItem>
              </SelectContent>
            </Select>
            <FieldError>{fieldErrors.kind?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="board-code">Code</FieldLabel>
            <Input
              id="board-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setCodeEdited(true)
              }}
              placeholder="e.g. CBSE"
            />
            <FieldHint>Auto-filled as an acronym from the name (e.g. CBSE).</FieldHint>
            <FieldError>{fieldErrors.code?.[0]}</FieldError>
          </Field>

          {formError ? (
            <p className="text-sm font-medium text-destructive">{formError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-[#6C5CE7] font-semibold text-white hover:bg-[#6C5CE7]/90"
              disabled={pending}
            >
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
