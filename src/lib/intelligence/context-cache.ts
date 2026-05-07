// In-memory cache for AthleteIntelligenceContext.
// Module-level singleton — persists across requests in the same Vercel function
// instance (warm starts). Each cold start begins with an empty cache.
//
// IMPORTANT: Call invalidateCachedContext(athleteId) in any route handler that
// creates or updates Activity, WeeklyTrainingSummary, GoalRace, or Athlete
// records. Failing to invalidate means stale coaching signals until TTL expires.

import type { AthleteIntelligenceContext } from './context'

interface CacheEntry {
  context:    AthleteIntelligenceContext
  computedAt: number   // Date.now()
  athleteId:  string
}

const cache = new Map<string, CacheEntry>()

const CACHE_TTL_MS = 30_000  // 30 seconds

export function getCachedContext(athleteId: string): AthleteIntelligenceContext | null {
  const entry = cache.get(athleteId)
  if (!entry) return null
  if (Date.now() - entry.computedAt > CACHE_TTL_MS) {
    cache.delete(athleteId)
    return null
  }
  return entry.context
}

export function setCachedContext(
  athleteId: string,
  context:   AthleteIntelligenceContext,
): void {
  cache.set(athleteId, {
    context,
    computedAt: Date.now(),
    athleteId,
  })
}

export function invalidateCachedContext(athleteId: string): void {
  cache.delete(athleteId)
}

export function getCacheStats(): { size: number; keys: string[] } {
  return { size: cache.size, keys: Array.from(cache.keys()) }
}
