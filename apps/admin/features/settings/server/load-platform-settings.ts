import { cache } from "react"

import { requireAdminSession } from "@/lib/auth/session"

import type {
  IntegrationStatus,
  PlatformSettingsData,
} from "../model/platform-settings"
import { platformSettingsService } from "../service/platform-settings.service"

export const loadPlatformSettings = cache(
  async (): Promise<PlatformSettingsData> => {
    await requireAdminSession()
    return platformSettingsService.getSettings()
  }
)

export const loadIntegrationStatus = cache(
  async (): Promise<IntegrationStatus> => {
    await requireAdminSession()
    return platformSettingsService.getIntegrationStatus()
  }
)
