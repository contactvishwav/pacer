'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  content: string
  isFallback?: boolean
  isStreaming?: boolean
}

interface Conversation {
  id: string
  contextType: string
  title: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function updateLastMessage(
  messages: Message[],
  content: string,
  isFallback: boolean,
): Message[] {
  const updated = [...messages]
  if (updated.length === 0) return updated
  updated[updated.length - 1] = {
    ...updated[updated.length - 1],
    content,
    isFallback,
  }
  return updated
}

function renderContent(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line}
    </span>
  ))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SIGNAL_CHIPS = ['Training phase', 'ACWR', 'Race goal', 'Workout intent', 'Weekly load']

const SUGGESTED_QUESTIONS = [
  'How is my training going?',
  'Am I at risk of injury?',
  'Am I on track for my race goal?',
]

interface ChatHeaderProps {
  activityLabel: string | null
}

function ChatHeader({ activityLabel }: ChatHeaderProps) {
  return (
    <div className="shrink-0 border-b border-border bg-background/95 px-4 py-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold tracking-tight text-foreground">Pacer Coach</h1>
          <p className="text-xs text-muted-foreground">AI-powered training intelligence</p>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/8 px-2.5 py-1 text-[10px] text-amber-400/90">
          Training guidance only, not medical advice.
        </span>
      </div>

      {/* Context pill */}
      {activityLabel && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="rounded-full border border-primary/25 bg-primary/8 px-2.5 py-0.5 text-[10px] text-primary">
            Analyzing: {activityLabel}
          </span>
        </div>
      )}

      {/* Intelligence signals */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {SIGNAL_CHIPS.map(chip => (
          <span
            key={chip}
            className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}

interface SuggestedQuestionsProps {
  onSelect: (q: string) => void
}

function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-8 text-center">
      <div className="space-y-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">Ask your coach anything</p>
        <p className="text-xs text-muted-foreground">
          Your coach has full context on your training phase, load, and race goal.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {SUGGESTED_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="rounded-2xl border border-border bg-muted/40 px-5 py-3 text-sm font-medium text-foreground/85 shadow-sm transition-all hover:border-primary/40 hover:bg-primary/8 hover:text-primary hover:shadow-[0_0_12px_rgba(249,115,22,0.15)]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

interface UserBubbleProps {
  content: string
}

function UserBubble({ content }: UserBubbleProps) {
  return (
    <div className="flex justify-end px-4">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary/15 px-4 py-2.5 text-sm text-foreground">
        {renderContent(content)}
      </div>
    </div>
  )
}

interface AssistantBubbleProps {
  message: Message
}

function AssistantBubble({ message }: AssistantBubbleProps) {
  const isEmpty = !message.content && message.isStreaming

  return (
    <div className="flex flex-col gap-1.5 px-4">
      {/* Fallback notice */}
      {message.isFallback && !message.isStreaming && (
        <span className="ml-1 text-[10px] text-muted-foreground">
          AI coaching unavailable — showing computed analysis
        </span>
      )}

      {/* Message card */}
      <div className="max-w-[82%]">
        <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm text-foreground/90 leading-relaxed">
          {isEmpty ? (
            /* Waiting for first token */
            <div className="flex items-center gap-2 py-1">
              <span className="flex gap-1">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
            </div>
          ) : (
            <>
              {renderContent(message.content)}
              {/* Blinking streaming cursor */}
              {message.isStreaming && (
                <span className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[2px] animate-pulse bg-primary/70" />
              )}
            </>
          )}
        </div>

        {/* Source label — fades in after streaming ends */}
        {!message.isStreaming && message.content && (
          <p className="animate-in fade-in ml-1 mt-1 text-[10px] text-muted-foreground duration-500">
            {message.isFallback ? 'Computed analysis' : 'Powered by Claude'}
          </p>
        )}
      </div>
    </div>
  )
}

interface InitErrorProps {
  onRetry: () => void
}

function InitError({ onRetry }: InitErrorProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Failed to connect to coach</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Make sure the database is seeded and try again.
        </p>
      </div>
      <Button
        onClick={onRetry}
        variant="outline"
        size="sm"
        className="border-border text-foreground hover:bg-muted"
      >
        Retry
      </Button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CoachPage() {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState(false)
  const [activityLabel, setActivityLabel] = useState<string | null>(null)

  const conversationAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll when messages update (including streaming updates)
  useEffect(() => {
    if (conversationAreaRef.current) {
      conversationAreaRef.current.scrollTop = conversationAreaRef.current.scrollHeight
    }
  }, [messages])

  // Initialize conversation on mount
  const initConversation = useCallback(async () => {
    setIsInitializing(true)
    setInitError(false)

    let prefillQuestion: string | null = null
    let activityId: string | null = null

    try {
      prefillQuestion = sessionStorage.getItem('coach_prefill_question')
      activityId = sessionStorage.getItem('coach_activity_id')
      sessionStorage.removeItem('coach_prefill_question')
      sessionStorage.removeItem('coach_activity_id')
    } catch {
      // sessionStorage unavailable in SSR or private browsing
    }

    try {
      const contextType = activityId ? 'ACTIVITY' : 'GENERAL'
      const body: Record<string, string> = { contextType }
      if (activityId) body.activityId = activityId

      const res = await fetch('/api/coach/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json() as {
        success: boolean
        data?: { conversationId: string; contextType: string; title: string }
        error?: string
      }
      if (!json.success || !json.data) {
        throw new Error(json.error ?? 'Unexpected response')
      }

      setConversation({
        id: json.data.conversationId,
        contextType: json.data.contextType,
        title: json.data.title,
      })

      if (activityId) setActivityLabel('Activity Debrief')

      if (prefillQuestion) {
        setInputValue(prefillQuestion)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    } catch (err) {
      console.error('[Coach] Failed to init conversation:', err)
      setInitError(true)
      toast.error('Failed to connect to coach. Please try again.')
    } finally {
      setIsInitializing(false)
    }
  }, [])

  useEffect(() => { initConversation() }, [initConversation])

  // Send message + stream response
  const sendMessage = useCallback(async (message: string) => {
    if (!conversation || isStreaming || !message.trim()) return

    const trimmed = message.trim()

    // Append user message immediately
    setMessages(prev => [...prev, { role: 'user', content: trimmed }])
    setInputValue('')
    setIsStreaming(true)

    // Append placeholder assistant message (streaming)
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }])

    try {
      const response = await fetch(
        `/api/coach/conversations/${conversation.id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        },
      )

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let isFallback = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        // Detect and strip the fallback sentinel (prepended by backend when API key absent)
        if (fullText.startsWith('__FALLBACK__\n')) {
          isFallback = true
          fullText = fullText.replace('__FALLBACK__\n', '')
        }

        setMessages(prev => updateLastMessage(prev, fullText, isFallback))
      }

      // Mark streaming complete
      setMessages(prev => {
        if (prev.length === 0) return prev
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          isStreaming: false,
        }
        return updated
      })
    } catch (err) {
      console.error('[Coach] Streaming failed:', err)
      toast.error('Coach response failed. Try again.')
      // Remove the empty assistant placeholder
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last?.role === 'assistant' && last.content === '') {
          return prev.slice(0, -1)
        }
        return prev
      })
    } finally {
      setIsStreaming(false)
    }
  }, [conversation, isStreaming])

  const handleSuggestedQuestion = useCallback((q: string) => {
    setInputValue(q)
    // Send immediately
    sendMessage(q)
  }, [sendMessage])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const hasMessages = messages.length > 0
  const inputDisabled = isStreaming || isInitializing || !conversation || initError

  return (
    // -mb-12 cancels the main layout's pb-12 so the chat fills the viewport exactly
    <div className="-mb-12 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>

      {/* ── Header ── */}
      <ChatHeader activityLabel={activityLabel} />

      {/* ── Conversation area ── */}
      <div
        ref={conversationAreaRef}
        className="min-h-0 flex-1 overflow-y-auto py-4"
      >
        {initError ? (
          <InitError onRetry={initConversation} />
        ) : !hasMessages && !isInitializing ? (
          <SuggestedQuestions onSelect={handleSuggestedQuestion} />
        ) : isInitializing ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <span className="flex gap-1">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
              <p className="text-xs text-muted-foreground">Connecting to coach…</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) =>
              msg.role === 'user' ? (
                <UserBubble key={i} content={msg.content} />
              ) : (
                <AssistantBubble key={i} message={msg} />
              ),
            )}
          </div>
        )}
      </div>

      {/* ── Input area ── */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your coach…"
              disabled={inputDisabled}
              rows={1}
              className={cn(
                'w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground',
                'focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'max-h-32 overflow-y-auto leading-relaxed',
              )}
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
          </div>

          <Button
            onClick={() => sendMessage(inputValue)}
            disabled={inputDisabled || !inputValue.trim()}
            className={cn(
              'h-11 w-11 shrink-0 rounded-xl p-0',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-40',
            )}
          >
            {isStreaming ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            )}
          </Button>
        </div>

        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          {isStreaming
            ? 'Coach is responding…'
            : 'Enter to send · Shift+Enter for new line'}
        </p>
      </div>
    </div>
  )
}
