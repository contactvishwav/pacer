'use client'

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

// ─── API response shape ────────────────────────────────────────────────────────

interface DashboardData {
  athlete: {
    name: string
    thresholdHR: number
    easyHRCeiling: number
  }
  goalRace: {
    name: string
    raceDate: string
    distanceKm: number
    goalTimeFormatted: string
    daysUntilRace: number
  } | null
  phase: {
    phase: string
    confidence: string
    primaryReason: string
    coachingImplication: string
    daysUntilRace: number
  }
  injuryRisk: {
    category: string
    acwr: number | null
    explanation: string
    recommendedAction: string
    contributingFactors: string[]
  }
  trainingLoad: {
    ctl: number
    atl: number
    tsb: number
    trend: string
    weeklyLoad: number
    explanation: string
  }
  racePrediction: {
    predictedTimeFormatted: string
    confidenceLowFormatted: string
    confidenceHighFormatted: string
    confidenceScore: number
    gapToGoalFormatted: string
    whatNeedsToHappen: string
  }
  weeklyBrief: {
    lastWeekReview: string[]
    thisWeekPrescription: string[]
    keySignal: string
    warnings: string[]
    suggestedFocus: string
  }
  recentActivities: Array<{
    id: string
    date: string
    workoutType: string
    executionEvaluation: string | null
    distanceKm: number
    durationMinutes: number
    avgHR: number | null
    trainingLoad: number
  }>
}

// ─── Color helpers ─────────────────────────────────────────────────────────────

