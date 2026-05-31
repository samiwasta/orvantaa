import { cache } from "react"

import { studentService } from "../service/student.service"

export const loadStudents = cache(async () => {
  const [students, sectionOptions] = await Promise.all([
    studentService.listStudents(),
    studentService.listSectionOptions(),
  ])
  return { students, sectionOptions, total: students.length }
})
