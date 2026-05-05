'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Session {
  id:           string
  name:         string
  createdAt:    string
  updatedAt:    string
  messageCount: number
}

interface Message {
  role:        'user' | 'assistant'
  content:     string
  isFallback?: boolean
  isStreaming?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function updateLastMessage(
  messages: Message[],
  content: string,
  isFallback: boolean,
): Message[] {
  const updated = [...messages]
  if (updated.length === 0) return updated
  updated[updated.length - 1] = { ...updated[updated.length - 1], content, isFallback }
  return updated
}

function renderContent(text: string): React.ReactNode {
  return text.split('\n').map((line, i) => (
    <span key={i}>{i > 0 && <br />}{line}</span>
  ))
}

function relativeTime(iso: string): string {
  const diffMs  = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1)  return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d ago`
}

// ─── Sidebar sub-components ───────────────────────────────────────────────────

interface SessionRowProps {
  session:    Session
  isActive:   boolean
  onSelect:   () => void
  onRename:   (name: string) => void
  onDelete:   () => void
}

function SessionRow({ session, isActive, onSelect, onRename, onDelete }: SessionRowProps) {
  const [editing, setEditing]     = useState(false)
  const [editValue, setEditValue] = useState(session.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setEditValue(session.name)
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [editing, session.name])

  function commitRename() {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== session.name) onRename(trimmed)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter')  { e.preventDefault(); commitRename() }
    if (e.key === 'Escape') { setEditing(false); setEditValue(session.name) }
  }

  return (
    <div
      onClick={() => { if (!editing) onSelect() }}
      className={cn(
        'group relative flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors',
        isActive
          ? 'bg-primary/12 text-foreground'
          : 'text-zinc-300 hover:bg-muted/40 hover:text-foreground',
      )}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitRename}
          onClick={e => e.stopPropagation()}
          className="w-full rounded bg-muted/60 px-1 py-0.5 text-sm text-foreground outline-none ring-1 ring-primary/40"
        />
      ) : (
        <span className="truncate text-sm font-medium leading-snug">
          {session.name}
        </span>
      )}

      <span className="text-[10px] text-muted-foreground">
        {relativeTime(session.updatedAt)}
      </span>

      {/* Action buttons — visible on hover or when active */}
      {!editing && (
        <div
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1',
            'opacity-0 transition-opacity group-hover:opacity-100',
            isActive && 'opacity-100',
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Rename */}
          <button
            title="Rename"
            onClick={() => setEditing(true)}
            className="rounded p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
          </button>
          {/* Delete */}
          <button
            title="Delete conversation"
            onClick={() => {
              if (confirm(`Delete "${session.name}"? This cannot be undone.`)) onDelete()
            }}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  sessions:        Session[]
  activeSessionId: string | null
  onSelect:        (id: string) => void
  onNew:           () => void
  onRename:        (id: string, name: string) => void
  onDelete:        (id: string) => void
  isOpen:          boolean
  onClose:         () => void
}

function Sidebar({ sessions, activeSessionId, onSelect, onNew, onRename, onDelete, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'flex flex-col border-r border-border bg-background/98 transition-transform duration-200',
          // Desktop: always visible, fixed width
          'md:relative md:w-[260px] md:translate-x-0 md:flex',
          // Mobile: absolute overlay, toggled
          'fixed inset-y-0 left-0 z-30 w-[260px]',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Conversations
          </span>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground md:hidden"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New conversation button */}
        <div className="shrink-0 p-2">
          <button
            onClick={onNew}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
              'border border-dashed border-border text-muted-foreground',
              'transition-colors hover:border-primary/40 hover:bg-primary/8 hover:text-primary',
            )}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New conversation
          </button>
        </div>

        {/* Session list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {sessions.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No conversations yet.
            </p>
          ) : (
            <div className="space-y-0.5">
              {sessions.map(s => (
                <SessionRow
                  key={s.id}
                  session={s}
                  isActive={s.id === activeSessionId}
                  onSelect={() => onSelect(s.id)}
                  onRename={name => onRename(s.id, name)}
                  onDelete={() => onDelete(s.id)}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── Chat panel sub-components ────────────────────────────────────────────────

const SIGNAL_CHIPS = ['Training phase', 'ACWR', 'Race goal', 'Workout intent', 'Weekly load']
const SUGGESTED_QUESTIONS = [
  'How is my training going?',
  'Am I at risk of injury?',
  'Am I on track for my race goal?',
]

function ChatHeader({ activityLabel, onMenuOpen }: { activityLabel: string | null; onMenuOpen: () => void }) {
  return (
    <div className="shrink-0 border-b border-border bg-background/95 px-4 py-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Mobile sidebar toggle */}
          <button
            onClick={onMenuOpen}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground md:hidden"
            aria-label="Open conversations"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold tracking-tight text-foreground">Pacer Coach</h1>
            <p className="text-xs text-zinc-300">AI-powered training intelligence</p>
          </div>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/8 px-2.5 py-1 text-[10px] text-amber-400/90">
          Training guidance only, not medical advice.
        </span>
      </div>

      {activityLabel && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="rounded-full border border-primary/25 bg-primary/8 px-2.5 py-0.5 text-[10px] text-primary">
            Analyzing: {activityLabel}
          </span>
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {SIGNAL_CHIPS.map(chip => (
          <span key={chip} className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[10px] text-zinc-300">
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}

function SuggestedQuestions({ onSelect }: { onSelect: (q: string) => void }) {
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

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end px-4">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary/15 px-4 py-2.5 text-sm text-foreground/95">
        {renderContent(content)}
      </div>
    </div>
  )
}

function AssistantBubble({ message }: { message: Message }) {
  const isEmpty = !message.content && message.isStreaming
  return (
    <div className="flex flex-col gap-1.5 px-4">
      {message.isFallback && !message.isStreaming && (
        <span className="ml-1 text-[10px] text-muted-foreground">
          AI coaching unavailable — showing computed analysis
        </span>
      )}
      <div className="max-w-[82%]">
        <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm text-foreground leading-relaxed">
          {isEmpty ? (
            <div className="flex items-center gap-2 py-1">
              <span className="flex gap-1">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </span>
            </div>
          ) : (
            <>
              {renderContent(message.content)}
              {message.isStreaming && (
                <span className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[2px] animate-pulse bg-primary/70" />
              )}
            </>
          )}
        </div>
        {!message.isStreaming && message.content && (
          <p className="animate-in fade-in ml-1 mt-1 text-[10px] text-muted-foreground duration-500">
            {message.isFallback ? 'Computed analysis' : 'Powered by Claude'}
          </p>
        )}
      </div>
    </div>
  )
}

function InitError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Failed to connect to coach</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Make sure the database is seeded and try again.</p>
      </div>
      <Button onClick={onRetry} variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
        Retry
      </Button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CoachPage() {
  const [sessions,        setSessions]        = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages,        setMessages]        = useState<Message[]>([])
  const [inputValue,      setInputValue]      = useState('')
  const [isStreaming,     setIsStreaming]      = useState(false)
  const [isInitializing,  setIsInitializing]  = useState(true)
  const [isLoadingMsgs,   setIsLoadingMsgs]   = useState(false)
  const [initError,       setInitError]       = useState(false)
  const [activityLabel,   setActivityLabel]   = useState<string | null>(null)
  const [activityId,      setActivityId]      = useState<string | null>(null)
  const [sidebarOpen,     setSidebarOpen]     = useState(false)
  // Track first-message status per session for auto-rename
  const isFirstMessageRef = useRef<Record<string, boolean>>({})

  const conversationAreaRef = useRef<HTMLDivElement>(null)
  const inputRef            = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (conversationAreaRef.current) {
      conversationAreaRef.current.scrollTop = conversationAreaRef.current.scrollHeight
    }
  }, [messages])

  // ── Load sessions list ──────────────────────────────────────────────────────

  const loadSessions = useCallback(async (): Promise<Session[]> => {
    const res = await fetch('/api/coach/sessions')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as { success: boolean; data?: { sessions: Session[] } }
    if (!json.success || !json.data) throw new Error('Unexpected response')
    return json.data.sessions
  }, [])

  // ── Create new session ──────────────────────────────────────────────────────

  const createSession = useCallback(async (): Promise<Session> => {
    const res = await fetch('/api/coach/sessions', { method: 'POST' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as { success: boolean; data?: Session }
    if (!json.success || !json.data) throw new Error('Unexpected response')
    return json.data
  }, [])

  // ── Load messages for a session ─────────────────────────────────────────────

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    setIsLoadingMsgs(true)
    try {
      const res = await fetch(`/api/coach/sessions/${sessionId}/messages`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as {
        success: boolean
        data?: { messages: Array<{ role: string; content: string }> }
      }
      if (!json.success || !json.data) throw new Error('Unexpected response')
      const loaded = json.data.messages.map(m => ({
        role:    m.role as 'user' | 'assistant',
        content: m.content,
      }))
      setMessages(loaded)
      // Track whether this session has existing messages for auto-rename logic
      isFirstMessageRef.current[sessionId] = loaded.length === 0
    } catch (err) {
      console.error('[Coach] Failed to load messages:', err)
      setMessages([])
      isFirstMessageRef.current[sessionId] = true
    } finally {
      setIsLoadingMsgs(false)
    }
  }, [])

  // ── Initialize on mount ─────────────────────────────────────────────────────

  const initialize = useCallback(async () => {
    setIsInitializing(true)
    setInitError(false)

    let prefillQuestion: string | null = null
    let prefillActivityId: string | null = null

    try {
      prefillQuestion   = sessionStorage.getItem('coach_prefill_question')
      prefillActivityId = sessionStorage.getItem('coach_activity_id')
      sessionStorage.removeItem('coach_prefill_question')
      sessionStorage.removeItem('coach_activity_id')
    } catch { /* sessionStorage unavailable */ }

    try {
      const existingSessions = await loadSessions()
      setSessions(existingSessions)

      let targetSessionId: string

      if (prefillQuestion) {
        // Prefill always opens a fresh named session
        const newSession = await createSession()
        setSessions(prev => [newSession, ...prev])
        targetSessionId = newSession.id
        isFirstMessageRef.current[newSession.id] = true
        if (prefillActivityId) setActivityLabel('Activity Debrief')
        setActivityId(prefillActivityId)
      } else if (existingSessions.length > 0) {
        // Resume most recent session
        targetSessionId = existingSessions[0].id
      } else {
        // No sessions yet — create one
        const newSession = await createSession()
        setSessions([newSession])
        targetSessionId = newSession.id
        isFirstMessageRef.current[newSession.id] = true
      }

      setActiveSessionId(targetSessionId)
      await loadSessionMessages(targetSessionId)

      if (prefillQuestion) {
        setInputValue(prefillQuestion)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    } catch (err) {
      console.error('[Coach] Failed to initialize:', err)
      setInitError(true)
      toast.error('Failed to connect to coach. Please try again.')
    } finally {
      setIsInitializing(false)
    }
  }, [loadSessions, createSession, loadSessionMessages])

  useEffect(() => { initialize() }, [initialize])

  // ── Switch session ──────────────────────────────────────────────────────────

  const selectSession = useCallback(async (sessionId: string) => {
    if (sessionId === activeSessionId || isStreaming) return
    setSidebarOpen(false)
    setActivityLabel(null)
    setActivityId(null)
    setActiveSessionId(sessionId)
    await loadSessionMessages(sessionId)
  }, [activeSessionId, isStreaming, loadSessionMessages])

  // ── New conversation ────────────────────────────────────────────────────────

  const handleNewConversation = useCallback(async () => {
    if (isStreaming) return
    setSidebarOpen(false)
    try {
      const newSession = await createSession()
      setSessions(prev => [newSession, ...prev])
      setActiveSessionId(newSession.id)
      setMessages([])
      setActivityLabel(null)
      setActivityId(null)
      isFirstMessageRef.current[newSession.id] = true
    } catch (err) {
      console.error('[Coach] Failed to create session:', err)
      toast.error('Failed to create new conversation.')
    }
  }, [isStreaming, createSession])

  // ── Rename session ──────────────────────────────────────────────────────────

  const handleRename = useCallback(async (sessionId: string, name: string) => {
    try {
      const res = await fetch(`/api/coach/sessions/${sessionId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name }),
      })
      if (!res.ok) return
      const json = await res.json() as { success: boolean; data?: Session }
      if (json.success && json.data) {
        setSessions(prev => prev.map(s => s.id === sessionId ? json.data! : s))
      }
    } catch (err) {
      console.error('[Coach] Rename failed:', err)
    }
  }, [])

  // ── Delete session ──────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/coach/sessions/${sessionId}`, { method: 'DELETE' })
      if (!res.ok) return
      const remaining = sessions.filter(s => s.id !== sessionId)
      setSessions(remaining)

      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id)
          await loadSessionMessages(remaining[0].id)
        } else {
          // Create a fresh session when deleting the last one
          const newSession = await createSession()
          setSessions([newSession])
          setActiveSessionId(newSession.id)
          setMessages([])
          isFirstMessageRef.current[newSession.id] = true
        }
        setActivityLabel(null)
        setActivityId(null)
      }
    } catch (err) {
      console.error('[Coach] Delete failed:', err)
      toast.error('Failed to delete conversation.')
    }
  }, [activeSessionId, sessions, loadSessionMessages, createSession])

  // ── Auto-rename after first message ────────────────────────────────────────

  const autoRename = useCallback(async (sessionId: string, firstMessage: string) => {
    const name = firstMessage.trim().slice(0, 40) + (firstMessage.trim().length > 40 ? '…' : '')
    await handleRename(sessionId, name)
  }, [handleRename])

  // ── Send message ────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (message: string) => {
    if (!activeSessionId || isStreaming || !message.trim()) return
    const trimmed = message.trim()
    const isFirst = isFirstMessageRef.current[activeSessionId] ?? false

    setMessages(prev => [...prev, { role: 'user', content: trimmed }])
    setInputValue('')
    setIsStreaming(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }])

    try {
      const body: Record<string, string> = { message: trimmed }
      if (activityId) body.activityId = activityId

      const response = await fetch(
        `/api/coach/sessions/${activeSessionId}/messages`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        },
      )

      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`)

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText  = ''
      let isFallback = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText   += chunk
        if (fullText.startsWith('__FALLBACK__\n')) {
          isFallback = true
          fullText   = fullText.replace('__FALLBACK__\n', '')
        }
        setMessages(prev => updateLastMessage(prev, fullText, isFallback))
      }

      // Mark streaming done
      setMessages(prev => {
        if (prev.length === 0) return prev
        const updated = [...prev]
        updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false }
        return updated
      })

      // Auto-rename after first message
      if (isFirst) {
        isFirstMessageRef.current[activeSessionId] = false
        void autoRename(activeSessionId, trimmed)
      }

      // Refresh session list to show updated timestamp and message count
      loadSessions().then(setSessions).catch(() => { /* non-fatal */ })

    } catch (err) {
      console.error('[Coach] Streaming failed:', err)
      toast.error('Coach response failed. Try again.')
      setMessages(prev => {
        const last = prev[prev.length - 1]
        return last?.role === 'assistant' && last.content === '' ? prev.slice(0, -1) : prev
      })
    } finally {
      setIsStreaming(false)
    }
  }, [activeSessionId, isStreaming, activityId, autoRename, loadSessions])

  const handleSuggestedQuestion = useCallback((q: string) => {
    setInputValue(q)
    sendMessage(q)
  }, [sendMessage])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue) }
  }

  const hasMessages  = messages.length > 0
  const inputDisabled = isStreaming || isInitializing || !activeSessionId || initError

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="-mb-12 flex overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>

      {/* ── Left sidebar ── */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={selectSession}
        onNew={handleNewConversation}
        onRename={handleRename}
        onDelete={handleDelete}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Right chat panel ── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Header */}
        <ChatHeader activityLabel={activityLabel} onMenuOpen={() => setSidebarOpen(true)} />

        {/* Conversation area */}
        <div ref={conversationAreaRef} className="min-h-0 flex-1 overflow-y-auto py-4">
          {initError ? (
            <InitError onRetry={initialize} />
          ) : isInitializing || isLoadingMsgs ? (
            <div className="flex flex-1 items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <span className="flex gap-1">
                  {[0, 150, 300].map(delay => (
                    <span key={delay} className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </span>
                <p className="text-xs text-zinc-300">
                  {isInitializing ? 'Connecting to coach…' : 'Loading conversation…'}
                </p>
              </div>
            </div>
          ) : !hasMessages ? (
            <SuggestedQuestions onSelect={handleSuggestedQuestion} />
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) =>
                msg.role === 'user'
                  ? <UserBubble key={i} content={msg.content} />
                  : <AssistantBubble key={i} message={msg} />,
              )}
            </div>
          )}
        </div>

        {/* Input area */}
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
          <p className="mt-1.5 text-center text-[10px] text-zinc-400">
            {isStreaming ? 'Coach is responding…' : 'Enter to send · Shift+Enter for new line'}
          </p>
        </div>
      </div>
    </div>
  )
}
