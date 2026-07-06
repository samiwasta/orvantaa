"use client"

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import { motion, useInView, useMotionValue, useSpring } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Clock3,
  Flame,
  Lightbulb,
  LineChart,
  Target,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import type {
  ActiveLearnerDashboardData,
  DashboardActionCard,
  DashboardPerformanceInsights,
  PerformanceSummaryStat,
} from "../model/active-learner-dashboard-data"
import { AiTutorPromptCard } from "./ai-tutor-prompt-card"

const actionCardConfig: Record<
  DashboardActionCard["variant"],
  {
    accent: string
    icon: LucideIcon
    iconBg: string
    badge: string
    body: string
    footer: string
    arrowWrap: string
    shadow: string
  }
> = {
  purple: {
    accent: "bg-[#6C5CE7]",
    icon: ClipboardCheck,
    iconBg: "bg-violet-50 text-[#6C5CE7] ring-1 ring-violet-100",
    badge: "text-[#7B6AE8]",
    body: "bg-gradient-to-br from-white via-white to-violet-50/40",
    footer:
      "border-t border-violet-100/90 bg-violet-50/40 text-[#6C5CE7] group-hover/footer:bg-violet-50/80",
    arrowWrap:
      "bg-violet-100/90 text-[#6C5CE7] group-hover/footer:bg-[#6C5CE7] group-hover/footer:text-white",
    shadow: "hover:shadow-[0_14px_36px_-14px_rgba(108,92,231,0.28)]",
  },
  white: {
    accent: "bg-[#4169E1]",
    icon: BookOpen,
    iconBg: "bg-[#F0F4FF] text-[#4169E1] ring-1 ring-[#E0E7FF]",
    badge: "text-[#6B85E8]",
    body: "bg-gradient-to-br from-white via-white to-[#F8FAFF]",
    footer:
      "border-t border-[#E8EEFF] bg-[#FAFBFF] text-[#4169E1] group-hover/footer:bg-[#F0F4FF]",
    arrowWrap:
      "bg-[#E8EEFF] text-[#4169E1] group-hover/footer:bg-[#4169E1] group-hover/footer:text-white",
    shadow: "hover:shadow-[0_14px_36px_-14px_rgba(65,105,225,0.2)]",
  },
  blue: {
    accent: "bg-[#0EA5B7]",
    icon: LineChart,
    iconBg: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100",
    badge: "text-cyan-600",
    body: "bg-gradient-to-br from-white via-white to-cyan-50/35",
    footer:
      "border-t border-cyan-100/90 bg-cyan-50/40 text-cyan-800 group-hover/footer:bg-cyan-50/75",
    arrowWrap:
      "bg-cyan-100/90 text-cyan-700 group-hover/footer:bg-cyan-600 group-hover/footer:text-white",
    shadow: "hover:shadow-[0_14px_36px_-14px_rgba(14,165,183,0.22)]",
  },
}

const statToneStyles: Record<
  PerformanceSummaryStat["tone"],
  { card: string; icon: string; value: string; bg: string }
> = {
  purple: {
    card: "border-violet-100/80",
    icon: "bg-white/90 text-[#6C5CE7] ring-1 ring-violet-100",
    value: "text-[#6C5CE7]",
    bg: "bg-violet-50/40",
  },
  orange: {
    card: "border-orange-100/80",
    icon: "bg-white/90 text-[#FF8A3D] ring-1 ring-orange-100",
    value: "text-[#FF8A3D]",
    bg: "bg-orange-50/40",
  },
  amber: {
    card: "border-amber-100/80",
    icon: "bg-white/90 text-amber-600 ring-1 ring-amber-100",
    value: "text-amber-600",
    bg: "bg-amber-50/40",
  },
  teal: {
    card: "border-cyan-100/80",
    icon: "bg-white/90 text-cyan-600 ring-1 ring-cyan-100",
    value: "text-cyan-700",
    bg: "bg-cyan-50/40",
  },
}

const statIcons: Record<PerformanceSummaryStat["tone"], LucideIcon> = {
  purple: Target,
  orange: ClipboardCheck,
  amber: Flame,
  teal: Clock3,
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

type ActiveLearnerBentoGridProps = {
  data: ActiveLearnerDashboardData
  userFirstName?: string
}

export function ActiveLearnerBentoGrid({
  data,
  userFirstName,
}: ActiveLearnerBentoGridProps) {
  return (
    <section className="flex flex-col gap-6 md:gap-8">
      <motion.div
        className="grid grid-cols-1 gap-5 md:gap-6 xl:grid-cols-3 xl:items-stretch"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem} className="xl:col-span-1">
          <CurrentLessonCard lesson={data.currentLesson} />
        </motion.div>
        <motion.div variants={staggerItem} className="xl:col-span-2">
          <PerformanceSummaryCard performance={data.performance} />
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {data.actionCards.map((card) => (
          <motion.div key={card.title} variants={staggerItem}>
            <DashboardActionCardView card={card} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-5 md:gap-6 xl:grid-cols-2 xl:items-stretch"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <PerformanceInsightsCard insights={data.performanceInsights} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <AiTutorPromptCard
            userFirstName={userFirstName}
            placeholder="Ask anything about your studies..."
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

function AnimatedProgress({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    stiffness: 60,
    damping: 18,
    mass: 0.8,
  })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (inView) motionValue.set(value)
  }, [inView, value, motionValue])

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)))
  }, [spring])

  return (
    <div ref={ref}>
      <Progress
        value={display}
        className="h-2 bg-white/30 **:data-[slot=progress-indicator]:bg-white **:data-[slot=progress-indicator]:transition-none"
      />
    </div>
  )
}

