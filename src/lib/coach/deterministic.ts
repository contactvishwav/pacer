// Deterministic coaching response built entirely from computed signals.
// Used when ANTHROPIC_API_KEY is absent or when a Claude call fails mid-stream.
// Produces ~150–200 words of actionable coaching prose with no AI call.

import type { CoachContext } from '../intelligence/context'

export function buildDeterministicCoachingResponse(context: CoachContext): string {
  const parts: string[] = []

  // 1. Phase + days until race
  const phase   = context.fitness.phase.replace(/_/g, ' ').toLowerCase()
  const daysNote = context.fitness.daysUntilRace > 0
    ? ` with ${context.fitness.daysUntilRace} days until your race`
    : ''
  parts.push(`You're currently in ${phase} phase${daysNote}.`)

  // 2. Key signal from the weekly brief
  parts.push(context.weeklyBrief.keySignal)

  // 3. Elevated injury risk: surface explanation + recommended action
  const { injuryRisk } = context
  if (injuryRisk.category === 'caution' || injuryRisk.category === 'high-risk') {
    parts.push(
      `Injury risk signal: ${injuryRisk.explanation}\n${injuryRisk.recommendedAction}`,
    )
  }

  // 4. Race prediction gap and path to goal
  if (context.racePrediction) {
    const rp = context.racePrediction
    parts.push(`Race prediction: ${rp.gapToGoalFormatted}. ${rp.whatNeedsToHappen}`)
  }

  // 5. This week's prescription as a short bullet list
  const prescription = context.weeklyBrief.thisWeekPrescription
  if (prescription.length > 0) {
    const bullets = prescription.map(item => `• ${item}`).join('\n')
    parts.push(`This week:\n${bullets}`)
  }

  // 6. Suggested focus as the closing line
  parts.push(context.weeklyBrief.suggestedFocus)

  return parts.join('\n\n')
}
