"use client"

import { useState } from "react"

import { isRichContentEmpty, RichTextEditor } from "@workspace/rich-text"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldHint, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowDown,
  ArrowUp,
  Layers,
  Plus,
  Trash2,
} from "lucide-react"

import { ImageUploadField } from "@/features/shared/view/image-upload-field"

import {
  createEmptyBlock,
  NOTE_BLOCK_LABELS,
  NOTE_BLOCK_TYPES,
  type NoteBlock,
  type NoteBlockType,
} from "../model/note-blocks"

const NOTE_IMAGE_UPLOAD_ENDPOINT = "/api/uploads/note-image"

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

function RichTextField({
  label,
  value,
  onChange,
  placeholder,
  variant = "full",
  minHeight,
  hint,
}: {
  label: string
  value: string
  onChange: (html: string) => void
  placeholder?: string
  variant?: "full" | "compact" | "structured"
  minHeight?: string
  hint?: string
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        variant={variant}
        minHeight={minHeight}
      />
      <FieldHint>
        {hint ??
          "Click ∑ or the flask for equations. Use Tab to indent nested list items."}
      </FieldHint>
    </Field>
  )
}

function BlockFields({
  block,
  blockIndex,
  onChange,
}: {
  block: NoteBlock
  blockIndex: number
  onChange: (block: NoteBlock) => void
}) {
  switch (block.type) {
    case "paragraph":
      return (
        <RichTextField
          label="Text"
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          placeholder="Write lesson content…"
          minHeight="9rem"
        />
      )
    case "heading":
      return (
        <RichTextField
          label="Text"
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          placeholder="Section heading…"
          variant="compact"
          minHeight="4.5rem"
        />
      )
    case "callout":
    case "quote":
      return (
        <RichTextField
          label="Text"
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          placeholder="Write content…"
          minHeight="7rem"
        />
      )
    case "definition":
      return (
        <div className="grid gap-3">
          <RichTextField
            label="Title"
            value={block.title}
            onChange={(title) => onChange({ ...block, title })}
            placeholder="e.g. Linear equation"
            variant="compact"
            minHeight="4rem"
          />
          <RichTextField
            label="Content"
            value={block.content}
            onChange={(content) => onChange({ ...block, content })}
            placeholder="Definition body…"
            minHeight="8rem"
          />
        </div>
      )
    case "example":
      return (
        <div className="grid gap-3">
          <RichTextField
            label="Title"
            value={block.title}
            onChange={(title) => onChange({ ...block, title })}
            variant="compact"
            minHeight="4rem"
          />
          <RichTextField
            label="Content"
            value={block.body}
            onChange={(body) => onChange({ ...block, body })}
            variant="structured"
            minHeight="10rem"
            placeholder="Paragraph text, numbered steps, or nested lists…"
            hint="Write freely or use bullet/numbered list buttons. Tab indents nested items."
          />
          <RichTextField
            label="Pro tip (optional)"
            value={block.tip ?? ""}
            onChange={(tip) =>
              onChange({
                ...block,
                tip: isRichContentEmpty(tip) ? undefined : tip,
              })
            }
            variant="compact"
            minHeight="4.5rem"
          />
        </div>
      )
    case "list":
      return (
        <RichTextField
          label="List content"
          value={block.content}
          onChange={(content) => onChange({ ...block, content })}
          variant="structured"
          minHeight="10rem"
          placeholder="Bullet or numbered lists; Tab for nested levels…"
          hint="Use list toolbar buttons. Press Tab on a list item to nest, Shift+Tab to outdent."
        />
      )
    case "image":
      return (
        <div className="grid gap-3">
          <Field>
            <FieldLabel>Image</FieldLabel>
            <ImageUploadField
              value={block.url}
              onChange={(url) => onChange({ ...block, url })}
              uploadEndpoint={NOTE_IMAGE_UPLOAD_ENDPOINT}
              inputId={`note-image-upload-${blockIndex}`}
              previewAlt={block.alt?.trim() || "Note image"}
              compact
            />
            <FieldHint>Stored in R2 when uploaded.</FieldHint>
          </Field>
          <Field>
            <FieldLabel>Alt text (optional)</FieldLabel>
            <Input
              value={block.alt ?? ""}
              onChange={(e) => onChange({ ...block, alt: e.target.value })}
              className="bg-white"
            />
          </Field>
        </div>
      )
  }
}

