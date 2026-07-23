"use client"

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import { motion, useInView, useMotionValue, useSpring } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  ClipboardCheck,
  Clock3,
  Flame,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react"
import Image from "next/image"
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
    shell: string
    badge: string
    title: string
    subtitle: string
    secondary: string
    cta: string
    glow: string
    progressTrack: string
  }
> = {
  purple: {
    shell:
      "border-0 bg-gradient-to-br from-[#8B5CF6] via-[#7C5CE8] to-[#6C5CE7] shadow-[0_18px_40px_-18px_rgba(108,92,231,0.75)]",
    badge: "border-white/70 bg-white/95 text-[#5B5B7A]",
    title: "text-white",
    subtitle: "text-white/80",
    secondary: "text-white/85",
    cta: "bg-white text-[#6C5CE7] hover:bg-[#F5F3FF]",
    glow: "bg-white/15",
    progressTrack: "bg-white/25 **:data-[slot=progress-indicator]:bg-white",
  },
  white: {
    shell:
      "border-0 bg-gradient-to-br from-[#FF9B4A] via-[#FF8A3D] to-[#F97316] shadow-[0_18px_40px_-18px_rgba(249,115,22,0.7)]",
    badge: "border-white/70 bg-white/95 text-[#9A4B12]",
    title: "text-white",
    subtitle: "text-white/85",
    secondary: "text-white/90",
    cta: "bg-white text-[#E8722A] hover:bg-[#FFF7F0]",
    glow: "bg-white/18",
    progressTrack: "bg-white/30 **:data-[slot=progress-indicator]:bg-white",
  },
  blue: {
    shell:
      "border-0 bg-gradient-to-br from-[#22C3D6] via-[#14B8C9] to-[#0EA5B7] shadow-[0_18px_40px_-18px_rgba(14,165,183,0.7)]",
    badge: "border-white/70 bg-white/95 text-[#0B6F7C]",
    title: "text-white",
    subtitle: "text-white/85",
    secondary: "text-white/90",
    cta: "bg-white text-[#0E8FA0] hover:bg-[#F0FBFD]",
    glow: "bg-white/18",
    progressTrack: "bg-white/30 **:data-[slot=progress-indicator]:bg-white",
  },
}

const statToneStyles: Record<
  PerformanceSummaryStat["tone"],
  { card: string; icon: string; value: string; label: string }
