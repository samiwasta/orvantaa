"use client"

import { IconlySearchFilled } from "@workspace/icons"
import { Card } from "@workspace/ui/components/card"
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query"
import { cn } from "@workspace/ui/lib/utils"
import { motion, useInView } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useChatAttachments } from "@/features/ai-tutor/hooks/use-chat-attachments"
import { useSpeechDictation } from "@/features/ai-tutor/hooks/use-speech-dictation"
import {
  buildAiTutorGreetingHi,
  buildAiTutorGreetingPrompt,
} from "@/features/ai-tutor/model/ai-tutor-greeting"
import {
  aiTutorChatHref,
  NEW_CHAT_ID,
} from "@/features/ai-tutor/model/chat-data"
import { setPendingChatMessage } from "@/features/ai-tutor/model/pending-chat-message"
import { stashChatUploads } from "@/features/ai-tutor/model/pending-chat-uploads"
import { AiTutorComposer } from "@/features/ai-tutor/view/ai-tutor-composer"

type AiTutorPromptCardProps = {
  userFirstName?: string
  placeholder?: string
  className?: string
}

function TypingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="size-1.5 animate-bounce rounded-full bg-[#4169E1]/50 [animation-delay:0ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-[#4169E1]/40 [animation-delay:140ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-[#4169E1]/30 [animation-delay:280ms]" />
    </div>
  )
}

