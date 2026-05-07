'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Memory {
  id:             string
  summary:        string
  createdAt:      string
  conversationId: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── MemoryRow ────────────────────────────────────────────────────────────────

interface MemoryRowProps {
  memory:   Memory
  onDelete: (id: string) => void
  onUpdate: (id: string, summary: string) => void
}

function MemoryRow({ memory, onDelete, onUpdate }: MemoryRowProps) {
  const [editing,   setEditing]   = useState(false)
  const [editValue, setEditValue] = useState(memory.summary)
  const [saving,    setSaving]    = useState(false)

  async function handleSave() {
    const trimmed = editValue.trim()
    if (trimmed.length < 10 || trimmed.length > 300) {
      toast.error('Summary must be between 10 and 300 characters.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/coach/memories/${memory.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ summary: trimmed }),
      })
      const json = await res.json() as { success: boolean; data?: { memory: { id: string; summary: string; updatedAt: string } }; error?: string }
      if (!json.success) throw new Error(json.error ?? 'Update failed')
      onUpdate(memory.id, trimmed)
      setEditing(false)
      toast.success('Memory updated.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update memory.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setEditValue(memory.summary)
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this memory? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/coach/memories/${memory.id}`, { method: 'DELETE' })
      const json = await res.json() as { success: boolean; error?: string }
      if (!json.success) throw new Error(json.error ?? 'Delete failed')
      onDelete(memory.id)
      toast.success('Memory removed.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete memory.')
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3.5">
      {editing ? (
        <div className="space-y-2.5">
          <textarea
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            rows={3}
            maxLength={300}
            className={cn(
              'w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground',
              'focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30',
            )}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="h-7 px-3 text-xs"
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={saving}
              className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {editValue.length}/300
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-foreground">{memory.summary}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{relativeTime(memory.createdAt)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => { setEditValue(memory.summary); setEditing(true) }}
              title="Edit"
              className="rounded p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              className="rounded p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)

  const loadMemories = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/coach/memories')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as { success: boolean; data?: { memories: Memory[] } }
      if (!json.success || !json.data) throw new Error('Unexpected response')
      setMemories(json.data.memories)
    } catch (err) {
      console.error('[Memories] Failed to load:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMemories() }, [loadMemories])

  function handleDelete(id: string) {
    setMemories(prev => prev.filter(m => m.id !== id))
  }

  function handleUpdate(id: string, summary: string) {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, summary } : m))
  }

  async function handleClearAll() {
    if (!window.confirm('Clear all coaching memories? This cannot be undone.')) return
    try {
      const res = await fetch('/api/coach/memories', { method: 'DELETE' })
      const json = await res.json() as { success: boolean; error?: string }
      if (!json.success) throw new Error(json.error ?? 'Clear failed')
      setMemories([])
      toast.success('All memories cleared.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to clear memories.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">

      {/* Back link */}
      <Link
        href="/coach"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Coach
      </Link>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Coaching Memory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your coach remembers these details from past conversations. You can edit or delete any of them.
        </p>
        <p className="mt-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          These are used to personalize coaching responses. They are stored securely and never shared.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
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
            <p className="text-xs text-muted-foreground">Loading memories…</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Failed to load memories</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Make sure the database is seeded and try again.</p>
          </div>
          <Button onClick={loadMemories} variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
            Retry
          </Button>
        </div>
      ) : memories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your coach hasn&apos;t learned anything about you yet. Start a coaching conversation and share your preferences, goals, or training constraints.
          </p>
          <Link
            href="/coach"
            className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Start a conversation →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {memories.map(m => (
              <MemoryRow
                key={m.id}
                memory={m}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>

          {/* Clear all */}
          <div className="mt-8 flex justify-end border-t border-border pt-6">
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60"
            >
              Clear all memories
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
