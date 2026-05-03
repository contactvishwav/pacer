'use client'

import type { ReactNode } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/empty'
import { ErrorState } from '@/components/error'
import { cn } from '@/lib/utils'

interface WeeklyBriefData {
  brief: {
    lastWeekReview: string[]
    thisWeekPrescription: string[]
    keySignal: string
    warnings: string[]
    suggestedFocus: string
  }
  summary: {
    weeklyLoad: number
    acwr: number | null
    phase: string
    daysUntilRace: number
    racePredictionGap: string
  }
}

// ─── Monday anchor for “Week of …” ────────────────────────────────────────────

function getMondayThisWeek(now = new Date()): Date {
  const d = new Date(now)
  d.setHours(12, 0, 0, 0)
  const dow = d.getDay()
  const offset = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + offset)
  return d
}

function formatWeekOfMonday(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Summary strip helpers (match dashboard thresholds) ───────────────────────

function acwrCategoryClasses(acwr: number | null): { chip: string; label: string } {
  if (acwr == null) {
    return { chip: 'border-zinc-500/35 bg-zinc-500/10 text-zinc-400', label: 'No data' }
  }
  if (acwr < 0.8) {
    return { chip: 'border-blue-500/35 bg-blue-500/10 text-blue-400', label: 'Underload' }
  }
  if (acwr <= 1.3) {
    return { chip: 'border-green-500/35 bg-green-500/10 text-green-400', label: 'Optimal' }
  }
  if (acwr <= 1.5) {
    return { chip: 'border-amber-500/35 bg-amber-500/10 text-amber-400', label: 'Caution range' }
  }
  return { chip: 'border-red-500/35 bg-red-500/10 text-red-400', label: 'Higher-risk pattern' }
}

function phaseBadgeClass(phase: string): string {
  switch (phase) {
    case 'BUILD':        return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
    case 'PEAK':         return 'bg-orange-500/15 text-orange-400 border-orange-500/25'
    case 'TAPER':        return 'bg-purple-500/15 text-purple-400 border-purple-500/25'
    case 'RECOVERY':     return 'bg-green-500/15 text-green-400 border-green-500/25'
    case 'BASE':
    case 'UNSTRUCTURED': return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
    default:             return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
  }
}

function gapTextClass(gap: string): string {
  if (gap === '—') return 'text-muted-foreground'
  if (gap.includes('ahead')) return 'text-green-400'
  if (gap.includes('behind')) return 'text-amber-400'
  return 'text-muted-foreground'
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WeeklyBriefSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-muted" />
        <Skeleton className="h-4 w-72 bg-muted" />
        <Skeleton className="h-4 w-56 bg-muted" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 min-w-[140px] flex-1 rounded-xl bg-muted" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-xl bg-muted" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48 rounded-xl bg-muted" />
        <Skeleton className="h-48 rounded-xl bg-muted" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl bg-muted" />
    </div>
  )
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-border bg-card px-3 py-2.5 text-foreground',
        className,
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1 min-w-0 truncate text-sm font-semibold tabular-nums text-inherit">
        {children}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WeeklyBriefPage() {
  const router = useRouter()
  const [data, setData] = useState<WeeklyBriefData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)

  const monday = getMondayThisWeek()

  const fetchBrief = useCallback(async () => {
    setLoading(true)
    setError(null)
    setIsEmpty(false)
    try {
      const res = await fetch('/api/weekly-brief')
      const json = (await res.json()) as
        | { success: true; data: WeeklyBriefData }
        | { success: false; error: string }

      if (res.status === 404) {
        setIsEmpty(true)
        setData(null)
        return
      }

      if (!res.ok || !json.success) {
        throw new Error('request_failed')
      }

      setData(json.data)
    } catch {
      setError('load_failed')
      toast.error('Could not load your weekly brief. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBrief()
  }, [fetchBrief])

  if (loading) return <WeeklyBriefSkeleton />

  if (isEmpty) {
    return (
      <Empty
        title="No weekly brief available"
        description="Run npx prisma db seed first."
      />
    )
  }

  if (error || !data) {
    return (
      <ErrorState
        message="Something went wrong loading your brief."
        onRetry={fetchBrief}
      />
    )
  }

  const { brief, summary } = data
  const acwrStyle = acwrCategoryClasses(summary.acwr)

  function handleFollowUp() {
    const q = `Looking at my weekly brief: ${brief.keySignal} Can you help me understand what to prioritize this week?`
    try {
      sessionStorage.setItem('coach_prefill_question', q)
      sessionStorage.removeItem('coach_activity_id')
    } catch {
      /* ignore */
    }
    router.push('/coach')
  }

  return (
    <div className="space-y-8 pb-8">
      {/* HEADER */}
      <header className="space-y-1 border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Weekly Brief
        </h1>
        <p className="text-sm text-muted-foreground">
          Your coaching briefing for the week ahead
        </p>
        <p className="text-xs font-medium text-primary/90">
          Week of {formatWeekOfMonday(monday)}
        </p>
      </header>

      {/* SUMMARY STRIP */}
      <section aria-label="Training summary">
        <div className="flex flex-wrap gap-2 md:flex-nowrap">
          <StatChip label="Weekly load">
            <span className="tabular-nums">{Math.round(summary.weeklyLoad)} TRIMP</span>
          </StatChip>
          <StatChip label="ACWR" className={cn(acwrStyle.chip)}>
            {summary.acwr != null ? (
              <span className="tabular-nums">
                {summary.acwr.toFixed(2)}
                <span className="ml-1.5 text-[10px] font-normal normal-case text-muted-foreground">
                  {acwrStyle.label}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </StatChip>
          <StatChip label="Phase">
            <Badge
              variant="outline"
              className={cn('mt-0.5 border text-[11px] font-medium', phaseBadgeClass(summary.phase))}
            >
              {summary.phase}
            </Badge>
          </StatChip>
          <StatChip label="Race">
            <span
              className={cn(
                'tabular-nums',
                summary.daysUntilRace < 30 ? 'text-primary' : 'text-foreground',
              )}
            >
              {summary.daysUntilRace} days
            </span>
          </StatChip>
          <StatChip label="Gap">
            <span className={cn('text-sm font-semibold', gapTextClass(summary.racePredictionGap))}>
              {summary.racePredictionGap}
            </span>
          </StatChip>
        </div>
      </section>

      {/* KEY SIGNAL */}
      <section>
        <div className="rounded-xl border border-border border-l-4 border-l-primary bg-card/80 pl-4 pr-4 py-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5 10.5 6.75 14.25 10.5 20.25 4.5M3.75 19.5h16.5M5.25 4.5h13.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V5.25a.75.75 0 0 1 .75-.75Z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                This week&apos;s key signal
              </p>
              <p className="text-base font-medium leading-relaxed text-foreground md:text-lg">
                {brief.keySignal}
              </p>
            </div>
          </div>

          {brief.warnings.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
              {brief.warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2.5"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-amber-200/90">{w}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MAIN CONTENT — two columns */}
      <section className="grid gap-6 md:grid-cols-2 md:gap-8">
        {/* Last week */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5"
                />
              </svg>
              Last week
            </CardTitle>
            <p className="text-xs text-muted-foreground/80">What we saw in your training</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {brief.lastWeekReview.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* This week */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={1.5} />
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth={1.5} />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
              This week
            </CardTitle>
            <p className="text-xs text-primary/80">Where to lean in</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {brief.thisWeekPrescription.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm font-medium leading-relaxed text-foreground/90">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* SUGGESTED FOCUS */}
      <Card className="border-border bg-gradient-to-b from-card to-muted/20">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">
            Coach&apos;s focus for this week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-base italic leading-relaxed text-foreground/85 md:text-[17px]">
            {brief.suggestedFocus}
          </p>
          <Button
            onClick={handleFollowUp}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Ask a follow-up about this week
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
