'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/empty'
import { ErrorState } from '@/components/error'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Activity {
  id: string
  name: string
  date: string
  workoutType: string
  executionEvaluation: string | null
  distanceKm: number
  durationMinutes: number
  avgHR: number | null
  avgPaceFormatted: string
  trainingLoad: number
  elevationGain: number | null
}

interface ActivitiesData {
  activities: Activity[]
  total: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${weekdays[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`
}

function workoutTypeBadge(type: string): string {
  switch (type) {
    case 'EASY':         return 'bg-zinc-500/15 text-zinc-400'
    case 'RECOVERY':     return 'bg-green-500/15 text-green-400'
    case 'STEADY_STATE': return 'bg-amber-500/15 text-amber-400'
    case 'TEMPO':        return 'bg-blue-500/15 text-blue-400'
    case 'THRESHOLD':    return 'bg-blue-600/15 text-blue-300'
    case 'INTERVAL':     return 'bg-orange-500/15 text-orange-400'
    case 'LONG_RUN':     return 'bg-purple-500/15 text-purple-400'
    case 'RACE':         return 'bg-red-500/15 text-red-400'
    default:             return 'bg-zinc-500/15 text-zinc-400'
  }
}

function workoutTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    EASY: 'Easy', RECOVERY: 'Recovery', STEADY_STATE: 'Steady',
    TEMPO: 'Tempo', THRESHOLD: 'Threshold', INTERVAL: 'Intervals',
    LONG_RUN: 'Long Run', RACE: 'Race', UNKNOWN: 'Unknown',
  }
  return labels[type] ?? type
}

function executionBadge(ev: string): { cls: string; label: string } {
  switch (ev) {
    case 'MATCHED_INTENT': return { cls: 'bg-green-500/15 text-green-400', label: 'On Target' }
    case 'WELL_EXECUTED':  return { cls: 'bg-green-500/15 text-green-400', label: 'Well Executed' }
    case 'TOO_HARD':       return { cls: 'bg-red-500/15 text-red-400',     label: 'Too Hard' }
    case 'TOO_EASY':       return { cls: 'bg-amber-500/15 text-amber-400', label: 'Too Easy' }
    case 'UNEVEN_EXECUTION': return { cls: 'bg-amber-500/15 text-amber-400', label: 'Uneven' }
    default:               return { cls: 'bg-zinc-500/15 text-zinc-400',   label: ev }
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ActivitiesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-32 bg-muted" />
        <Skeleton className="h-5 w-12 rounded-full bg-muted" />
      </div>
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {/* Header row */}
          <div className="border-b border-border px-4 py-3">
            <div className="flex gap-4">
              {[80, 60, 160, 60, 60, 48, 60, 64].map((w, i) => (
                <Skeleton key={i} className="h-3 rounded bg-muted" style={{ width: w }} />
              ))}
            </div>
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border/50 px-4 py-4 last:border-0">
              <Skeleton className="h-3.5 w-20 bg-muted" />
              <Skeleton className="h-5 w-16 rounded bg-muted" />
              <Skeleton className="h-3.5 w-36 bg-muted" />
              <Skeleton className="h-3.5 w-14 bg-muted" />
              <Skeleton className="h-3.5 w-14 bg-muted" />
              <Skeleton className="h-3.5 w-12 bg-muted" />
              <Skeleton className="h-3.5 w-14 bg-muted" />
              <Skeleton className="h-5 w-20 rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Activities table ──────────────────────────────────────────────────────────

interface ActivityRowProps {
  activity: Activity
  onClick: () => void
}

function ActivityRow({ activity, onClick }: ActivityRowProps) {
  const exec = activity.executionEvaluation
    ? executionBadge(activity.executionEvaluation)
    : null

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-muted/25"
    >
      <td className="py-3.5 pl-4 pr-4 text-xs tabular-nums text-muted-foreground whitespace-nowrap">
        {formatDate(activity.date)}
      </td>
      <td className="py-3.5 pr-4">
        <span className={cn('rounded px-2 py-0.5 text-[11px] font-medium', workoutTypeBadge(activity.workoutType))}>
          {workoutTypeLabel(activity.workoutType)}
        </span>
      </td>
      <td className="py-3.5 pr-4 text-sm text-foreground/90 max-w-[180px] truncate">
        {activity.name}
      </td>
      <td className="py-3.5 pr-4 tabular-nums text-sm text-foreground/80 whitespace-nowrap">
        {activity.distanceKm.toFixed(1)} km
      </td>
      <td className="py-3.5 pr-4 tabular-nums text-sm text-foreground/80 whitespace-nowrap">
        {activity.avgPaceFormatted}
      </td>
      <td className="py-3.5 pr-4 tabular-nums text-sm text-foreground/80 whitespace-nowrap">
        {activity.avgHR != null ? `${activity.avgHR} bpm` : <span className="text-muted-foreground">—</span>}
      </td>
      <td className="py-3.5 pr-4 tabular-nums text-sm text-foreground/80 whitespace-nowrap">
        {activity.durationMinutes} min
      </td>
      <td className="py-3.5 pr-4">
        {exec ? (
          <span className={cn('rounded px-2 py-0.5 text-[11px] font-medium', exec.cls)}>
            {exec.label}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>
    </tr>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ActivitiesPage() {
  const router = useRouter()
  const [data, setData] = useState<ActivitiesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/activities?limit=20')
      if (res.status === 404) {
        setData(null)
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const json = await res.json() as { success: boolean; data?: ActivitiesData; error?: string }
      if (!json.success || !json.data) {
        throw new Error(json.error ?? 'Unexpected response')
      }
      setData(json.data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load activities'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  if (loading) return <ActivitiesSkeleton />

  if (error) {
    return (
      <ErrorState
        message={`Failed to load activities: ${error}`}
        onRetry={fetchActivities}
      />
    )
  }

  if (!data || data.activities.length === 0) {
    return (
      <Empty
        title="No activities found"
        description="Run npx prisma db seed first."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Activities</h1>
        <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {data.total}
        </span>
      </div>

      {/* Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Date', 'Type', 'Activity', 'Distance', 'Pace', 'HR', 'Duration', 'Execution'].map(h => (
                    <th
                      key={h}
                      className="pb-3 pl-4 pr-4 pt-3 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground first:pl-4 last:pr-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.activities.map(activity => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    onClick={() => router.push(`/activities/${activity.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {data.total > 20 && (
        <p className="text-center text-xs text-muted-foreground">
          Showing 20 of {data.total} activities
        </p>
      )}
    </div>
  )
}