function AssistantChatBubble({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(
        "w-fit max-w-[90%] rounded-2xl rounded-bl-md border border-[#E8EEFF] bg-white px-3.5 py-2.5 shadow-[0_2px_10px_-6px_rgba(65,105,225,0.18)]",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

function useTypewriter(text: string, active: boolean, speed = 20) {
  const [visibleText, setVisibleText] = useState("")
  const isComplete = active && visibleText.length >= text.length

  useEffect(() => {
    if (!active) {
      setVisibleText("")
      return
    }

    let index = 0
    setVisibleText("")

    const interval = window.setInterval(() => {
      index += 1
      setVisibleText(text.slice(0, index))
      if (index >= text.length) {
        window.clearInterval(interval)
      }
    }, speed)

    return () => window.clearInterval(interval)
  }, [active, text, speed])

  return { visibleText, isComplete }
}

type ChatPhase = "typing1" | "message1" | "typing2" | "message2"

function AiTutorChatPreview({
  firstName,
  enabled,
}: {
  firstName?: string
  enabled: boolean
}) {
  const greeting = useMemo(() => buildAiTutorGreetingHi(firstName), [firstName])
  const prompt = useMemo(() => buildAiTutorGreetingPrompt(), [])
  const [phase, setPhase] = useState<ChatPhase>("typing1")

  const { visibleText: greetingText, isComplete: greetingComplete } =
    useTypewriter(greeting, enabled && phase === "message1")
  const { visibleText: promptText, isComplete: promptComplete } = useTypewriter(
    prompt,
    enabled && phase === "message2"
  )

  useEffect(() => {
    setPhase("typing1")
  }, [greeting, prompt, enabled])

  useEffect(() => {
    if (!enabled || phase !== "typing1") return
    const timer = window.setTimeout(() => setPhase("message1"), 600)
    return () => window.clearTimeout(timer)
  }, [enabled, phase, greeting, prompt])

  useEffect(() => {
    if (!enabled || phase !== "message1" || !greetingComplete) return
    const timer = window.setTimeout(() => setPhase("typing2"), 400)
    return () => window.clearTimeout(timer)
  }, [enabled, phase, greetingComplete])

  useEffect(() => {
    if (!enabled || phase !== "typing2") return
    const timer = window.setTimeout(() => setPhase("message2"), 600)
    return () => window.clearTimeout(timer)
  }, [enabled, phase])

  const greetingDisplay =
    phase === "message1" ? greetingText : phase !== "typing1" ? greeting : ""

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-end gap-2">
      {phase === "typing1" ? (
        <AssistantChatBubble>
          <TypingDots />
        </AssistantChatBubble>
      ) : (
        <AssistantChatBubble>
          <p className="text-[13px] leading-relaxed text-foreground/85">
            {greetingDisplay}
            {phase === "message1" && !greetingComplete ? (
              <span className="ml-0.5 inline-block h-[1em] w-px animate-pulse bg-[#4169E1]/60" />
            ) : null}
          </p>
        </AssistantChatBubble>
      )}

      {phase === "typing2" || phase === "message2" ? (
        phase === "typing2" ? (
          <AssistantChatBubble>
            <TypingDots />
          </AssistantChatBubble>
        ) : (
          <AssistantChatBubble>
            <p className="text-[13px] leading-relaxed text-foreground/85">
              {promptText}
              {!promptComplete ? (
                <span className="ml-0.5 inline-block h-[1em] w-px animate-pulse bg-[#4169E1]/60" />
              ) : null}
            </p>
          </AssistantChatBubble>
        )
      ) : null}
    </div>
  )
}

export function AiTutorPromptCard({
  userFirstName,
  placeholder = "Ask anything...",
  className,
}: AiTutorPromptCardProps) {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const isBelowLg = useMediaQuery("(max-width: 1023px)")
  const inView = useInView(cardRef, { once: true, margin: "-40px" })
  const animationEnabled = mounted && (!isBelowLg || inView)
  const [input, setInput] = useState("")
  const [dictationError, setDictationError] = useState<string | null>(null)
  const {
    attachments: composerAttachments,
    error: attachmentError,
    isPreparing: isPreparingAttachments,
    addFiles,
    removeAttachment,
    getUploadFiles,
    clearAttachments,
  } = useChatAttachments()
  const {
    isListening,
    isSupported,
    toggle: toggleDictation,
    stop: stopDictation,
  } = useSpeechDictation({
    onError: setDictationError,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const submit = () => {
    const trimmed = input.trim()
    const uploadFiles = getUploadFiles()
    if (!trimmed && uploadFiles.length === 0) return

    stopDictation()
    setDictationError(null)

    if (trimmed) {
      setPendingChatMessage(trimmed)
    }

    if (uploadFiles.length > 0) {
      stashChatUploads(NEW_CHAT_ID, uploadFiles)
    }

    clearAttachments({ revokePreviews: false })
    setInput("")
    router.push(aiTutorChatHref(NEW_CHAT_ID))
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        "flex h-full min-h-[280px] flex-col gap-0 overflow-hidden rounded-2xl border border-[#E8EEFF]/90 bg-white py-0 shadow-[0_6px_24px_-10px_rgba(65,105,225,0.12)]",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-[#f0f4ff] bg-[#fafbff] px-5 py-3.5 sm:px-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F4FF] text-[#4169E1] ring-1 ring-[#E0E7FF]">
          <IconlySearchFilled size={18} color="currentColor" />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            AI Tutor
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Ask anything about your studies
          </p>
        </div>
      </div>

      <div className="relative flex min-h-[6.5rem] flex-1 flex-col bg-gradient-to-b from-[#FAFBFF] to-white px-5 py-4 sm:px-6">
        <AiTutorChatPreview
          firstName={userFirstName}
          enabled={animationEnabled}
        />
      </div>

      <div className="border-t border-[#f0f4ff] bg-white px-4 py-3.5 sm:px-5 sm:py-4">
        <AiTutorComposer
          className="w-full"
          variant="premium"
          value={input}
          onChange={(value) => {
            setDictationError(null)
            if (isListening) stopDictation()
            setInput(value)
          }}
          onSubmit={submit}
          placeholder={placeholder}
          isListening={isListening}
          dictationSupported={isSupported}
          dictationError={dictationError}
          onToggleDictation={() => {
            setDictationError(null)
            toggleDictation(input, setInput)
          }}
          attachments={composerAttachments.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
            kind: attachment.kind,
            previewUrl: attachment.previewUrl,
          }))}
          attachmentError={attachmentError}
          isPreparingAttachments={isPreparingAttachments}
          onAddFiles={(files) => {
            void addFiles(files)
          }}
          onRemoveAttachment={removeAttachment}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
        />
      </div>
    </Card>
  )
}
