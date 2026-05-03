'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/empty'
import { ErrorState } from '@/components/error'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntelligenceData {
  activity: {
    id: string
    name: string
    date: string
    distanceKm: number
    durationMinutes: number
    avgHR: number | null
    avgPaceFormatted: string
    elevationGain: number | null
  }
  classification: {
    workoutType: string
    confidence: string
    executionEvaluation: string | null
    executionNote: string | null
  }
  coaching: {
    phaseSummary: string
    loadImpact: string
    executionNote: string
    followUpQuestion: string
  }
  currentFitness: {
    ctl: number
    atl: number
    tsb: number
    acwr: number | null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function workoutTypeBadge(type: string): string {
  switch (type) {
    case 'EASY':         return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
    case 'RECOVERY':     return 'bg-green-500/15 text-green-400 border-green-500/25'
    case 'STEADY_STATE': return 'bg-amber-500/15 text-amber-400 border-amber-500/25'
    case 'TEMPO':        return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
    case 'THRESHOLD':    return 'bg-blue-600/15 text-blue-300 border-blue-600/25'
    case 'INTERVAL':     return 'bg-orange-500/15 text-orange-400 border-orange-500/25'
    case 'LONG_RUN':     return 'bg-purple-500/15 text-purple-400 border-purple-500/25'
    case 'RACE':         return 'bg-red-500/15 text-red-400 border-red-500/25'
    default:             return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
  }
}

function workoutTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    EASY: 'Easy Run', RECOVERY: 'Recovery Run', STEADY_STATE: 'Steady State',
    TEMPO: 'Tempo', THRESHOLD: 'Threshold', INTERVAL: 'Intervals',
    LONG_RUN: 'Long Run', RACE: 'Race', UNKNOWN: 'Unknown',
  }
  return labels[type] ?? type
}

function executionColor(ev: string | null): string {
  switch (ev) {
    case 'MATCHED_INTENT':
    case 'WELL_EXECUTED':    return 'text-green-400'
    case 'TOO_HARD':         return 'text-red-400'
    case 'TOO_EASY':
    case 'UNEVEN_EXECUTION': return 'text-amber-400'
    default:                 return 'text-zinc-400'
  }
}

function executionDisplayLabel(ev: string | null): string {
  const labels: Record<string, string> = {
    MATCHED_INTENT: 'On Target', WELL_EXECUTED: 'Well Executed',
    TOO_HARD: 'Too Hard', TOO_EASY: 'Too Easy', UNEVEN_EXECUTION: 'Uneven',
  }
  return ev ? (labels[ev] ?? ev) : '—'
}

function executionBadgeCls(ev: string | null): string {
  switch (ev) {
    case 'MATCHED_INTENT':
    case 'WELL_EXECUTED':    return 'bg-green-500/15 text-green-400 border-green-500/25'
    case 'TOO_HARD':         return 'bg-red-500/15 text-red-400 border-red-500/25'
    case 'TOO_EASY':
    case 'UNEVEN_EXECUTION': return 'bg-amber-500/15 text-amber-400 border-amber-500/25'
    default:                 return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
  }
}

function acwrColor(acwr: number | null): string {
  if (acwr == null) return 'text-zinc-400'
  if (acwr < 0.8)  return 'text-blue-400'
  if (acwr <= 1.3) return 'text-green-400'
  if (acwr <= 1.5) return 'text-amber-400'
  return 'text-red-400'
}

function acwrLabel(acwr: number | null): string {
  if (acwr == null) return 'No data'
  if (acwr < 0.8)  return 'Underload'
  if (acwr <= 1.3) return 'Optimal'
  if (acwr <= 1.5) return 'Caution range'
  return 'Higher-risk pattern'
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Back nav skeleton */}
      <Skeleton className="h-4 w-32 bg-muted" />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-64 bg-muted" />
          <Skeleton className="h-7 w-20 rounded bg-muted" />
        </div>
        <Skeleton className="h-4 w-40 bg-muted" />
        <div className="flex gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-14 bg-muted" />
              <Skeleton className="h-5 w-16 bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Three cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardHeader><Skeleton className="h-4 w-28 bg-muted" /></CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-7 w-24 bg-muted" />
              <Skeleton className="h-4 w-full bg-muted" />
              <Skeleton className="h-4 w-5/6 bg-muted" />
              <Skeleton className="h-4 w-2/3 bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Section 1: Activity Header ───────────────────────────────────────────────

