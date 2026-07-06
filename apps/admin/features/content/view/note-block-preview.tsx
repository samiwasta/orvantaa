"use client"

import { isRichContentEmpty, RichTextContent } from "@workspace/rich-text"

import Image from "next/image"

import type { NoteBlock } from "../model/note-blocks"
import { BookMarked, Eye, Lightbulb, Pencil, Sparkles, Star } from "lucide-react"

function DefinitionBox({ title, content }: { title: string; content: string }) {
  const empty = isRichContentEmpty(title) && isRichContentEmpty(content)
  if (empty) return null

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-violet-200/70 bg-linear-to-br from-violet-50 via-white to-indigo-50/80 shadow-sm">
      <div className="flex items-center gap-2 border-b border-violet-100 bg-violet-100/50 px-4 py-2.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[#6C5CE7] text-white shadow-sm">
          <BookMarked className="size-3.5" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 text-sm font-semibold text-[#6C5CE7]">
          {isRichContentEmpty(title) ? (
            <span>Definition</span>
          ) : (
            <RichTextContent
              html={title}
              studentPreview
              previewBlock="label"
            />
          )}
        </div>
        <Sparkles
          className="ml-auto size-4 text-violet-400"
          strokeWidth={2}
          aria-hidden
        />
      </div>
      {isRichContentEmpty(content) ? (
        <p className="px-4 py-4 text-sm text-muted-foreground italic">
          Add definition content in the editor.
        </p>
      ) : (
        <div className="px-4 py-4">
          <RichTextContent html={content} studentPreview previewBlock="body" />
        </div>
      )}
    </div>
  )
}

