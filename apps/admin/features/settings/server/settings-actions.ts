"use server"

import { revalidatePath } from "next/cache"

import {
  actionError,
  actionOk,
  type ActionResult,
  parseInput,
} from "@/lib/actions/action-result"
import { requireAdminSession } from "@/lib/auth/session"

import {
  type PlatformSettingsData,
  platformSettingsSchema,
} from "../model/platform-settings"
import { platformSettingsService } from "../service/platform-settings.service"

export async function savePlatformSettingsAction(
  raw: unknown
): Promise<ActionResult<PlatformSettingsData>> {
  try {
    await requireAdminSession()
  } catch {
    return actionError("You must be signed in as an admin.")
  }

  const parsed = parseInput(platformSettingsSchema, raw)
  if (!parsed.success) return parsed.result

  try {
    const settings = await platformSettingsService.saveSettings(parsed.data)
    revalidatePath("/settings")
    return actionOk(settings, "Settings saved")
  } catch {
    return actionError("Could not save settings. Please try again.")
  }
}
