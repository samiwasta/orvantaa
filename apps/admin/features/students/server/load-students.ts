import { cache } from "react"

import { studentService } from "../service/student.service"

export const loadStudents = cache(async () => {
  const students = await studentService.listStudents()
  return { students, total: students.length }
})
