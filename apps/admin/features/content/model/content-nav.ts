export type ContentBreadcrumb = {
  label: string
  href: string
}

export const contentHref = {
  root: () => "/content",
  board: (boardId: string) => `/content/${boardId}`,
  class: (boardId: string, classId: string) =>
    `/content/${boardId}/${classId}`,
  subject: (boardId: string, classId: string, subjectId: string) =>
    `/content/${boardId}/${classId}/${subjectId}`,
  chapter: (
    boardId: string,
    classId: string,
    subjectId: string,
    chapterId: string
  ) => `/content/${boardId}/${classId}/${subjectId}/${chapterId}`,
  topic: (
    boardId: string,
    classId: string,
    subjectId: string,
    chapterId: string,
    topicId: string
  ) =>
    `/content/${boardId}/${classId}/${subjectId}/${chapterId}/${topicId}`,
  note: (
    boardId: string,
    classId: string,
    subjectId: string,
    chapterId: string,
    topicId: string,
    noteId: string
  ) =>
    `/content/${boardId}/${classId}/${subjectId}/${chapterId}/${topicId}/notes/${noteId}`,
  quiz: (
    boardId: string,
    classId: string,
    subjectId: string,
    chapterId: string,
    quizId: string
  ) =>
    `/content/${boardId}/${classId}/${subjectId}/${chapterId}/quizzes/${quizId}`,
}