function AddBlockToolbar({
  addType,
  onTypeChange,
  onAdd,
}: {
  addType: NoteBlockType
  onTypeChange: (type: NoteBlockType) => void
  onAdd: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={addType} onValueChange={(v) => onTypeChange(v as NoteBlockType)}>
        <SelectTrigger
          className="h-9 w-[9.5rem] rounded-lg border-border/60 bg-white"
          aria-label="Block type"
        >
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
        size="sm"
        className="h-9 rounded-lg bg-[#6C5CE7] px-3 font-semibold text-white hover:bg-[#6C5CE7]/90"
        onClick={onAdd}
      >
        <Plus className="size-3.5" aria-hidden />
        Add block
      </Button>
    </div>
  )
}

export function NoteBlockEditor({ blocks, onChange }: NoteBlockEditorProps) {
  const [addType, setAddType] = useState<NoteBlockType>("paragraph")

  function handleAddBlock() {
    onChange([...blocks, createEmptyBlock(addType)])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Layers className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Content blocks</p>
            <p className="text-xs text-muted-foreground">
              {blocks.length === 0
                ? "Pick a type and add your first block"
                : `${blocks.length} block${blocks.length === 1 ? "" : "s"} · use arrows to reorder`}
            </p>
          </div>
        </div>
        <AddBlockToolbar
          addType={addType}
          onTypeChange={setAddType}
          onAdd={handleAddBlock}
        />
      </div>

      <div className="space-y-3">
        {blocks.length === 0 ? (
          <button
            type="button"
            onClick={handleAddBlock}
            className={cn(
              "flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/80",
              "bg-muted/10 px-6 py-12 text-center transition-colors",
              "hover:border-[#6C5CE7]/40 hover:bg-[#6C5CE7]/[0.04]"
            )}
          >
            <Layers className="size-9 text-muted-foreground/40" aria-hidden />
            <p className="mt-3 text-sm font-medium text-foreground">
              Add your first block
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {NOTE_BLOCK_LABELS[addType]} · click here or use Add block above
            </p>
          </button>
        ) : (
          blocks.map((block, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/20 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md bg-[#6C5CE7]/10 text-[10px] font-bold text-[#6C5CE7]">
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {NOTE_BLOCK_LABELS[block.type]}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg"
                    disabled={index === 0}
                    onClick={() => onChange(moveBlock(blocks, index, -1))}
                    aria-label="Move block up"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg"
                    disabled={index === blocks.length - 1}
                    onClick={() => onChange(moveBlock(blocks, index, 1))}
                    aria-label="Move block down"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      onChange(blocks.filter((_, i) => i !== index))
                    }
                    aria-label="Remove block"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <BlockFields
                  block={block}
                  blockIndex={index}
                  onChange={(next) => onChange(updateAt(blocks, index, next))}
                />
              </div>
            </div>
          ))
        )}

        {blocks.length > 0 ? (
          <button
            type="button"
            onClick={handleAddBlock}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/70",
              "py-3 text-sm font-medium text-muted-foreground transition-colors",
              "hover:border-[#6C5CE7]/35 hover:bg-[#6C5CE7]/[0.03] hover:text-[#6C5CE7]"
            )}
          >
            <Plus className="size-4" aria-hidden />
            Add {NOTE_BLOCK_LABELS[addType].toLowerCase()}
          </button>
        ) : null}
      </div>
    </div>
  )
}
