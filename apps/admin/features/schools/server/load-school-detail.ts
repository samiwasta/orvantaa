import { cache } from "react"

import { schoolClassRepository } from "../repository/school-class.repository"
import { schoolRepository } from "../repository/school.repository"
import { schoolStudentsRepository } from "../repository/school-students.repository"
import { schoolManagementService } from "../service/school-management.service"
import { schoolSubscriptionService } from "../service/school-subscription.service"

export type SchoolDetailTab =
  | "students"
  | "syllabus"
  | "subscription"
  | "management"

export const loadSchoolDetail = cache(
  async (routeCode: string, classFilter: string | null) => {
    const school = await schoolRepository.findSchoolByRouteCode(routeCode)
    if (!school) return null

    const [
      students,
      classTabs,
      sectionOptions,
      syllabusRows,
      boardClassOptions,
      subscriptionPayments,
      managementContacts,
      billingEmail,
    ] = await Promise.all([
      schoolStudentsRepository.findStudentsBySchoolId(school.id),
      schoolStudentsRepository.findClassTabs(school.id),
      schoolStudentsRepository.findSectionOptions(school.id),
      schoolStudentsRepository.findSyllabusRows(school.id),
      schoolClassRepository.findBoardClassOptions(school.boardId, school.id),
      schoolSubscriptionService.listPayments(school.id),
      schoolManagementService.listContacts(school.id),
      schoolManagementService.getBillingEmail(school.id),
    ])

    const subscriptionPaymentsConfig = schoolSubscriptionService.getPaymentsConfig()

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
      subscriptionPayments,
      subscriptionPaymentsConfig,
      managementContacts,
      billingEmail,
      students: filteredStudents,
      allStudents: students,
    }
  }
)
