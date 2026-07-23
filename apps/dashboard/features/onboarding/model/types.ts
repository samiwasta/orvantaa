export type OnboardingSchoolSuggestion = {
  id: string
  name: string
  city: string | null
  state: string | null
  boardId: string
  boardName: string
}

export type OnboardingBoardOption = {
  id: string
  name: string
  kind: string
}

export type CompleteOnboardingInput = {
  userId: string
  schoolId?: string | null
  schoolName: string
  boardId: string
  city: string
  state: string
  standard: string
  section: string
}
