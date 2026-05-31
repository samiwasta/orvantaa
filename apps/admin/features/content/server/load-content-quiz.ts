import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentQuiz = cache(async (quizId: string) => {
  const quiz = await contentService.getQuizForEditor(quizId)
  if (!quiz) return null
  const chapterRef = await contentService.getChapterRef(quiz.chapterId)
  if (!chapterRef) return null
  return { quiz, chapterRef }
})
