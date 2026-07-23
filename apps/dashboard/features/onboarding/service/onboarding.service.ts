import type { CompleteOnboardingInput } from "../model/types"
import {
  type OnboardingRepository,
  onboardingRepository,
} from "../repository/onboarding.repository"

export class OnboardingService {
  constructor(
    private readonly repository: OnboardingRepository = onboardingRepository
  ) {}

  listBoards() {
    return this.repository.listBoards()
  }

  searchSchools(query: string) {
    return this.repository.searchSchools(query)
  }

  completeOnboarding(input: CompleteOnboardingInput) {
    return this.repository.completeOnboarding(input)
  }

  async isOnboardingComplete(userId: string) {
    const row = await this.repository.getOnboardingStatus(userId)
    return row?.onboardingCompleted === true
  }
}

export const onboardingService = new OnboardingService()