interface StatItem {
  label: string
  value: string
}

interface ActivityHeaderProps {
  activity: IntelligenceData['activity']
  classification: IntelligenceData['classification']
}

function ActivityHeader({ activity, classification }: ActivityHeaderProps) {
  const stats: StatItem[] = [
    { label: 'Distance', value: `${activity.distanceKm.toFixed(1)} km` },
    { label: 'Duration', value: `${activity.durationMinutes} min` },
    { label: 'Avg Pace', value: activity.avgPaceFormatted },
    ...(activity.avgHR != null ? [{ label: 'Avg HR', value: `${activity.avgHR} bpm` }] : []),
    ...(activity.elevationGain != null && activity.elevationGain > 0
      ? [{ label: 'Elevation', value: `${Math.round(activity.elevationGain)} m` }]
      : []),
  ]

  return (
    <div className="space-y-4">
      {/* Title row */}
      <div className="flex flex-wrap items-start gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{activity.name}</h1>
        <Badge className={cn('border text-xs font-medium', workoutTypeBadge(classification.workoutType))}>
          {workoutTypeLabel(classification.workoutType)}
        </Badge>
        {classification.executionEvaluation && (
          <Badge className={cn('border text-xs font-medium', executionBadgeCls(classification.executionEvaluation))}>
            {executionDisplayLabel(classification.executionEvaluation)}
          </Badge>
        )}
      </div>

      {/* Date */}
      <p className="text-sm text-muted-foreground">{formatDate(activity.date)}</p>

      {/* Stat row */}
      <div className="flex flex-wrap gap-6">
        {stats.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Card A: Classification ───────────────────────────────────────────────────

interface ClassificationCardProps {
  classification: IntelligenceData['classification']
}

function ClassificationCard({ classification }: ClassificationCardProps) {
  const isEasyFamily = classification.workoutType === 'EASY' || classification.workoutType === 'RECOVERY'
  const showZoneWarning = classification.executionEvaluation === 'TOO_HARD' && isEasyFamily

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Classification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workout type */}
        <div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {workoutTypeLabel(classification.workoutType)}
          </p>
          <span className={cn('text-xs font-medium capitalize', {
            'text-green-400': classification.confidence === 'high',
            'text-amber-400': classification.confidence === 'medium',
            'text-zinc-400':  classification.confidence === 'low',
          })}>
            {classification.confidence} confidence
          </span>
        </div>

        {/* Execution evaluation */}
        {classification.executionEvaluation && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Execution
            </p>
            <p className={cn('text-lg font-bold', executionColor(classification.executionEvaluation))}>
              {executionDisplayLabel(classification.executionEvaluation).toUpperCase()}
            </p>
          </div>
        )}

        {/* Zone 2 warning */}
        {showZoneWarning && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/8 px-3 py-2.5">
            <span className="mt-0.5 text-sm">⚠️</span>
            <p className="text-xs text-amber-300/90">
              This easy run was executed above your Zone 2 ceiling. See coaching note below.
            </p>
          </div>
        )}

        {/* Execution note */}
        {classification.executionNote && (
          <p className="text-sm text-muted-foreground">{classification.executionNote}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Card B: Coaching Context ─────────────────────────────────────────────────

interface CoachingContextCardProps {
  coaching: IntelligenceData['coaching']
  fitness: IntelligenceData['currentFitness']
}

function CoachingContextCard({ coaching, fitness }: CoachingContextCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Coaching Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase summary */}
        <p className="text-sm text-foreground/85">{coaching.phaseSummary}</p>

        {/* Load impact */}
        <div className="flex items-start gap-2">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          <p className="text-sm text-muted-foreground">{coaching.loadImpact}</p>
        </div>

        {/* Fitness snapshot */}
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Current Fitness
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'CTL', value: Math.round(fitness.ctl) },
              { label: 'ATL', value: Math.round(fitness.atl) },
              { label: 'TSB', value: Math.round(fitness.tsb) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-md border border-border bg-muted/20 px-3 py-2 text-center"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className={cn(
                  'text-lg font-bold tabular-nums',
                  label === 'TSB' && value >= 0 ? 'text-green-400' : '',
                  label === 'TSB' && value < -10 ? 'text-amber-400' : '',
                  label !== 'TSB' ? 'text-foreground' : '',
                )}>
                  {value > 0 && label === 'TSB' ? '+' : ''}{value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ACWR */}
        {fitness.acwr != null && (
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/10 px-3 py-2">
            <span className="text-xs text-muted-foreground">ACWR · {acwrLabel(fitness.acwr)}</span>
            <span className={cn('text-sm font-bold tabular-nums', acwrColor(fitness.acwr))}>
              {fitness.acwr.toFixed(2)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Card C: Ask Your Coach ───────────────────────────────────────────────────

interface AskCoachCardProps {
  coaching: IntelligenceData['coaching']
  activityId: string
}

function AskCoachCard({ coaching, activityId }: AskCoachCardProps) {
  const router = useRouter()

  function handleAskCoach() {
    try {
      sessionStorage.setItem('coach_prefill_question', coaching.followUpQuestion)
      sessionStorage.setItem('coach_activity_id', activityId)
    } catch {
      // sessionStorage unavailable (SSR guard or private browsing)
    }
    router.push('/coach')
  }

  return (
    <Card className="border border-primary/25 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Ask Your Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">Suggested question based on this workout:</p>

        {/* Speech bubble */}
        <div className="relative rounded-xl rounded-tl-sm border border-border bg-muted/25 px-4 py-3">
          <p className="text-sm italic text-foreground/90">
            &ldquo;{coaching.followUpQuestion}&rdquo;
          </p>
        </div>

        {/* Ask Coach button */}
        <Button
          onClick={handleAskCoach}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Ask Coach
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          Opens a coaching session with this question pre-loaded
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ActivityDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<IntelligenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const fetchIntelligence = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const res = await fetch(`/api/activities/${id}/intelligence`)
      if (res.status === 404) {
        setNotFound(true)
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const json = await res.json() as { success: boolean; data?: IntelligenceData; error?: string }
      if (!json.success || !json.data) {
        throw new Error(json.error ?? 'Unexpected response')
      }
      setData(json.data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load activity intelligence'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchIntelligence() }, [fetchIntelligence])

  if (loading) return <DetailSkeleton />

  if (notFound) {
    return (
      <div className="space-y-6">
        <Link href="/activities" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Activities
        </Link>
        <Empty title="Activity not found" description="This activity does not exist or has been removed." />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        message="Something went wrong loading this activity. Please try again."
        onRetry={fetchIntelligence}
      />
    )
  }

  if (!data) return null

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      {/* Breadcrumb — top */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/activities" className="transition-colors hover:text-foreground">
          Activities
        </Link>
        <svg className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span className="max-w-[240px] truncate text-foreground">{data.activity.name}</span>
      </nav>

      {/* Section 1 — Activity header */}
      <ActivityHeader activity={data.activity} classification={data.classification} />

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Section 2 — Intelligence panel */}
      <div>
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Activity Intelligence
        </p>
        <div className="grid items-stretch gap-4 md:grid-cols-3">
          <ClassificationCard classification={data.classification} />
          <CoachingContextCard coaching={data.coaching} fitness={data.currentFitness} />
          <AskCoachCard coaching={data.coaching} activityId={data.activity.id} />
        </div>
      </div>

      {/* Back navigation — bottom */}
      <div className="border-t border-border pt-6">
        <Link
          href="/activities"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Activities
        </Link>
      </div>
    </div>
  )
}
