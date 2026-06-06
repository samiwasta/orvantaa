import type { StudentSchoolAccess } from "../model/school-subscription"
import {
  type SchoolSubscriptionRepository,
  schoolSubscriptionRepository,
} from "../repository/school-subscription.repository"

export class SchoolSubscriptionService {
  constructor(
    private readonly repository: SchoolSubscriptionRepository = schoolSubscriptionRepository
  ) {}

  async getStudentSchoolAccess(userId: string): Promise<StudentSchoolAccess> {
    return this.repository.findStudentSchoolAccess(userId)
  }
}

export const schoolSubscriptionService = new SchoolSubscriptionService()