function LessonCardShapes() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -top-14 -right-14 size-48 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 -left-12 size-44 rounded-full bg-white/8" />
      <div className="absolute top-[38%] right-6 size-12 rounded-full border border-white/20 bg-white/5" />
    </div>
  )
}

function CurrentLessonCard({
  lesson,
}: {
  lesson: ActiveLearnerDashboardData["currentLesson"]
}) {
  const progressLabel =
    lesson.totalItems > 0
      ? `${lesson.completedItems}/${lesson.totalItems} completed`
      : "No activities yet"

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-[#E8EEFF]/80 bg-white py-0 shadow-[0_10px_40px_-12px_rgba(65,105,225,0.22)]">
      <div className="relative overflow-hidden bg-[#4169E1] px-6 pt-6 pb-7 sm:px-7 sm:pt-7">
        <LessonCardShapes />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/20" />

        <div className="relative">
          <motion.span
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20"
          >
            {lesson.subjectTitle}
          </motion.span>
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.05,
            }}
            className="mt-3 font-heading text-xl leading-snug font-semibold tracking-tight text-white sm:text-[1.25rem]"
          >
            {lesson.chapterLabel}
          </motion.h3>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="mt-5 space-y-2"
          >
            <div className="flex items-center justify-between gap-3 text-xs text-white/75">
              <span className="font-medium">Progress</span>
              <span>{progressLabel}</span>
            </div>
            <AnimatedProgress value={lesson.progressPercent} />
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[#f0f4ff] bg-[#fafbff] px-6 py-4 sm:px-7 sm:py-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lesson.isCompleted
            ? "Chapter complete — ready for revision"
            : "Keep going, you're doing great!"}
        </p>
        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
          <Button
            asChild
            className={
              lesson.isCompleted
                ? "h-9 shrink-0 rounded-xl border-2 border-[#FF8A3D] bg-transparent px-4 text-sm font-semibold text-[#FF8A3D] hover:border-[#E8722A] hover:bg-[#FF8A3D]/10 hover:text-[#E8722A]"
                : "h-9 shrink-0 rounded-xl bg-[#FF8A3D] px-4 text-sm font-semibold text-white shadow-[0_6px_16px_-8px_rgba(255,138,61,0.75)] hover:bg-[#f57f31]"
            }
          >
            <Link href={lesson.continueHref}>
              {lesson.isCompleted ? "Revise" : "Continue"}
            </Link>
          </Button>
        </motion.div>
      </div>
    </Card>
  )
}

function PerformanceSummaryCard({
  performance,
}: {
  performance: ActiveLearnerDashboardData["performance"]
}) {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-[#E8EEFF]/80 bg-white py-0 shadow-[0_10px_40px_-12px_rgba(65,105,225,0.12)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#f0f4ff] bg-[#fafbff] px-6 py-4 sm:px-7">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Performance
        </h3>
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80"
        >
          <TrendingUp className="size-3.5" strokeWidth={2.5} />
          {performance.gradePaceLabel}
        </motion.span>
      </div>

      <motion.div
        className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3 p-5 sm:grid-cols-4 sm:gap-4 sm:p-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {performance.stats.map((stat) => (
          <motion.div key={stat.label} variants={staggerItem}>
            <PerformanceStatTile stat={stat} />
          </motion.div>
        ))}
      </motion.div>
    </Card>
  )
}