function ExampleBox({
  title,
  body,
  tip,
}: {
  title: string
  body: string
  tip?: string
}) {
  if (
    isRichContentEmpty(title) &&
    isRichContentEmpty(body) &&
    (!tip || isRichContentEmpty(tip))
  ) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-sky-200/60 bg-linear-to-br from-sky-50/90 via-white to-cyan-50/50 shadow-sm">
      <div className="flex items-center gap-2 border-b border-sky-100 bg-sky-100/40 px-4 py-2.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-sky-500 text-white shadow-sm">
          <Pencil className="size-3.5" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 text-sm font-semibold text-sky-800">
          {isRichContentEmpty(title) ? (
            <span>Example</span>
          ) : (
            <RichTextContent
              html={title}
              studentPreview
              previewBlock="label"
            />
          )}
        </div>
      </div>
      {isRichContentEmpty(body) ? (
        <p className="px-4 py-4 text-sm text-muted-foreground italic">
          Add example content in the editor.
        </p>
      ) : (
        <div className="px-4 py-4">
          <RichTextContent
            html={body}
            structured
            previewTone="sky"
            studentPreview
            previewBlock="body"
          />
        </div>
      )}
      {tip && !isRichContentEmpty(tip) ? (
        <div className="mx-4 mb-4 flex gap-3 rounded-xl border-2 border-amber-200/80 bg-linear-to-r from-amber-50 to-yellow-50 px-3.5 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm">
            <Lightbulb className="size-4" strokeWidth={2.5} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-xs font-semibold text-amber-900">
              Pro tip
            </p>
            <div className="mt-0.5 text-sm leading-relaxed text-amber-950/85">
              <RichTextContent html={tip} studentPreview previewBlock="body" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ListBlockContent({ content }: { content: string }) {
  if (isRichContentEmpty(content)) return null

  return (
    <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4">
      <RichTextContent
        html={content}
        structured
        previewTone="emerald"
        studentPreview
        previewBlock="body"
      />
    </div>
  )
}

function NoteBlockRenderer({ block }: { block: NoteBlock }) {
  switch (block.type) {
    case "paragraph":
      if (isRichContentEmpty(block.text)) {
        return (
          <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground italic">
            Empty paragraph
          </p>
        )
      }
      return (
        <div className="rounded-xl bg-muted/30 px-4 py-3.5">
          <RichTextContent
            html={block.text}
            studentPreview
            previewBlock="body"
          />
        </div>
      )
    case "heading":
      if (isRichContentEmpty(block.text)) {
        return (
          <p className="text-lg font-semibold text-muted-foreground italic">
            Empty heading
          </p>
        )
      }
      return (
        <div className="flex items-start gap-2 text-lg font-semibold text-foreground sm:text-xl">
          <Star
            className="mt-1 size-5 shrink-0 fill-amber-400 text-amber-400"
            aria-hidden
          />
          <RichTextContent
            html={block.text}
            className="min-w-0 flex-1"
            studentPreview
            previewBlock="heading"
          />
        </div>
      )
    case "definition":
      return <DefinitionBox title={block.title} content={block.content} />
    case "example":
      return (
        <ExampleBox title={block.title} body={block.body} tip={block.tip} />
      )
    case "list":
      return <ListBlockContent content={block.content} />
    case "callout":
      if (isRichContentEmpty(block.text)) return null
      return (
        <div className="rounded-xl border-l-4 border-[#6C5CE7] bg-violet-50 px-4 py-3.5">
          <RichTextContent
            html={block.text}
            studentPreview
            previewBlock="body"
          />
        </div>
      )
    case "quote":
      if (isRichContentEmpty(block.text)) return null
      return (
        <blockquote className="border-l-2 border-violet-200 pl-4 text-muted-foreground italic">
          <RichTextContent
            html={block.text}
            studentPreview
            previewBlock="quote"
          />
        </blockquote>
      )
    case "image":
      if (!block.url.trim()) {
        return (
          <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
            Image URL required
          </div>
        )
      }
      return (
        <figure className="overflow-hidden rounded-xl ring-1 ring-black/5">
          <Image
            src={block.url}
            alt={block.alt ?? ""}
            width={800}
            height={450}
            className="h-auto w-full object-cover"
            unoptimized={block.url.startsWith("/")}
          />
        </figure>
      )
    default:
      return null
  }
}

function hasVisibleBlock(block: NoteBlock): boolean {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "callout":
    case "quote":
      return !isRichContentEmpty(block.text)
    case "definition":
      return (
        !isRichContentEmpty(block.title) || !isRichContentEmpty(block.content)
      )
    case "example":
      return (
        !isRichContentEmpty(block.title) ||
        !isRichContentEmpty(block.body) ||
        Boolean(block.tip && !isRichContentEmpty(block.tip))
      )
    case "list":
      return !isRichContentEmpty(block.content)
    case "image":
      return Boolean(block.url.trim())
    default:
      return false
  }
}

type NoteBlockPreviewProps = {
  title: string
  blocks: NoteBlock[]
  topicTitle?: string
}

export function NoteBlockPreview({
  title,
  blocks,
  topicTitle,
}: NoteBlockPreviewProps) {
  const displayTitle = title.trim() || "Untitled note"
  const visibleBlocks = blocks.filter(hasVisibleBlock)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-[#6C5CE7]">
          <Eye className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Live preview</p>
          <p className="text-xs text-muted-foreground">
            How students see this note in the app
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-border/60 bg-muted/15 p-3 sm:p-4">
        <article className="note-student-preview flex min-h-full flex-col overflow-hidden rounded-2xl border-2 border-violet-100 bg-white font-heading shadow-lg shadow-violet-200/20">
          <div className="relative overflow-hidden bg-linear-to-br from-[#6C5CE7] via-[#7c6ff0] to-[#9b8cf5] px-5 py-5">
            <div
              className="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full bg-white/10"
              aria-hidden
            />
            <div className="relative">
              {topicTitle ? (
                <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white/90">
                  {topicTitle}
                </span>
              ) : null}
              <h2 className="mt-2 font-heading text-lg font-semibold leading-snug text-white sm:text-xl">
                {displayTitle}
              </h2>
            </div>
          </div>

          <div className="flex-1 space-y-5 bg-linear-to-b from-violet-50/30 to-transparent px-4 py-5 sm:space-y-6 sm:px-5 sm:py-6">
            {visibleBlocks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-violet-200/80 bg-white/80 px-6 py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                  Nothing to preview yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add blocks in the editor to see them here.
                </p>
              </div>
            ) : (
              visibleBlocks.map((block, i) => (
                <NoteBlockRenderer key={`${block.type}-${i}`} block={block} />
              ))
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
