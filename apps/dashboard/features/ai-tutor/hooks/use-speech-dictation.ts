"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  type BrowserSpeechRecognition,
  getSpeechRecognitionCtor,
  joinDictationText,
} from "../model/speech-recognition"

type UseSpeechDictationOptions = {
  lang?: string
  onError?: (message: string) => void
}

export function useSpeechDictation({
  lang = "en-IN",
  onError,
}: UseSpeechDictationOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const listeningRef = useRef(false)
  const prefixRef = useRef("")
  const finalsRef = useRef("")
  const onChangeRef = useRef<(value: string) => void>(() => {})

  useEffect(() => {
    setIsSupported(getSpeechRecognitionCtor() !== null)
  }, [])

  const stop = useCallback(() => {
    listeningRef.current = false
    setIsListening(false)
    recognitionRef.current?.stop()
    recognitionRef.current = null
  }, [])

  const start = useCallback(
    (currentValue: string, onChange: (value: string) => void) => {
      const Ctor = getSpeechRecognitionCtor()
      if (!Ctor) {
        onError?.("Voice input is not supported in this browser.")
        return
      }

      onChangeRef.current = onChange
      prefixRef.current = currentValue
      finalsRef.current = ""

      const recognition = new Ctor()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = lang

      recognition.onresult = (event) => {
        let interim = ""

        for (
          let index = event.resultIndex;
          index < event.results.length;
          index++
        ) {
          const result = event.results[index]
          if (!result) continue

          const transcript = result[0]?.transcript ?? ""
          if (!transcript) continue

          if (result.isFinal) {
            finalsRef.current = joinDictationText(finalsRef.current, transcript)
          } else {
            interim = joinDictationText(interim, transcript)
          }
        }

        let display = prefixRef.current
        if (finalsRef.current) {
          display = joinDictationText(display, finalsRef.current)
        }
        if (interim) {
          display = joinDictationText(display, interim)
        }

        onChangeRef.current(display)
      }

      recognition.onerror = (event) => {
        if (event.error === "aborted" || event.error === "no-speech") return

        listeningRef.current = false
        setIsListening(false)
        recognitionRef.current = null

        if (event.error === "not-allowed") {
          onError?.("Microphone access was denied.")
          return
        }

        onError?.("Voice input failed. Please try again.")
      }

      recognition.onend = () => {
        if (!listeningRef.current) return

        try {
          recognition.start()
        } catch {
          listeningRef.current = false
          setIsListening(false)
          recognitionRef.current = null
        }
      }

      recognitionRef.current = recognition
      listeningRef.current = true
      setIsListening(true)

      try {
        recognition.start()
      } catch {
        listeningRef.current = false
        setIsListening(false)
        recognitionRef.current = null
        onError?.("Could not start voice input.")
      }
    },
    [lang, onError]
  )

  const toggle = useCallback(
    (currentValue: string, onChange: (value: string) => void) => {
      if (listeningRef.current) {
        stop()
        return
      }

      start(currentValue, onChange)
    },
    [start, stop]
  )

  useEffect(() => {
    return () => {
      listeningRef.current = false
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  return { isListening, isSupported, toggle, stop }
}
