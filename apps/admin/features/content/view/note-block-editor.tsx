"use client"

import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react"

import {
  createEmptyBlock,
  linesToList,
  listToLines,
  NOTE_BLOCK_LABELS,
  NOTE_BLOCK_TYPES,
  type NoteBlock,
  type NoteBlockType,
} from "../model/note-blocks"

type NoteBlockEditorProps = {
  blocks: NoteBlock[]
  onChange: (blocks: NoteBlock[]) => void
}

function updateAt(blocks: NoteBlock[], index: number, block: NoteBlock): NoteBlock[] {
  return blocks.map((b, i) => (i === index ? block : b))
}

function moveBlock(blocks: NoteBlock[], index: number, direction: -1 | 1): NoteBlock[] {
  const next = index + direction
  if (next < 0 || next >= blocks.length) return blocks
  const copy = [...blocks]
  const temp = copy[index]!
  copy[index] = copy[next]!
  copy[next] = temp
  return copy
}

function BlockFields({
  block,
  onChange,
}: {
  block: NoteBlock
  onChange: (block: NoteBlock) => void
}) {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "callout":
    case "quote":
      return (
        <Field>
          <FieldLabel>Text</FieldLabel>
          <Textarea
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            rows={block.type === "paragraph" ? 4 : 2}
            className="min-h-0"
          />
        </Field>
      )
    case "definition":
      return (
        <>
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input
              value={block.title}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Content</FieldLabel>
            <Textarea
              value={block.content}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              rows={3}
            />
          </Field>
        </>
      )
    case "example":
      return (
        <>
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input
              value={block.title}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Steps (one per line)</FieldLabel>
            <Textarea
              value={listToLines(block.steps)}
              onChange={(e) =>
                onChange({ ...block, steps: linesToList(e.target.value) })
              }
              rows={4}
            />
          </Field>
          <Field>
            <FieldLabel>Pro tip (optional)</FieldLabel>
            <Input
              value={block.tip ?? ""}
              onChange={(e) =>
                onChange({
                  ...block,
                  tip: e.target.value.trim() || undefined,
                })
              }
            />
          </Field>
        </>
      )
    case "list":
      return (
        <Field>
          <FieldLabel>Items (one per line)</FieldLabel>
          <Textarea
            value={listToLines(block.items)}
            onChange={(e) =>
              onChange({ ...block, items: linesToList(e.target.value) })
            }
            rows={4}
          />
        </Field>
      )
    case "image":
      return (
        <>
          <Field>
            <FieldLabel>Image URL</FieldLabel>
            <Input
              value={block.url}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field>
            <FieldLabel>Alt text (optional)</FieldLabel>
            <Input
              value={block.alt ?? ""}
              onChange={(e) => onChange({ ...block, alt: e.target.value })}
            />
          </Field>
        </>
      )
  }
}

export function NoteBlockEditor({ blocks, onChange }: NoteBlockEditorProps) {
  const [addType, setAddType] = useState<NoteBlockType>("paragraph")

  return (
    <div className="flex flex-col gap-3">
      {blocks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          No blocks yet. Add a block below to start writing.
        </p>
      ) : (
        blocks.map((block, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm ring-1 ring-black/[0.04]"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GripVertical
                  className="size-4 text-muted-foreground/50"
                  aria-hidden
                />
                <span className="rounded-full bg-[#6C5CE7]/10 px-2.5 py-0.5 text-xs font-semibold text-[#6C5CE7]">
                  {NOTE_BLOCK_LABELS[block.type]}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={index === 0}
                  onClick={() => onChange(moveBlock(blocks, index, -1))}
                  aria-label="Move block up"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={index === blocks.length - 1}
                  onClick={() => onChange(moveBlock(blocks, index, 1))}
                  aria-label="Move block down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    onChange(blocks.filter((_, i) => i !== index))
                  }
                  aria-label="Remove block"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
            <BlockFields
              block={block}
              onChange={(next) => onChange(updateAt(blocks, index, next))}
            />
          </div>
        ))
      )}

      <div
        className={cn(
          "flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/15 p-3 sm:flex-row sm:items-center"
        )}
      >
        <Select
          value={addType}
          onValueChange={(v) => setAddType(v as NoteBlockType)}
        >
          <SelectTrigger className="w-full bg-white sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTE_BLOCK_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {NOTE_BLOCK_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => onChange([...blocks, createEmptyBlock(addType)])}
        >
          <Plus className="size-4" aria-hidden />
          Add block
        </Button>
      </div>
    </div>
  )
}
