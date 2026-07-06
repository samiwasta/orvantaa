"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

import Link from "next/link"
import { useState } from "react"

import { useActionRunner } from "@/lib/actions/use-action-runner"

import type { QueryDetail } from "../model/support-ticket"
import { updateQueryStatusAction } from "../server/query-actions"
import { ArrowLeft, CheckCircle2, Mail, PlayCircle, RotateCcw, School, UserRound, XCircle } from "lucide-react"

type QueryDetailViewProps = {
  ticket: QueryDetail
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

function statusBadgeClass(status: QueryDetail["status"]): string {
  switch (status) {
    case "OPEN":
      return "border-amber-200 bg-amber-50 text-amber-800"
    case "IN_PROGRESS":
      return "border-[#6C5CE7]/20 bg-[#6C5CE7]/10 text-[#6C5CE7]"
    case "RESOLVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "CLOSED":
      return "text-muted-foreground"
    default:
      return ""
  }
}

export function QueryDetailView({ ticket: initialTicket }: QueryDetailViewProps) {
  const [ticket, setTicket] = useState(initialTicket)
  const [adminNote, setAdminNote] = useState(initialTicket.adminNote ?? "")

  const { run, pending, formError } = useActionRunner(updateQueryStatusAction, {
    successMessage: "Ticket updated",
    onSuccess: (data) => {
      if (data) {
        setTicket(data)
        setAdminNote(data.adminNote ?? "")
      }
    },
  })

  function updateStatus(
    status: QueryDetail["status"],
    noteOverride?: string
  ) {
    run({
      ticketId: ticket.id,
      status,
      adminNote: noteOverride ?? adminNote,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0 rounded-lg"
        >
          <Link href="/queries" aria-label="Back to queries">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {ticket.ticketNumber}
            </h1>
            <Badge
              variant="outline"
              className={statusBadgeClass(ticket.status)}
            >
              {ticket.statusLabel}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {ticket.issueAreaLabel} · Raised {formatDate(ticket.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="border-b border-border/50 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-foreground">
              Student query
            </h2>
          </div>
          <div className="space-y-4 p-5 sm:px-6 sm:pb-6 sm:pt-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {ticket.message}
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
            <div className="border-b border-border/50 px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">
                Student
              </h2>
            </div>
            <dl className="divide-y divide-border/50 text-sm">
              <div className="flex items-start gap-3 px-5 py-3.5">
                <UserRound className="mt-0.5 size-4 shrink-0 text-[#6C5CE7]" />
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{ticket.studentName}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 px-5 py-3.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-[#6C5CE7]" />
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium break-all">{ticket.studentEmail}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 px-5 py-3.5">
                <School className="mt-0.5 size-4 shrink-0 text-[#6C5CE7]" />
                <div>
                  <dt className="text-muted-foreground">School / Class</dt>
                  <dd className="font-medium">
                    {ticket.schoolName ?? "Not assigned"}
                    {ticket.classLabel ? ` · ${ticket.classLabel}` : ""}
                  </dd>
                </div>
              </div>
              <div className="px-5 py-3.5">
                <dt className="text-muted-foreground">Username</dt>
                <dd className="font-medium">@{ticket.username}</dd>
              </div>
              {ticket.studentCode ? (
                <div className="px-5 py-3.5">
                  <dt className="text-muted-foreground">Student ID</dt>
                  <dd className="font-medium">{ticket.studentCode}</dd>
                </div>
              ) : null}
              {ticket.phone ? (
                <div className="px-5 py-3.5">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{ticket.phone}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
            <div className="border-b border-border/50 px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">Actions</h2>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <Field>
                <FieldLabel htmlFor="query-admin-note">
                  Response note for student
                </FieldLabel>
                <Textarea
                  id="query-admin-note"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Optional note included in status update emails."
                  rows={4}
                />
                <FieldError />
              </Field>

              {formError ? (
                <p className="text-sm font-medium text-destructive">{formError}</p>
              ) : null}

              <div className="flex flex-col gap-2">
                {ticket.status === "OPEN" ? (
                  <Button
                    type="button"
                    disabled={pending}
                    onClick={() => updateStatus("IN_PROGRESS")}
                    className="justify-start rounded-xl bg-[#6C5CE7] text-white hover:bg-[#6C5CE7]/90"
                  >
                    <PlayCircle className="size-4" />
                    Start working
                  </Button>
                ) : null}

                {ticket.status === "OPEN" || ticket.status === "IN_PROGRESS" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => updateStatus("RESOLVED")}
                    className="justify-start rounded-xl"
                  >
                    <CheckCircle2 className="size-4" />
                    Mark resolved
                  </Button>
                ) : null}

                {ticket.status !== "CLOSED" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => updateStatus("CLOSED")}
                    className={cn("justify-start rounded-xl")}
                  >
                    <XCircle className="size-4" />
                    Close ticket
                  </Button>
                ) : null}

                {ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => updateStatus("OPEN")}
                    className="justify-start rounded-xl"
                  >
                    <RotateCcw className="size-4" />
                    Reopen ticket
                  </Button>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
