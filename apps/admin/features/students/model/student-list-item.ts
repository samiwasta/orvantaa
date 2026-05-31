export type StudentListItem = {
  id: string
  studentId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string | null
  schoolName: string | null
  boardName: string | null
  className: string | null
  section: string | null
}

export function formatStudentDisplayId(username: string): string {
  return username.trim().toUpperCase()
}