> = {
  purple: {
    card: "bg-[#F3F0FF]",
    icon: "text-[#7C6BF0]",
    value: "text-[#6C5CE7]",
    label: "text-[#5B5B7A]",
  },
  orange: {
    card: "bg-[#FFF1EB]",
    icon: "text-[#FF8A3D]",
    value: "text-[#F97316]",
    label: "text-[#7A5B4A]",
  },
  amber: {
    card: "bg-[#FFF8DC]",
    icon: "text-[#E5A100]",
    value: "text-[#D97706]",
    label: "text-[#7A6A3A]",
  },
  teal: {
    card: "bg-[#EAFBFF]",
    icon: "text-[#0EA5B7]",
    value: "text-[#0E8FA0]",
    label: "text-[#3A6A72]",
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
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
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

      <div className="h-px w-full bg-[#E0E7FF]/90" aria-hidden />

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
              ease: [0.22, 1, 0.36, 1] as const,
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
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-[#E8EEFF]/90 bg-white py-0 shadow-[0_8px_30px_-14px_rgba(65,105,225,0.12)]">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Performance
        </h3>
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100"
        >
          <TrendingUp className="size-3.5" strokeWidth={2.5} />
          {performance.gradePaceLabel}
        </motion.span>
      </div>

      <motion.div
        className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-4 sm:gap-3.5 sm:px-6 sm:pb-6"
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
        "relative flex h-full min-h-[108px] cursor-default flex-col justify-between rounded-2xl p-3.5 sm:min-h-[118px] sm:p-4",
        styles.card
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn("size-4 shrink-0 sm:size-[1.05rem]", styles.icon)}
          strokeWidth={2.25}
        />
        <p
          className={cn(
            "truncate text-xs font-medium sm:text-[13px]",
            styles.label
          )}
        >
          {stat.label}
        </p>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className={cn(
          "mt-4 text-[1.55rem] leading-none font-bold tracking-tight sm:mt-5 sm:text-[1.75rem]",
          styles.value
        )}
      >
        {stat.value}
      </motion.p>
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
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-[1.5rem] border border-[#E8EEFF]/90 bg-white py-0 shadow-[0_10px_32px_-16px_rgba(108,92,231,0.16)]">
      <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Performance Insights
        </h3>
        <p className="mt-0.5 text-xs font-medium text-[#7B6AE8]">
          Based on your recent activity
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 px-5 pb-5 sm:gap-4 sm:px-6 sm:pb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-[#ECFDF5] p-4"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981] text-white">
              <TrendingUp className="size-4.5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.08em] text-emerald-700/75 uppercase">
                {strength.label}
              </p>
              <p className="mt-0.5 truncate font-heading text-base leading-tight font-semibold text-foreground">
                {strength.subject}
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            className="flex items-center gap-3 rounded-2xl border border-[#E4DEFF] bg-[#F3F0FF] p-4"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7C5CE8] text-white">
              <Target className="size-4.5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.08em] text-[#7B6AE8]/80 uppercase">
                {growthArea.label}
              </p>
              <p className="mt-0.5 truncate font-heading text-base leading-tight font-semibold text-foreground">
                {growthArea.subject}
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-auto flex items-center gap-3 rounded-2xl border border-[#FFE0C8] bg-[#FFF7F0] p-4"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FF8A3D] text-white">
            <Lightbulb className="size-4" strokeWidth={2.25} />
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{tip}</p>
        </motion.div>
      </div>
    </Card>
  )
}

function DashboardActionCardView({ card }: { card: DashboardActionCard }) {
  const config = actionCardConfig[card.variant]
  const hasSplitFooter = Boolean(
    card.secondaryButtonLabel && card.secondaryHref
  )

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.18, ease: "easeOut" } }}
      className="h-full"
    >
      <Card
        className={cn(
          "group relative flex h-full min-h-[168px] flex-col overflow-hidden rounded-[1.5rem] p-0",
          config.shell
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -top-10 -right-8 size-36 rounded-full blur-2xl",
            config.glow
          )}
          aria-hidden
        />
        <div
          className={cn(
            "pointer-events-none absolute -bottom-12 -left-10 size-32 rounded-full blur-2xl",
            config.glow
          )}
          aria-hidden
        />

        <div className="relative flex min-h-0 flex-1 items-stretch gap-2 p-4 sm:p-5">
          <div className="flex min-w-0 flex-1 flex-col">
            <span
              className={cn(
                "inline-flex w-fit max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-tight",
                config.badge
              )}
            >
              <span className="truncate">{card.badge}</span>
            </span>

            <h3
              className={cn(
                "mt-3 line-clamp-2 font-heading text-[1.15rem] leading-snug font-bold tracking-tight sm:text-[1.25rem]",
                config.title
              )}
            >
              {card.title}
            </h3>

            {card.progressPercent !== undefined ? (
              <div className="mt-3 max-w-[12rem] space-y-1">
                <div
                  className={cn(
                    "flex items-center justify-between text-[10px] font-semibold",
                    config.subtitle
                  )}
                >
                  <span>Progress</span>
                  {card.progressLabel ? (
                    <span>{card.progressLabel}</span>
                  ) : null}
                </div>
                <Progress
                  value={card.progressPercent}
                  className={cn("h-1.5", config.progressTrack)}
                />
              </div>
            ) : card.subtitle ? (
              <p
                className={cn(
                  "mt-2 line-clamp-2 max-w-[18ch] text-xs leading-relaxed sm:text-[13px]",
                  config.subtitle
                )}
              >
                {card.subtitle}
              </p>
            ) : null}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
              {hasSplitFooter ? (
                <Link
                  href={card.secondaryHref!}
                  className={cn(
                    "text-xs font-semibold underline-offset-2 hover:underline",
                    config.secondary
                  )}
                >
                  {card.secondaryButtonLabel}
                </Link>
              ) : null}
              <Button
                asChild
                size="sm"
                className={cn(
                  "h-9 rounded-xl px-4 text-sm font-semibold shadow-none",
                  config.cta
                )}
              >
                <Link href={card.href}>
                  {card.buttonLabel}
                  <ArrowRight className="size-3.5" strokeWidth={2.5} />
                </Link>
              </Button>
            </div>
          </div>

          <motion.div
            className="relative hidden w-[42%] max-w-[140px] shrink-0 self-end sm:block"
            animate={{ y: [0, -5, 0], rotate: [0, -2, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image
              src={card.imageSrc}
              alt={card.imageAlt}
              width={160}
              height={160}
              className="h-auto w-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.18)]"
            />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
