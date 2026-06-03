import { cache } from "react"

import { schoolClassRepository } from "../repository/school-class.repository"
import { schoolRepository } from "../repository/school.repository"
import { schoolStudentsRepository } from "../repository/school-students.repository"

export type SchoolDetailTab = "students" | "syllabus" | "subscription"

export const loadSchoolDetail = cache(
  async (routeCode: string, classFilter: string | null) => {
    const school = await schoolRepository.findSchoolByRouteCode(routeCode)
    if (!school) return null

    const [students, classTabs, sectionOptions, syllabusRows, boardClassOptions] =
      await Promise.all([
        schoolStudentsRepository.findStudentsBySchoolId(school.id),
        schoolStudentsRepository.findClassTabs(school.id),
        schoolStudentsRepository.findSectionOptions(school.id),
        schoolStudentsRepository.findSyllabusRows(school.id),
        schoolClassRepository.findBoardClassOptions(school.boardId, school.id),
      ])

    const filteredStudents =
      classFilter && classFilter !== "all"
        ? students.filter((s) => s.classId === classFilter)
        : students

    return {
      school,
      classTabs,
      sectionOptions,
      syllabusRows,
      boardClassOptions,
      students: filteredStudents,
      allStudents: students,
    }
  }
)
