import { requestAiTutorReply } from "@/features/ai-tutor/service/ai-tutor-chat.service"

import { serializeQuizQuestionScope } from "../model/ai-tutor-scope"
import type { McqQuestion } from "../model/quiz-data"
import { optionDisplayLabel } from "../model/quiz-data"

export async function requestQuizSoftHint(input: {
  quizTitle: string
  chapterTitle: string
  questionNumber: number
  question: McqQuestion
  selectedOptionId: string
}): Promise<string> {
  const selected = input.question.options.find(
    (option) => option.id === input.selectedOptionId
  )
  const selectedLabel = selected
    ? `${optionDisplayLabel(selected.id)}. ${selected.label}`
    : "my choice"

  const scope = serializeQuizQuestionScope({
    quizTitle: input.quizTitle,
    chapterTitle: input.chapterTitle,
    questionNumber: input.questionNumber,
    question: input.question,
  })

  const { content } = await requestAiTutorReply(
    [
      {
        role: "user",
        content: [
          `I chose "${selectedLabel}" and it was incorrect.`,
          "Give one soft learning hint so I can rethink the idea.",
          "Do not reveal the correct option, letter, or final answer.",
          "Do not quote the full explanation.",
          "Keep it friendly and under 45 words.",
        ].join(" "),
      },
    ],
    scope
  )

  return content.trim()
}
