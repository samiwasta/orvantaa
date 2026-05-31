export type ContentSubjectListItem = {
  slug: string
  title: string
  chapterCount: number
  schoolCount: number
  offeringCount: number
  orderIndex: number
}

export type ContentClassSubjectsResult = {
  className: string
  classDisplayName: string
  sections: string[]
  schoolCount: number
  subjects: ContentSubjectListItem[]
}
