"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import Link from "next/link"
import { useMemo, useState } from "react"

import { Search } from "lucide-react"
import {
  type QueryListItem,
  queryDetailHref,
  TICKET_STATUS_OPTIONS,
} from "../model/support-ticket"

type QueriesListViewProps = {
  tickets: QueryListItem[]
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

function statusBadgeClass(status: QueryListItem["status"]): string {
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

export function QueriesListView({ tickets }: QueriesListViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tickets.filter((ticket) => {
      if (statusFilter !== "all" && ticket.status !== statusFilter) {
        return false
      }
      if (!q) return true
      return [
        ticket.ticketNumber,
        ticket.issueAreaLabel,
        ticket.studentName,
        ticket.studentEmail,
        ticket.classLabel ?? "",
        ticket.messagePreview,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    })
  }, [tickets, search, statusFilter])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Queries
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Student support tickets raised from the help center.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl border-border/60 bg-white pl-9 shadow-sm"
            aria-label="Search tickets"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              statusFilter === "all"
                ? "bg-[#6C5CE7] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All
          </button>
          {TICKET_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === option.value
                  ? "bg-[#6C5CE7] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm ring-1 ring-black/[0.04]">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            {tickets.length === 0
              ? "No support tickets yet."
              : "No tickets match your filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border/50 bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Ticket</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Issue</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Raised</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link
                        href={queryDetailHref(ticket.id)}
                        className="font-medium text-[#6C5CE7] hover:underline"
                      >
                        {ticket.ticketNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {ticket.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.classLabel ?? ticket.studentEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {ticket.issueAreaLabel}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {ticket.messagePreview}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={statusBadgeClass(ticket.status)}
                      >
                        {ticket.statusLabel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
