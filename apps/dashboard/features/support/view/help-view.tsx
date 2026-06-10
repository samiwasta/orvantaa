"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
} from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import { CircleHelp, LifeBuoy, Ticket } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import {
  type HelpPageData,
  ISSUE_AREA_OPTIONS,
  studentTicketHref,
  SUPPORT_RESPONSE_TIME_LABEL,
  type TicketIssueArea,
  ticketStatusTone,
} from "../model/support-ticket"
import { createSupportTicketAction } from "../server/support-actions"

type HelpViewProps = {
  data: HelpPageData
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

export function HelpView({ data }: HelpViewProps) {
  const router = useRouter()
  const [issueArea, setIssueArea] = useState<TicketIssueArea | "">("")
  const [message, setMessage] = useState("")

  const {
    run: runCreateTicket,
    pending,
    fieldErrors,
    formError,
  } = useActionRunner(createSupportTicketAction, {
    successMessage: "Ticket raised successfully",
    onSuccess: (ticket) => {
      setIssueArea("")
      setMessage("")
      router.push(studentTicketHref(ticket.id))
      router.refresh()
    },
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    runCreateTicket({ issueArea, message })
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Help & Support
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us what you need help with and our team will get back to you.
        </p>
      </div>

      <section className="rounded-2xl border border-[#6C5CE7]/20 bg-[#6C5CE7]/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6C5CE7]/15 text-[#6C5CE7]">
            <LifeBuoy className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Need assistance?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill out the form below to raise a support ticket. We typically
              respond within {SUPPORT_RESPONSE_TIME_LABEL}. You will receive
              email updates and can track your ticket status anytime.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="border-b border-border/50 px-5 py-4 sm:px-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <CircleHelp className="size-4 text-[#6C5CE7]" aria-hidden />
            Raise a ticket
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-5 sm:px-6 sm:pt-5 sm:pb-6"
        >
          <Field>
            <FieldLabel required>Issue area</FieldLabel>
            <Select
              value={issueArea}
              onValueChange={(value) => setIssueArea(value as TicketIssueArea)}
            >
              <SelectTrigger id="help-issue-area">
                <SelectValue placeholder="Select what you need help with" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_AREA_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHint>Choose the area that best matches your issue.</FieldHint>
            <FieldError>{fieldErrors.issueArea?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="help-message" required>
              Describe your issue
            </FieldLabel>
            <Textarea
              id="help-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share what happened, what you expected, and any steps to reproduce the issue."
              rows={6}
              className="min-h-32 resize-y"
            />
            <FieldError>{fieldErrors.message?.[0]}</FieldError>
          </Field>

          {formError ? (
            <p className="text-sm font-medium text-destructive">{formError}</p>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="rounded-xl bg-[#6C5CE7] font-semibold text-white hover:bg-[#6C5CE7]/90"
              disabled={pending}
            >
              {pending ? "Raising ticket..." : "Raise ticket"}
            </Button>
          </div>
        </form>
      </section>

      {data.tickets.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="border-b border-border/50 px-5 py-4 sm:px-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Ticket className="size-4 text-[#6C5CE7]" aria-hidden />
              Your tickets
            </h2>
          </div>
          <ul className="divide-y divide-border/50">
            {data.tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={studentTicketHref(ticket.id)}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40 sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {ticket.ticketNumber}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {ticket.issueAreaLabel}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0",
                      ticketStatusTone(ticket.status) === "success" &&
                        "border-emerald-200 bg-emerald-50 text-emerald-700",
                      ticketStatusTone(ticket.status) === "secondary" &&
                        "border-[#6C5CE7]/20 bg-[#6C5CE7]/10 text-[#6C5CE7]",
                      ticketStatusTone(ticket.status) === "muted" &&
                        "text-muted-foreground"
                    )}
                  >
                    {ticket.statusLabel}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
