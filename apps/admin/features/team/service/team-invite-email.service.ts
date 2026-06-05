import { render } from "@react-email/render"
import _TeamInviteEmail from "@workspace/transactional/emails/team-invite"

import {
  adminLoginUrl,
  buildAdminPasswordResetUrl,
} from "@/lib/auth/password-reset-url"
import { type EmailProvider, emailProvider } from "@/lib/email"

const TeamInviteEmail: typeof _TeamInviteEmail =
  typeof _TeamInviteEmail === "function"
    ? _TeamInviteEmail
    : (_TeamInviteEmail as { default: typeof _TeamInviteEmail }).default

export type TeamAdminInviteEmailPayload = {
  to: string
  firstName: string
  username: string
  plainPassword: string
  resetToken: string
}

export class TeamInviteEmailService {
  constructor(private readonly provider: EmailProvider = emailProvider) {}

  async sendAdminInvite(payload: TeamAdminInviteEmailPayload): Promise<void> {
    const loginUrl = adminLoginUrl()
    const resetUrl = buildAdminPasswordResetUrl(payload.resetToken)

    const html = await render(
      TeamInviteEmail({
        firstName: payload.firstName,
        roleLabel: "Admin",
        loginUrl,
        resetUrl,
        username: payload.username,
        password: payload.plainPassword,
      })
    )

    await this.provider.send({
      to: payload.to,
      subject: "Your Orvantaa admin account",
      html,
    })
  }
}

export const teamInviteEmailService = new TeamInviteEmailService()
