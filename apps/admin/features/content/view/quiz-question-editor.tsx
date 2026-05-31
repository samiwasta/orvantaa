"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"

import type { QuizQuestionDraft } from "../model/quiz-models"

type QuizQuestionEditorProps = {
  question: QuizQuestionDraft
  index: number
  total: number
  onChange: (question: QuizQuestionDraft) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

export function QuizQuestionEditor({
  question,
  index,
  total,
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

  return (
    <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="rounded-full bg-[#6C5CE7]/10 px-2.5 py-0.5 text-xs font-semibold text-[#6C5CE7]">
          Question {index + 1}
        </span>
        <div className="flex items-center gap-0.5">
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

      <div className="flex flex-col gap-4">
        <Field>
          <FieldLabel required>Question</FieldLabel>
          <Textarea
            value={question.prompt}
            onChange={(e) =>
              onChange({ ...question, prompt: e.target.value })
            }
            rows={2}
            placeholder="What is the value of x in 2x + 4 = 10?"
          />
        </Field>

        <Field>
          <FieldLabel>Explanation (shown after answer)</FieldLabel>
          <Textarea
            value={question.explanation}
            onChange={(e) =>
              onChange({ ...question, explanation: e.target.value })
            }
            rows={2}
            placeholder="2x = 6, so x = 3."
          />
        </Field>

        <div className="flex flex-col gap-2">
          <FieldLabel required>Answer options</FieldLabel>
          <p className="text-xs text-muted-foreground">
            Select the radio button for the correct answer.
          </p>
          <ul className="flex flex-col gap-2">
            {question.options.map((option, optionIndex) => (
              <li
                key={optionIndex}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2",
                  option.isCorrect
                    ? "border-[#10b981]/50 bg-[#10b981]/5"
                    : "border-border/60 bg-muted/10"
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
                  className="h-9 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
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
              className="w-fit rounded-lg"
              onClick={addOption}
            >
              <Plus className="size-3.5" aria-hidden />
              Add option
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