function PerformanceStatTile({ stat }: { stat: PerformanceSummaryStat }) {
  const styles = statToneStyles[stat.tone]
  const Icon = statIcons[stat.tone]
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className={cn(
        "relative flex h-full min-h-[116px] cursor-default flex-col overflow-hidden rounded-xl border",
        styles.card,
        styles.bg
      )}
    >
      <div className="flex flex-1 flex-col justify-between p-4">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-full",
            styles.icon
          )}
        >
          <Icon className="size-4 shrink-0" strokeWidth={2.25} />
        </div>
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className={cn(
              "text-[1.5rem] leading-none font-bold tracking-tight sm:text-[1.65rem]",
              styles.value
            )}
          >
            {stat.value}
          </motion.p>
          <p className="mt-1.5 text-xs font-medium text-muted-foreground">
            {stat.label}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function PerformanceInsightsCard({
  insights,
}: {
  insights: DashboardPerformanceInsights
}) {
  const { strength, growthArea, tip } = insights

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-[#D4DFFF] bg-gradient-to-b from-[#F3F6FF] via-white to-[#F8FAFF] py-0 shadow-[0_14px_44px_-18px_rgba(65,105,225,0.22)]">
      <div className="border-b border-[#DCE6FF] bg-gradient-to-r from-[#E8EEFF]/90 via-[#F4F7FF] to-[#FAFBFF] px-6 py-4 sm:px-7">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Performance Insights
        </h3>
        <p className="mt-0.5 text-xs font-medium text-[#6B85E8]">
          Based on your recent activity
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 bg-gradient-to-b from-[#FAFBFF]/80 to-[#F0F4FF]/50 p-5 sm:gap-5 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            className="flex items-center gap-3.5 rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/80 p-4 shadow-[0_6px_18px_-8px_rgba(16,185,129,0.28)]"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_4px_12px_-4px_rgba(16,185,129,0.45)]">
              <TrendingUp className="size-4.5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.08em] text-emerald-700/80 uppercase">
                {strength.label}
              </p>
              <p className="truncate font-heading text-base leading-tight font-semibold text-foreground">
                {strength.subject}
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            className="flex items-center gap-3.5 rounded-xl border border-[#C5D4FA] bg-gradient-to-br from-[#E8EEFF] via-white to-[#EDF2FF] p-4 shadow-[0_6px_18px_-8px_rgba(65,105,225,0.28)]"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4169E1] to-[#5B7FE8] text-white shadow-[0_4px_12px_-4px_rgba(65,105,225,0.45)]">
              <Target className="size-4.5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.08em] text-[#5B7FE8] uppercase">
                {growthArea.label}
              </p>
              <p className="truncate font-heading text-base leading-tight font-semibold text-foreground">
                {growthArea.subject}
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-auto flex gap-3 rounded-xl border border-[#DCE6FF] bg-white/90 p-4 shadow-[0_4px_16px_-10px_rgba(65,105,225,0.12)] backdrop-blur-sm"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 ring-1 ring-amber-200/70">
            <Lightbulb className="size-4" strokeWidth={2} />
          </div>
          <p className="text-sm leading-relaxed text-foreground/75">{tip}</p>
        </motion.div>
      </div>
    </Card>
  )
}

function DashboardActionCardView({ card }: { card: DashboardActionCard }) {
  const config = actionCardConfig[card.variant]
  const Icon = config.icon
  const hasSplitFooter = Boolean(
    card.secondaryButtonLabel && card.secondaryHref
  )

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.18, ease: "easeOut" } }}
      className="h-full"
    >
      <Card
        className={cn(
          "group flex h-full min-h-[148px] flex-col overflow-hidden rounded-2xl border border-[#E8EEFF]/90 bg-white p-0 shadow-[0_6px_24px_-10px_rgba(65,105,225,0.12)] transition-shadow duration-200",
          config.shadow
        )}
      >
        <div className="flex min-h-0 flex-1">
          <div className={cn("w-1.5 shrink-0", config.accent)} aria-hidden />
          <div className={cn("flex min-w-0 flex-1 flex-col", config.body)}>
            <div className="flex flex-1 items-start gap-3 p-4">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  config.iconBg
                )}
              >
                <Icon className="size-[1.05rem] shrink-0" strokeWidth={2.25} />
              </div>
              <div className="flex min-h-[72px] min-w-0 flex-1 flex-col pt-0.5">
                <p
                  className={cn(
                    "text-[10px] font-semibold tracking-[0.08em] uppercase",
                    config.badge
                  )}
                >
                  {card.badge}
                </p>
                <h3 className="mt-1 line-clamp-2 font-heading text-[0.98rem] leading-snug font-semibold tracking-tight text-foreground">
                  {card.title}
                </h3>

                <div className="mt-2 min-h-[28px] flex-1">
                  {card.progressPercent !== undefined ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold">
                        <span className="text-muted-foreground">Progress</span>
                        {card.progressLabel ? (
                          <span className={config.badge}>
                            {card.progressLabel}
                          </span>
                        ) : null}
                      </div>
                      <Progress
                        value={card.progressPercent}
                        className="h-1.5 bg-[#E8EEFF] **:data-[slot=progress-indicator]:bg-[#4169E1]"
                      />
                    </div>
                  ) : card.subtitle ? (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {card.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {hasSplitFooter ? (
              <div
                className={cn(
                  "mt-auto flex items-center justify-between gap-2 border-t px-4 py-2.5 text-sm font-semibold",
                  config.footer
                )}
              >
                <Link
                  href={card.secondaryHref!}
                  className="shrink-0 text-xs font-semibold text-[#6B85E8] hover:underline"
                >
                  {card.secondaryButtonLabel}
                </Link>
                <Link
                  href={card.href}
                  className="group/footer inline-flex min-w-0 items-center justify-end gap-2 transition-colors duration-200"
                >
                  <span className="truncate">{card.buttonLabel}</span>
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                      config.arrowWrap
                    )}
                  >
                    <ArrowRight className="size-3" strokeWidth={2.5} />
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                href={card.href}
                className={cn(
                  "group/footer mt-auto flex items-center justify-between gap-2 border-t px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
                  config.footer
                )}
              >
                <span className="min-w-0 truncate">{card.buttonLabel}</span>
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                    config.arrowWrap
                  )}
                >
                  <ArrowRight className="size-3" strokeWidth={2.5} />
                </span>
              </Link>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
