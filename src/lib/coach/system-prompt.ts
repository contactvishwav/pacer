// Builds the system prompt sent to Claude on every coaching request.
// Serializes the compact CoachContext into structured text under 2,000 tokens.

import type { CoachContext } from '../intelligence/context'

export function buildSystemPrompt(ctx: CoachContext): string {
  const lines: string[] = []

  // ─── Persona
  lines.push(
    `You are Pacer, an AI running coach. You are coaching ${ctx.athlete.name}.`,
    '',
  )

  // ─── HR zones
  lines.push(
    '## Athlete HR Zones',
    `Easy ceiling: ${ctx.athlete.easyHRCeiling} bpm | Threshold: ${ctx.athlete.thresholdHR} bpm | Resting: ${ctx.athlete.restingHR} bpm`,
    '',
  )

  // ─── Race goal
  if (ctx.goalRace) {
    const gr = ctx.goalRace
    lines.push(
      '## Race Goal',
      `${gr.name} — ${gr.raceDate} (${gr.daysUntilRace} days away)`,
      `Target: ${gr.goalTimeFormatted} | Distance: ${gr.distanceKm} km`,
    )
    if (ctx.racePrediction) {
      const rp = ctx.racePrediction
      lines.push(
        `Prediction: ${rp.predictedTimeFormatted} (${rp.gapToGoalFormatted} vs goal, confidence ${rp.confidenceScore}/10)`,
        `Path to goal: ${rp.whatNeedsToHappen}`,
      )
    }
    lines.push('')
  }

  // ─── Current fitness
  const f = ctx.fitness
  lines.push(
    '## Current Fitness',
    `Phase: ${f.phase} (${f.phaseConfidence} confidence)`,
    `CTL ${f.ctl.toFixed(1)} | ATL ${f.atl.toFixed(1)} | TSB ${f.tsb.toFixed(1)} | ACWR ${f.acwr?.toFixed(2) ?? 'n/a'} (${f.acwrCategory})`,
    `Trend: ${f.trend}`,
    '',
  )

  // ─── Injury risk
  const ir = ctx.injuryRisk
  lines.push(
    '## Injury Risk Signal',
    `${ir.category}: ${ir.explanation}`,
    `Recommended action: ${ir.recommendedAction}`,
  )
  if (ir.contributingFactors.length > 0) {
    lines.push(`Contributing factors: ${ir.contributingFactors.join('; ')}`)
  }
  lines.push('')

  // ─── Weekly brief
  const wb = ctx.weeklyBrief
  lines.push('## Weekly Brief')
  if (wb.lastWeekReview.length > 0) {
    lines.push(`Last week: ${wb.lastWeekReview.join(' ')}`)
  }
  if (wb.thisWeekPrescription.length > 0) {
    lines.push(`This week: ${wb.thisWeekPrescription.join(' ')}`)
  }
  lines.push(`Key signal: ${wb.keySignal}`)
  if (wb.warnings.length > 0) {
    lines.push(`Warnings: ${wb.warnings.join('; ')}`)
  }
  lines.push(`Focus: ${wb.suggestedFocus}`, '')

  // ─── Recent workouts
  if (ctx.recentActivities.length > 0) {
    lines.push('## Recent Workouts (newest first)')
    for (const a of ctx.recentActivities.slice(0, 5)) {
      const ev = a.executionEvaluation ?? 'unrated'
      lines.push(`${a.date}: ${a.workoutType} ${a.distanceKm} km — ${ev} (TRIMP ${a.trainingLoad})`)
    }
    lines.push('')
  }

  // ─── Memory summary from older conversations
  if (ctx.memorySummary) {
    lines.push('## Previous Conversation Context', ctx.memorySummary, '')
  }

  // ─── Activity-specific context (when discussing a specific run)
  if (ctx.selectedActivity) {
    const sa = ctx.selectedActivity
    lines.push(
      '## Activity Being Discussed',
      `${sa.date}: ${sa.workoutType} ${sa.distanceKm} km in ${sa.durationMinutes} min`,
    )
    if (sa.avgHR) {
      lines.push(`Avg HR: ${sa.avgHR} bpm | Pace: ${sa.avgPaceFormatted}`)
    }
    if (sa.executionEvaluation) {
      lines.push(`Execution: ${sa.executionEvaluation}`)
    }
    if (sa.executionNote) {
      lines.push(`Note: ${sa.executionNote}`)
    }
    lines.push(`Training load: ${sa.trainingLoad} TRIMP`, '')
  }

  // ─── Coaching instructions
  lines.push(
    '## Coaching Instructions',
    '- Be concise and direct. Target 150–250 words unless the question genuinely requires more.',
    '- Use specific numbers from the context when they support your point.',
    '- Use "risk signal", "training-load spike", "caution range" — never medical diagnoses.',
    '- Do not repeat information already visible on the athlete\'s dashboard.',
    '- End your response with exactly one suggested follow-up question on its own line, prefixed with "→ ".',
    '  Example: → How does my long run pace compare to race pace?',
  )

  return lines.join('\n')
}
