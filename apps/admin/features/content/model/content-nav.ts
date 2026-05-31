export type ContentBreadcrumb = {
  label: string
  href: string
}

export const contentHref = {
  root: () => "/content",
  school: (schoolId: string) => `/content/${schoolId}`,
  class: (schoolId: string, classId: string) => `/content/${schoolId}/${classId}`,
  subject: (schoolId: string, classId: string, subjectId: string) =>
    `/content/${schoolId}/${classId}/${subjectId}`,
  chapter: (
    schoolId: string,
    classId: string,
    subjectId: string,
    chapterId: string
  ) => `/content/${schoolId}/${classId}/${subjectId}/${chapterId}`,
  topic: (
    schoolId: string,
    classId: string,
    subjectId: string,
    chapterId: string,
    topicId: string
  ) => `/content/${schoolId}/${classId}/${subjectId}/${chapterId}/${topicId}`,
  note: (
    schoolId: string,
    classId: string,
    subjectId: string,
    chapterId: string,
    topicId: string,
    noteId: string
  ) =>
    `/content/${schoolId}/${classId}/${subjectId}/${chapterId}/${topicId}/notes/${noteId}`,
  quiz: (
    schoolId: string,
    classId: string,
    subjectId: string,
    chapterId: string,
    quizId: string
  ) =>
    `/content/${schoolId}/${classId}/${subjectId}/${chapterId}/quizzes/${quizId}`,
}