function phaseStyles(phase: string) {
  switch (phase) {
    case 'BUILD':       return { badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',    dot: 'bg-blue-400' }
    case 'PEAK':        return { badge: 'bg-orange-500/15 text-orange-400 border-orange-500/25', dot: 'bg-orange-400' }
    case 'TAPER':       return { badge: 'bg-purple-500/15 text-purple-400 border-purple-500/25', dot: 'bg-purple-400' }
    case 'RECOVERY':    return { badge: 'bg-green-500/15 text-green-400 border-green-500/25',  dot: 'bg-green-400' }
    case 'BASE':        return { badge: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',    dot: 'bg-zinc-400' }
    default:            return { badge: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',    dot: 'bg-zinc-400' }
  }
}

function riskStyles(category: string) {
  switch (category) {
    case 'optimal':           return { badge: 'bg-green-500/15 text-green-400 border-green-500/25',  acwr: 'text-green-400' }
    case 'caution':           return { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',  acwr: 'text-amber-400' }
    case 'high-risk':         return { badge: 'bg-red-500/15 text-red-400 border-red-500/25',       acwr: 'text-red-400' }
    case 'underload':         return { badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',    acwr: 'text-blue-400' }
    case 'insufficient-data': return { badge: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',    acwr: 'text-zinc-400' }
    default:                  return { badge: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',    acwr: 'text-zinc-400' }
  }
}

function workoutTypeBadge(type: string) {
  switch (type) {
    case 'INTERVAL':     return 'bg-orange-500/15 text-orange-400'
    case 'TEMPO':        return 'bg-blue-500/15 text-blue-400'
    case 'THRESHOLD':    return 'bg-blue-600/15 text-blue-300'
    case 'STEADY_STATE': return 'bg-sky-500/15 text-sky-400'
    case 'LONG_RUN':     return 'bg-purple-500/15 text-purple-400'
    case 'RECOVERY':     return 'bg-green-500/15 text-green-400'
    case 'RACE':         return 'bg-red-500/15 text-red-400'
    default:             return 'bg-zinc-500/15 text-zinc-400'
  }
}

function executionBadge(ev: string | null) {
  switch (ev) {
    case 'MATCHED_INTENT':
    case 'WELL_EXECUTED':    return 'bg-green-500/15 text-green-400'
    case 'TOO_HARD':         return 'bg-red-500/15 text-red-400'
    case 'TOO_EASY':
    case 'UNEVEN_EXECUTION': return 'bg-amber-500/15 text-amber-400'
    default:                 return 'bg-zinc-500/15 text-zinc-400'
  }
}

function formatWorkoutType(type: string) {
  const labels: Record<string, string> = {
    EASY: 'Easy', RECOVERY: 'Recovery', STEADY_STATE: 'Steady',
    TEMPO: 'Tempo', THRESHOLD: 'Threshold', INTERVAL: 'Intervals',
    LONG_RUN: 'Long Run', RACE: 'Race', UNKNOWN: 'Unknown',
  }
  return labels[type] ?? type
}

function formatExecutionLabel(ev: string | null) {
  if (!ev) return '—'
  const labels: Record<string, string> = {
    MATCHED_INTENT: 'On Target', WELL_EXECUTED: 'Well Executed',
    TOO_HARD: 'Too Hard', TOO_EASY: 'Too Easy', UNEVEN_EXECUTION: 'Uneven',
  }
  return labels[ev] ?? ev
}

function gapColor(gapFormatted: string) {
  if (gapFormatted === '—') return 'text-muted-foreground'
  if (gapFormatted.includes('ahead')) return 'text-green-400'
  return 'text-amber-400'
}

function confidenceLabel(confidence: string) {
  switch (confidence) {
    case 'high':   return 'High confidence'
    case 'medium': return 'Medium confidence'
    case 'low':    return 'Low confidence'
    default:       return confidence
  }
}

// ─── Skeleton loading state ────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 bg-muted" />
        <Skeleton className="h-4 w-64 bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardHeader>
              <Skeleton className="h-4 w-32 bg-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-8 w-24 bg-muted" />
              <Skeleton className="h-4 w-full bg-muted" />
              <Skeleton className="h-4 w-3/4 bg-muted" />
              <Skeleton className="h-4 w-1/2 bg-muted" />
            </CardContent>
          </Card>
        ))}
        {[...Array(2)].map((_, i) => (
          <Card key={`full-${i}`} className="border-border bg-card md:col-span-2">
            <CardHeader>
              <Skeleton className="h-4 w-32 bg-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
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

// ─── Section 1: Training Phase ─────────────────────────────────────────────────

interface PhaseCardProps {
  phase: DashboardData['phase']
  goalRace: DashboardData['goalRace']
  trainingLoad: DashboardData['trainingLoad']
}

function PhaseCard({ phase, goalRace, trainingLoad }: PhaseCardProps) {
  const ps = phaseStyles(phase.phase)
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Training Phase
          </CardTitle>
          <Badge className={cn('border text-[10px] font-medium', ps.badge)}>
            {confidenceLabel(phase.confidence)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase label */}
        <div className="flex items-center gap-3">
          <span className={cn('h-2.5 w-2.5 rounded-full', ps.dot)} />
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {phase.phase}
          </span>
        </div>

        {/* Primary reason */}
        <p className="text-sm text-muted-foreground">{phase.primaryReason}</p>

        {/* Coaching implication */}
        <p className="border-l-2 border-primary/40 pl-3 text-sm text-foreground/80 italic">
          {phase.coachingImplication}
        </p>

        {/* Load stats row */}
        <div className="flex gap-4 border-t border-border pt-3">
          {[
            { label: 'CTL', value: Math.round(trainingLoad.ctl) },
            { label: 'ATL', value: Math.round(trainingLoad.atl) },
            { label: 'TSB', value: Math.round(trainingLoad.tsb) },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <span
                className={cn(
                  'text-lg font-semibold tabular-nums',
                  label === 'TSB' && value >= 0 ? 'text-green-400' : '',
                  label === 'TSB' && value < -10 ? 'text-amber-400' : '',
                  label !== 'TSB' ? 'text-foreground' : '',
                )}
              >
                {value > 0 && label === 'TSB' ? '+' : ''}{value}
              </span>
            </div>
          ))}
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Trend
            </span>
            <span className="text-lg font-semibold capitalize text-foreground">
              {trainingLoad.trend}
            </span>
          </div>
        </div>

        {/* Days until race */}
        {goalRace && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{goalRace.daysUntilRace}</span>{' '}
            days to {goalRace.name}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Section 2: Injury Risk / ACWR ────────────────────────────────────────────

interface InjuryRiskCardProps {
  injuryRisk: DashboardData['injuryRisk']
}

function InjuryRiskCard({ injuryRisk }: InjuryRiskCardProps) {
  const rs = riskStyles(injuryRisk.category)
  const acwrDisplay = injuryRisk.acwr != null ? injuryRisk.acwr.toFixed(2) : '—'
  const categoryLabel = injuryRisk.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Training-Load Risk
          </CardTitle>
          <Badge className={cn('border text-[10px] font-medium capitalize', rs.badge)}>
            {categoryLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ACWR large value */}
        <div className="flex items-end gap-2">
          <span className={cn('text-4xl font-bold tabular-nums tracking-tight', rs.acwr)}>
            {acwrDisplay}
          </span>
          <span className="mb-1 text-xs text-muted-foreground">ACWR</span>
        </div>

        {/* Explanation */}
        <p className="text-sm text-muted-foreground">{injuryRisk.explanation}</p>

        {/* Recommended action */}
        <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5">
          <p className="text-xs font-medium text-primary/90">{injuryRisk.recommendedAction}</p>
        </div>

        {/* Contributing factors */}
        {injuryRisk.contributingFactors.length > 0 && (
          <ul className="space-y-1">
            {injuryRisk.contributingFactors.map((factor, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                {factor}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Section 3: Race Prediction ───────────────────────────────────────────────

interface RacePredictionCardProps {
  racePrediction: DashboardData['racePrediction']
  goalRace: DashboardData['goalRace']
}

function RacePredictionCard({ racePrediction, goalRace }: RacePredictionCardProps) {
  const isPredicted = racePrediction.predictedTimeFormatted !== '—'
  const gapCls = gapColor(racePrediction.gapToGoalFormatted)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Race Prediction
          </CardTitle>
          {goalRace && (
            <span className="text-[10px] text-muted-foreground">{goalRace.name}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPredicted ? (
          <>
            {/* Predicted time */}
            <div>
              <div className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
                {racePrediction.predictedTimeFormatted}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {racePrediction.confidenceLowFormatted}
                <span className="mx-1.5 text-muted-foreground/40">—</span>
                {racePrediction.confidenceHighFormatted}
              </div>
            </div>

            {/* Gap to goal */}
            {goalRace && racePrediction.gapToGoalFormatted !== '—' && (
              <div className={cn('text-sm font-medium', gapCls)}>
                {racePrediction.gapToGoalFormatted}
              </div>
            )}

            {/* What needs to happen */}
            <p className="text-sm text-muted-foreground">{racePrediction.whatNeedsToHappen}</p>

            {/* Confidence score */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Model Confidence
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {Math.round(racePrediction.confidenceScore)}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round(racePrediction.confidenceScore)}%` }}
                />
              </div>
            </div>

            {/* Goal time reference */}
            {goalRace && goalRace.goalTimeFormatted !== '—' && (
              <p className="text-xs text-muted-foreground">
                Goal: <span className="font-semibold text-foreground">{goalRace.goalTimeFormatted}</span>
              </p>
            )}
          </>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">No race goal set.</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Set a goal race to enable race time prediction.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Section 4: Weekly Brief ──────────────────────────────────────────────────

interface WeeklyBriefCardProps {
  weeklyBrief: DashboardData['weeklyBrief']
}

function WeeklyBriefCard({ weeklyBrief }: WeeklyBriefCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Weekly Brief
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key signal callout */}
        <div className="rounded-md border border-primary/25 bg-primary/8 px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">Key Signal</p>
          <p className="mt-0.5 text-sm text-foreground/90">{weeklyBrief.keySignal}</p>
        </div>

        {/* Warnings */}
        {weeklyBrief.warnings.length > 0 && (
          <div className="space-y-1.5">
            {weeklyBrief.warnings.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/8 px-3 py-2"
              >
                <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-amber-300/90">{w}</p>
              </div>
            ))}
          </div>
        )}

        {/* Last week */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Last Week
          </p>
          <ul className="space-y-1">
            {weeklyBrief.lastWeekReview.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* This week */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            This Week
          </p>
          <ul className="space-y-1">
            {weeklyBrief.thisWeekPrescription.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested focus */}
        <p className="border-t border-border pt-3 text-xs italic text-muted-foreground">
          {weeklyBrief.suggestedFocus}
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Section 5: Recent Workouts ────────────────────────────────────────────────

interface RecentWorkoutsSectionProps {
  activities: DashboardData['recentActivities']
}

function RecentWorkoutsSection({ activities }: RecentWorkoutsSectionProps) {
  const router = useRouter()

  if (activities.length === 0) {
    return (
      <Card className="border-border bg-card md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Empty title="No recent activities" description="Activities will appear here after seeding." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card md:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Recent Workouts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Date', 'Type', 'Distance', 'Duration', 'HR', 'Execution', 'Load'].map(h => (
                  <th
                    key={h}
                    className="pb-2 pr-4 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => (
                <tr
                  key={act.id}
                  onClick={() => router.push(`/activities/${act.id}`)}
                  className="cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30"
                >
                  <td className="py-3 pr-4 text-xs tabular-nums text-muted-foreground">
                    {act.date}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-[11px] font-medium',
                        workoutTypeBadge(act.workoutType),
                      )}
                    >
                      {formatWorkoutType(act.workoutType)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-foreground/80">
                    {act.distanceKm.toFixed(1)} km
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-foreground/80">
                    {act.durationMinutes} min
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-foreground/80">
                    {act.avgHR != null ? `${act.avgHR} bpm` : '—'}
                  </td>
                  <td className="py-3 pr-4">
                    {act.executionEvaluation ? (
                      <span
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] font-medium',
                          executionBadge(act.executionEvaluation),
                        )}
                      >
                        {formatExecutionLabel(act.executionEvaluation)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 tabular-nums text-foreground/80">
                    {Math.round(act.trainingLoad)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Section 6: Coach CTA ─────────────────────────────────────────────────────

interface CoachCTAProps {
  weeklyBrief: DashboardData['weeklyBrief']
  injuryRisk: DashboardData['injuryRisk']
  goalRace: DashboardData['goalRace']
}

function deriveSuggestedQuestions(
  weeklyBrief: DashboardData['weeklyBrief'],
  injuryRisk: DashboardData['injuryRisk'],
  goalRace: DashboardData['goalRace'],
): string[] {
  const q1 = `What does this week's key signal mean for my training?`
  const q2 = ['caution', 'high-risk'].includes(injuryRisk.category)
    ? `My ACWR is ${injuryRisk.acwr?.toFixed(2) ?? 'elevated'} — how should I adjust this week?`
    : `Am I building fitness efficiently right now?`
  const q3 = goalRace
    ? `With ${goalRace.daysUntilRace} days to ${goalRace.name}, what's my biggest focus?`
    : `What type of workout should I prioritize this week?`
  return [q1, q2, q3]
}

function CoachCTA({ weeklyBrief, injuryRisk, goalRace }: CoachCTAProps) {
  const router = useRouter()
  const questions = deriveSuggestedQuestions(weeklyBrief, injuryRisk, goalRace)

  return (
    <Card className="border border-primary/25 bg-card md:col-span-2">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Ask your coach</h3>
            <p className="max-w-xl text-sm text-muted-foreground">{weeklyBrief.suggestedFocus}</p>
          </div>
          <Button
            onClick={() => router.push('/coach')}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start coaching session
          </Button>
        </div>

        {/* Suggested quick questions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => router.push('/coach')}
              className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Dashboard Page ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard')
      if (res.status === 404) {
        setData(null)
        setLoading(false)
        return
      }
      if (!res.ok) {
        throw new Error(`Server error ${res.status}`)
      }
      const json = await res.json() as { success: boolean; data?: DashboardData; error?: string }
      if (!json.success || !json.data) {
        throw new Error(json.error ?? 'Unexpected response from /api/dashboard')
      }
      setData(json.data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <ErrorState
        message={`Failed to load dashboard: ${error}`}
        onRetry={fetchDashboard}
      />
    )
  }

  if (!data) {
    return (
      <Empty
        title="No training data found"
        description="Run the seed script first: npx prisma db seed"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            {data.athlete.name}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
            Training Dashboard
          </h1>
        </div>
        {data.goalRace && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Next race</p>
            <p className="text-sm font-semibold text-foreground">{data.goalRace.name}</p>
            <p className="text-xs text-primary">
              {data.goalRace.daysUntilRace}d away · {data.goalRace.distanceKm} km
            </p>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <PhaseCard
          phase={data.phase}
          goalRace={data.goalRace}
          trainingLoad={data.trainingLoad}
        />
        <InjuryRiskCard injuryRisk={data.injuryRisk} />
        <RacePredictionCard
          racePrediction={data.racePrediction}
          goalRace={data.goalRace}
        />
        <WeeklyBriefCard weeklyBrief={data.weeklyBrief} />
        <RecentWorkoutsSection activities={data.recentActivities} />
        <CoachCTA
          weeklyBrief={data.weeklyBrief}
          injuryRisk={data.injuryRisk}
          goalRace={data.goalRace}
        />
      </div>
    </div>
  )
}
