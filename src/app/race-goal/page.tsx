'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/empty'
import { ErrorState } from '@/components/error'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RacePredictionData {
  prediction: {
    predictedTimeSeconds: number
    predictedTimeFormatted: string
    confidenceLow: number
    confidenceLowFormatted: string
    confidenceHigh: number
    confidenceHighFormatted: string
    confidenceScore: number
    gapToGoalSeconds: number | null
    gapToGoalFormatted: string
    explanation: string
    whatNeedsToHappen: string
    dataQualityNotes: string[]
    bestEffortActivity: {
      date: string
      distanceKm: number
      paceFormatted: string
      workoutType: string
    } | null
  }
  goalRace: {
    name: string
    raceDate: string
    distanceKm: number
    goalTimeFormatted: string
  } | null
  supportingSignals: {
    phase: string
    ctl: number
    tsb: number
    trend: string
    weeksOfData: number
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRaceHeaderDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function daysUntilRace(dateStr: string): number {
  const race = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  race.setHours(0, 0, 0, 0)
  return Math.ceil((race.getTime() - today.getTime()) / 86_400_000)
}

function gapColor(formatted: string): string {
  if (formatted === '—') return 'text-muted-foreground'
  if (formatted.includes('ahead')) return 'text-green-400'
  if (formatted.includes('behind')) return 'text-amber-400'
  return 'text-muted-foreground'
}

function phaseChipClass(phase: string): string {
  switch (phase) {
    case 'BUILD':    return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
    case 'PEAK':     return 'bg-orange-500/15 text-orange-400 border-orange-500/25'
    case 'TAPER':    return 'bg-purple-500/15 text-purple-400 border-purple-500/25'
    case 'RECOVERY': return 'bg-green-500/15 text-green-400 border-green-500/25'
    case 'BASE':
    case 'UNSTRUCTURED':
                      return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
    default:          return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
  }
}

function ctlColor(ctl: number): string {
  if (ctl > 50) return 'text-green-400'
  if (ctl >= 30) return 'text-amber-400'
  return 'text-red-400'
}

function tsbColor(tsb: number): string {
  if (tsb > 0) return 'text-green-400'
  if (tsb >= -10) return 'text-amber-400'
  return 'text-red-400'
}

function trendColor(trend: string): string {
  switch (trend) {
    case 'improving':   return 'text-green-400'
    case 'maintaining': return 'text-amber-400'
    case 'declining':   return 'text-red-400'
    default:            return 'text-zinc-400'
  }
}

function confidenceIndicatorClass(score: number): string {
  if (score > 70) return '[&_[data-slot=progress-indicator]]:!bg-green-500'
  if (score >= 50) return '[&_[data-slot=progress-indicator]]:!bg-amber-500'
  return '[&_[data-slot=progress-indicator]]:!bg-red-500'
}

function workoutTypeShort(type: string): string {
  const map: Record<string, string> = {
    EASY: 'Easy',
    RECOVERY: 'Recovery',
    STEADY_STATE: 'Steady',
    TEMPO: 'Tempo',
    THRESHOLD: 'Threshold',
    INTERVAL: 'Intervals',
    LONG_RUN: 'Long Run',
    RACE: 'Race',
    UNKNOWN: 'Run',
  }
  return map[type] ?? type
}

/** Marker position along [lowSeconds, highSeconds]; optimistic (faster) = left. */
function predictedMarkerPct(
  lowSec: number,
  highSec: number,
  predictedSec: number,
): number {
  const span = highSec - lowSec
  if (span <= 0) return 50
  const raw = ((predictedSec - lowSec) / span) * 100
  return Math.min(100, Math.max(0, raw))
}

function ConfidenceIntervalBar({
  lowSec,
  highSec,
  predictedSec,
  lowLabel,
  highLabel,
}: {
  lowSec: number
  highSec: number
  predictedSec: number
  lowLabel: string
  highLabel: string
}) {
  const pct = predictedMarkerPct(lowSec, highSec, predictedSec)

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Projected range (confidence band)
      </p>
      <div className="relative mt-1 h-14 w-full">
        {/* Predicted marker */}
        <div
          className="absolute bottom-4 z-10 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${pct}%` }}
        >
          <div className="h-0 w-0 border-x-[7px] border-b-[8px] border-x-transparent border-b-primary drop-shadow-[0_2px_8px_rgba(249,115,22,0.35)]" />
          <div className="-mt-px h-8 w-[3px] rounded-full bg-primary" />
        </div>
        {/* Range bar */}
        <div className="absolute bottom-0 left-0 right-0 flex h-3 items-center rounded-full bg-muted px-0.5 ring-1 ring-border/40">
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-green-500/25 via-primary/25 to-amber-500/25" />
        </div>
      </div>
      <div className="flex items-start justify-between gap-4 text-[11px]">
        <div>
          <p className="text-muted-foreground">Optimistic trajectory</p>
          <p className="font-semibold tabular-nums text-green-400">{lowLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Pessimistic trajectory</p>
          <p className="font-semibold tabular-nums text-amber-400/90">{highLabel}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RaceGoalSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-64 bg-muted" />
        <Skeleton className="h-4 w-48 bg-muted" />
        <div className="flex gap-8">
          <Skeleton className="h-16 w-32 bg-muted" />
          <Skeleton className="h-16 w-32 bg-muted" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader><Skeleton className="h-4 w-40 bg-muted" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-32 bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-8 w-full rounded-full bg-muted" />
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader><Skeleton className="h-4 w-44 bg-muted" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-20 bg-muted" />
            <Skeleton className="h-2 w-full bg-muted" />
            <Skeleton className="h-16 w-full bg-muted" />
          </CardContent>
        </Card>
      </div>
      <Skeleton className="h-28 w-full bg-muted rounded-lg" />
      <Skeleton className="h-24 w-full bg-muted rounded-lg" />
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function RaceGoalPage() {
  const router = useRouter()
  const [data, setData] = useState<RacePredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRacePrediction = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/race-prediction')
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const json = await res.json() as { success: boolean; data?: RacePredictionData; error?: string }
      if (!json.success || !json.data) {
        throw new Error(json.error ?? 'Unexpected response')
      }
      setData(json.data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load race prediction'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRacePrediction() }, [fetchRacePrediction])

  if (loading) return <RaceGoalSkeleton />

  if (error) {
    return (
      <ErrorState
        message="Failed to load race prediction."
        onRetry={fetchRacePrediction}
      />
    )
  }

  if (!data || !data.goalRace) {
    return (
      <Empty
        title="No race goal set"
        description="Add a goal race to see your prediction."
      />
    )
  }

  const { prediction, goalRace, supportingSignals } = data
  const daysLeft = daysUntilRace(goalRace.raceDate)
  const gapCls = gapColor(prediction.gapToGoalFormatted)
  const confidenceScoreRounded = Math.round(Math.min(100, Math.max(0, prediction.confidenceScore)))
  const progressIndicatorCls = confidenceIndicatorClass(confidenceScoreRounded)

  function handleAskCoach() {
    const q =
      `I'm looking at my race prediction. ${prediction.whatNeedsToHappen} How do I make this happen?`
    try {
      sessionStorage.setItem('coach_prefill_question', q)
      sessionStorage.removeItem('coach_activity_id')
    } catch {
      /* private mode */
    }
    router.push('/coach')
  }

  return (
    <div className="space-y-8 pb-8">
      {/* ── SECTION 1: Race header ── */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {goalRace.name}
        </h1>
        <p className="text-sm text-muted-foreground">{formatRaceHeaderDate(goalRace.raceDate)}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-foreground/90">
          <span>{goalRace.distanceKm.toFixed(1)} km</span>
          <span className="text-border">·</span>
          <span>
            Goal: <span className="font-semibold tabular-nums">{goalRace.goalTimeFormatted}</span>
          </span>
        </div>
        <p className="text-sm font-semibold text-primary">
          {daysLeft > 0
            ? `${daysLeft} days to go`
            : daysLeft === 0
              ? 'Race day'
              : 'Race date passed'}
        </p>
      </div>

      {/* ── SECTION 2: Prediction panel ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Card A — Projected finish */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Estimated trajectory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {prediction.predictedTimeFormatted !== '—' &&
            prediction.confidenceLowFormatted !== '—' &&
            prediction.confidenceHighFormatted !== '—' ? (
              <>
                <div>
                  <p className="text-[11px] text-muted-foreground">Projected finish (estimated)</p>
                  <p className="text-4xl font-bold tracking-tight tabular-nums text-foreground md:text-5xl">
                    {prediction.predictedTimeFormatted}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {prediction.confidenceLowFormatted}
                    <span className="mx-1 text-muted-foreground/40">—</span>
                    {prediction.confidenceHighFormatted}{' '}
                    <span className="italic">confidence range based on recent training.</span>
                  </p>
                </div>

                <ConfidenceIntervalBar
                  lowSec={prediction.confidenceLow}
                  highSec={prediction.confidenceHigh}
                  predictedSec={prediction.predictedTimeSeconds}
                  lowLabel={prediction.confidenceLowFormatted}
                  highLabel={prediction.confidenceHighFormatted}
                />

                <p className={cn('text-sm font-medium', gapCls)}>
                  {prediction.gapToGoalFormatted}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not enough qualifying data yet to estimate a projected finish. Keep logging quality
                workouts so we can derive a trajectory.
              </p>
            )}

            <p className="text-[11px] text-muted-foreground/80 italic">
              Estimated based on current training data. Not a guarantee.
            </p>
          </CardContent>
        </Card>

        {/* Card B — Confidence & data quality */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Prediction confidence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold tabular-nums text-foreground">
                {confidenceScoreRounded}/100
              </p>
              <p className="text-[11px] text-muted-foreground">
                Reflects consistency and depth of supporting training data — not certainty of race
                outcome.
              </p>
            </div>

            <Progress
              value={confidenceScoreRounded}
              className={cn(
                'flex-col gap-2 [&_[data-slot=progress-track]]:h-2',
                progressIndicatorCls,
              )}
            />

            <p className="text-sm text-muted-foreground">{prediction.explanation}</p>

            {prediction.dataQualityNotes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prediction.dataQualityNotes.map((note, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="border-amber-500/35 bg-amber-500/8 text-[11px] font-normal text-amber-300/90"
                  >
                    {note}
                  </Badge>
                ))}
              </div>
            )}

            {prediction.bestEffortActivity && (
              <p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs text-foreground/85">
                <span className="font-medium text-muted-foreground">Based on:</span>{' '}
                {prediction.bestEffortActivity.date},{' '}
                {prediction.bestEffortActivity.distanceKm} km{' '}
                {workoutTypeShort(prediction.bestEffortActivity.workoutType)} at{' '}
                <span className="tabular-nums">{prediction.bestEffortActivity.paceFormatted}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── SECTION 3 ── */}
      <Card className="border-border bg-card md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">What needs to happen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-base leading-relaxed text-foreground/90 md:text-[17px]">
            {prediction.whatNeedsToHappen}
          </p>
          <Button
            onClick={handleAskCoach}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Ask coach how to close the gap
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Supporting signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-[11px] text-muted-foreground">
            Estimated projection weighs these signals alongside your qualifying efforts.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn(
                'border text-[11px] font-normal',
                phaseChipClass(supportingSignals.phase),
              )}
            >
              Phase: <span className="ml-1 font-semibold">{supportingSignals.phase}</span>
            </Badge>
            <Badge variant="outline" className={cn('border border-border bg-muted/25 text-[11px] font-normal')}>
              Fitness (CTL):{' '}
              <span className={cn('ml-1 font-semibold tabular-nums', ctlColor(supportingSignals.ctl))}>
                {Math.round(supportingSignals.ctl)}
              </span>
            </Badge>
            <Badge variant="outline" className="border border-border bg-muted/25 text-[11px] font-normal">
              Form (TSB):{' '}
              <span className={cn('ml-1 font-semibold tabular-nums', tsbColor(supportingSignals.tsb))}>
                {Math.round(supportingSignals.tsb)}
              </span>
            </Badge>
            <Badge variant="outline" className="border border-border bg-muted/25 text-[11px] font-normal capitalize">
              Trend:{' '}
              <span className={cn('ml-1 font-semibold', trendColor(supportingSignals.trend))}>
                {supportingSignals.trend}
              </span>
            </Badge>
            <Badge variant="outline" className="border border-border bg-muted/25 text-[11px] font-normal">
              Data:{' '}
              <span className="ml-1 font-semibold tabular-nums text-foreground">
                {supportingSignals.weeksOfData} weeks
              </span>{' '}
              <span className="text-muted-foreground">of training summaries</span>
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
