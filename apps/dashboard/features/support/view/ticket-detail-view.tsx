"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowLeft, Clock3 } from "lucide-react"
import Link from "next/link"

import {
  type StudentTicketDetail,
  SUPPORT_RESPONSE_TIME_LABEL,
  ticketStatusTone,
} from "../model/support-ticket"

type TicketDetailViewProps = {
  ticket: StudentTicketDetail
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

export function TicketDetailView({ ticket }: TicketDetailViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-start gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0 rounded-lg"
        >
          <Link href="/help" aria-label="Back to help">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {ticket.ticketNumber}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ticket.issueAreaLabel}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4 sm:px-6">
          <Badge
            variant="outline"
            className={cn(
              ticketStatusTone(ticket.status) === "success" &&
                "border-emerald-200 bg-emerald-50 text-emerald-700",
              ticketStatusTone(ticket.status) === "secondary" &&
                "border-[#4169E1]/20 bg-[#4169E1]/10 text-[#4169E1]",
              ticketStatusTone(ticket.status) === "muted" &&
                "text-muted-foreground"
            )}
          >
            {ticket.statusLabel}
          </Badge>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock3 className="size-4" aria-hidden />
            Raised {formatDate(ticket.createdAt)}
          </p>
        </div>

        <div className="space-y-5 p-5 sm:px-6 sm:pt-5 sm:pb-6">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              Your message
            </h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {ticket.message}
            </p>
          </div>

          {ticket.adminNote ? (
            <div className="rounded-xl border border-[#4169E1]/20 bg-[#4169E1]/5 p-4">
              <h2 className="text-sm font-semibold text-[#4169E1]">
                Team response
              </h2>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {ticket.adminNote}
              </p>
            </div>
          ) : ticket.status === "OPEN" ? (
            <p className="text-sm text-muted-foreground">
              Our team will review your ticket shortly. Expected response time:{" "}
              {SUPPORT_RESPONSE_TIME_LABEL}.
            </p>
          ) : null}

          {ticket.resolvedAt ? (
            <p className="text-sm text-muted-foreground">
              Resolved on {formatDate(ticket.resolvedAt)}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
