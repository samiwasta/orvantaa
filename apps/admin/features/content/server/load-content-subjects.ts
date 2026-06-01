import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentSubjects = cache(
  async (boardId: string, classId: string) => {
    const classRef = await contentService.getClassRef(classId)
    if (!classRef || classRef.boardId !== boardId) return null

    const belongs = await contentService.classBelongsToBoard(classId, boardId)
    if (!belongs) return null

    const subjects = await contentService.listSubjectsForClass(classId)
    return { classRef, subjects }
  }
)
