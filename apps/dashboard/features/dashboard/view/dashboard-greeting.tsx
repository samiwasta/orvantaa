"use client"

import { motion } from "framer-motion"

import { getTimeBasedSalutation } from "../model/time-based-greeting"

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function DashboardGreeting({
  firstName,
  serverHour,
  hasLearningActivity,
}: {
  firstName: string
  serverHour: number
  hasLearningActivity: boolean
}) {
  const salutation = getTimeBasedSalutation(serverHour)
  const name = firstName.trim() || "there"

  return (
    <motion.div
      className="flex flex-col gap-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        variants={itemVariants}
        className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl"
      >
        {salutation}, {name}! 👋🏻
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="text-base text-muted-foreground"
      >
        {hasLearningActivity
          ? "Welcome back. Pick up where you left off."
          : "Let's start your learning journey."}
      </motion.p>
    </motion.div>
  )
}
