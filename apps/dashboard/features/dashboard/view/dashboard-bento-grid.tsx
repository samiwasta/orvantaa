"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

import type { DashboardQuickLinks } from "@/features/dashboard/model/dashboard-quick-links"
import {
  studyIllustrationSrcForUserGender,
  type UserGender,
} from "@/features/sidebar/model/user-gender"

import { AiTutorPromptCard } from "./ai-tutor-prompt-card"

const glowStyle =
  "pointer-events-none absolute rounded-full bg-white/10 blur-3xl"
const ctaButtonStyle =
  "mt-4 h-9 rounded-lg bg-[#ff9b45] px-4 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(255,155,69,0.95)] transition-all hover:-translate-y-0.5 hover:bg-[#f58d36] sm:h-10"

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

type DashboardBentoGridProps = {
  userGender: UserGender
  quickLinks: DashboardQuickLinks
  userFirstName?: string
}

export function NewLearnerDashboard({
  userGender,
  quickLinks,
  userFirstName,
}: DashboardBentoGridProps) {
  const illustrationSrc = studyIllustrationSrcForUserGender(userGender)

  return (
    <section className="@container/grid flex flex-col gap-5 sm:gap-6 md:gap-8">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <HeroCard
          illustrationSrc={illustrationSrc}
          subjectsHref={quickLinks.subjectsHref}
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-5 sm:gap-6 @[580px]/grid:grid-cols-2 @[1200px]/grid:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <CtaCard
            title="Browse Subjects"
            description="Choose a subject and start learning"
            buttonLabel="Start Reading"
            href={quickLinks.firstReadingHref}
            icon="/book-stack.svg"
            iconAlt="Stack of books"
            gradient="from-[#7f54ee] via-[#7550ea] to-[#6447dd]"
            shadow="shadow-[0_20px_44px_-24px_rgba(108,92,231,0.95)]"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <CtaCard
            title="Take Your First Quiz"
            description="Test your understanding with simple questions"
            buttonLabel="Start Quiz"
            href={quickLinks.firstQuizHref}
            icon="/exam-pad.svg"
            iconAlt="Exam notepad"
            gradient="from-[#178fc8] via-[#139fbd] to-[#10a8b7]"
            shadow="shadow-[0_20px_44px_-24px_rgba(17,166,184,0.95)]"
          />
        </motion.div>
        <motion.div
          variants={fadeUp}
          className="@[580px]/grid:col-span-2 @[1200px]/grid:col-span-1"
        >
          <AiTutorPromptCard className="h-full" userFirstName={userFirstName} />
        </motion.div>
      </motion.div>
    </section>
  )
}

function HeroCard({
  illustrationSrc,
  subjectsHref,
}: {
  illustrationSrc: string
  subjectsHref: string
}) {
  return (
    <Card className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white via-[#faf9ff] to-[#f1eeff] p-4 shadow-[0_14px_34px_-22px_rgba(108,92,231,0.65)] ring-0 sm:p-5 lg:p-8">
      <div className="pointer-events-none absolute top-8 -left-16 size-44 rounded-full bg-[#6c5ce7]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-0 size-48 rounded-full bg-[#8b7cf6]/20 blur-3xl" />

      <div className="@container/hero relative">
        <div className="flex flex-col items-center gap-3 @[540px]/hero:flex-row @[540px]/hero:items-center @[540px]/hero:justify-between @[540px]/hero:gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="hidden h-auto w-full max-w-[280px] @[540px]/hero:order-last @[540px]/hero:block @[540px]/hero:max-w-[320px] @[540px]/hero:self-end"
          >
            <Image
              src={illustrationSrc}
              alt="Student studying at a desk"
              width={400}
              height={300}
              className="h-auto w-full object-contain"
              priority
            />
          </motion.div>

          <div className="flex flex-col">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="inline-flex w-fit items-center rounded-full border border-[#6c5ce7]/20 bg-[#6c5ce7]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#5d4ed6] uppercase"
            >
              New learner journey
            </motion.p>
            <motion.h3
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.12,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-2.5 font-heading text-xl font-semibold tracking-tight text-foreground xl:mt-4 @[540px]/hero:text-2xl @[540px]/hero:whitespace-nowrap"
            >
              Start your first lesson
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground xl:mt-3 @[540px]/hero:text-sm"
            >
              Explore subjects, begin your first chapter, and track your
              progress as you learn.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                asChild
                size="lg"
                className="mt-4 h-11 w-full self-start rounded-xl bg-[#6c5ce7] px-4 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(108,92,231,0.95)] transition-all hover:bg-[#5d4ed6] xl:mt-6 @[540px]/hero:w-auto @[540px]/hero:px-5"
              >
                <Link href={subjectsHref}>Explore Subjects</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function CtaCard({
  title,
  description,
  buttonLabel,
  href,
  icon,
  iconAlt,
  gradient,
  shadow,
}: {
  title: string
  description: string
  buttonLabel: string
  href: string
  icon: string
  iconAlt: string
  gradient: string
  shadow: string
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.015,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card
        className={`relative h-full overflow-hidden rounded-3xl bg-linear-to-br ${gradient} p-0 text-white ring-0 ${shadow}`}
      >
        <div
          className={`${glowStyle} top-1/2 -left-10 size-40 -translate-y-1/2`}
        />
        <div className={`${glowStyle} -top-10 -right-12 size-44`} />
        <CardHeader className="relative flex flex-row items-end justify-between gap-4 p-5 sm:p-6">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold tracking-tight whitespace-nowrap text-white">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 min-h-10 max-w-[22ch] text-sm leading-5 text-white/90">
              {description}
            </CardDescription>
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
              <Button asChild className={ctaButtonStyle}>
                <Link href={href}>{buttonLabel}</Link>
              </Button>
            </motion.div>
          </div>
          <motion.div
            whileHover={{
              rotate: -5,
              scale: 1.08,
              transition: { duration: 0.2 },
            }}
          >
            <Image
              src={icon}
              alt={iconAlt}
              width={112}
              height={112}
              className="size-[88px] shrink-0 self-end object-contain sm:size-[100px]"
            />
          </motion.div>
        </CardHeader>
      </Card>
    </motion.div>
  )
}
