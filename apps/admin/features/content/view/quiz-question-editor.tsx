"use client"

import { isRichContentEmpty, RichTextEditor } from "@workspace/rich-text"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldHint, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import type { QuizQuestionDraft } from "../model/quiz-models"
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react"

const SUMMARY_MAX = 80

function questionSummary(prompt: string): string {
  if (isRichContentEmpty(prompt)) return "No question text yet"
  const plain = prompt
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!plain) return "No question text yet"
  if (plain.length <= SUMMARY_MAX) return plain
  return `${plain.slice(0, SUMMARY_MAX)}…`
}

type QuizQuestionEditorProps = {
  question: QuizQuestionDraft
  index: number
  total: number
  expanded: boolean
  onToggle: () => void
  onChange: (question: QuizQuestionDraft) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

export function QuizQuestionEditor({
  question,
  index,
  total,
  expanded,
  onToggle,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: QuizQuestionEditorProps) {
  function setCorrectOption(optionIndex: number) {
    onChange({
      ...question,
      options: question.options.map((option, i) => ({
        ...option,
        isCorrect: i === optionIndex,
      })),
    })
  }

  function updateOptionLabel(optionIndex: number, label: string) {
    onChange({
      ...question,
      options: question.options.map((option, i) =>
        i === optionIndex ? { ...option, label } : option
      ),
    })
  }

  function addOption() {
    onChange({
      ...question,
      options: [...question.options, { label: "", isCorrect: false }],
    })
  }

  function removeOption(optionIndex: number) {
    if (question.options.length <= 2) return
    const next = question.options.filter((_, i) => i !== optionIndex)
    if (!next.some((o) => o.isCorrect)) {
      next[0] = { ...next[0]!, isCorrect: true }
    }
    onChange({ ...question, options: next })
  }

  const filledOptions = question.options.filter((o) => o.label.trim()).length
  const summary = questionSummary(question.prompt)

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-white transition-shadow duration-200",
        expanded
          ? "border-[#6C5CE7]/35 shadow-md shadow-[#6C5CE7]/5 ring-1 ring-[#6C5CE7]/15"
          : "border-border/70 shadow-sm ring-1 ring-black/[0.03]"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3.5 sm:px-5",
          expanded && "border-b border-border/40 bg-muted/20"
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-0.5 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/25"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180 text-[#6C5CE7]"
            )}
            aria-hidden
          />
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
              expanded
                ? "bg-[#6C5CE7] text-white"
                : "bg-[#6C5CE7]/10 text-[#6C5CE7]"
            )}
          >
            Question {index + 1}
          </span>
          {!expanded ? (
            <span className="min-w-0 truncate text-sm leading-snug text-muted-foreground">
              {summary}
            </span>
          ) : null}
          {!expanded && filledOptions > 0 ? (
            <span className="hidden shrink-0 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline">
              {filledOptions} option{filledOptions === 1 ? "" : "s"}
            </span>
          ) : null}
        </button>

        <div className="flex shrink-0 items-center gap-1 border-l border-border/50 pl-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={index === 0}
            onClick={onMoveUp}
            aria-label="Move question up"
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={index === total - 1}
            onClick={onMoveDown}
            aria-label="Move question down"
          >
            <ArrowDown className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            disabled={total <= 1}
            aria-label="Remove question"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              "flex flex-col gap-8 px-4 py-6 sm:px-5 sm:py-7",
              !expanded && "pointer-events-none opacity-0"
            )}
            aria-hidden={!expanded}
          >
            <Field className="gap-2.5">
              <FieldLabel required>Question</FieldLabel>
              <RichTextEditor
                value={question.prompt}
                onChange={(prompt) => onChange({ ...question, prompt })}
                placeholder="What is the value of x in 2x + 4 = 10?"
                variant="structured"
                minHeight="9rem"
              />
              <FieldHint>
                Use lists, math (∑), or chemistry (flask). Tab indents nested
                list items.
              </FieldHint>
            </Field>

            <Field className="gap-2.5">
              <FieldLabel>Explanation (shown after answer)</FieldLabel>
              <RichTextEditor
                value={question.explanation}
                onChange={(explanation) =>
                  onChange({ ...question, explanation })
                }
                placeholder="2x = 6, so x = 3."
                variant="structured"
                minHeight="8rem"
              />
            </Field>

            <div className="flex flex-col gap-4 border-t border-border/40 pt-8">
              <div className="space-y-1">
                <FieldLabel required>Answer options</FieldLabel>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Select the radio button for the correct answer.
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {question.options.map((option, optionIndex) => (
                  <li
                    key={optionIndex}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3",
                      option.isCorrect
                        ? "border-[#10b981]/45 bg-[#10b981]/[0.06]"
                        : "border-border/60 bg-muted/15"
                    )}
                  >
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={option.isCorrect}
                      onChange={() => setCorrectOption(optionIndex)}
                      className="size-4 shrink-0 accent-[#10b981]"
                      aria-label={`Mark option ${optionIndex + 1} as correct`}
                    />
                    <Input
                      value={option.label}
                      onChange={(e) =>
                        updateOptionLabel(optionIndex, e.target.value)
                      }
                      placeholder={`Option ${optionIndex + 1}`}
                      className="h-10 flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={question.options.length <= 2}
                      onClick={() => removeOption(optionIndex)}
                      aria-label="Remove option"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
              {question.options.length < 6 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1 w-fit rounded-xl"
                  onClick={addOption}
                >
                  <Plus className="size-3.5" aria-hidden />
                  Add option
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
