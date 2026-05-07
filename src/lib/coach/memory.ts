// Coach memory data-access and retention enforcement.
// Business logic for CoachMemory CRUD — called by thin route handlers.
// Memory is global per athlete, not scoped to a session.

import { prisma } from '../db/prisma'

const MEMORY_RETENTION_LIMIT = 25

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemorySummary {
  id:             string
  summary:        string
  createdAt:      string
  conversationId: string | null
}

// ─── List memories ────────────────────────────────────────────────────────────

export async function listMemories(athleteId: string): Promise<MemorySummary[]> {
  const records = await prisma.coachMemory.findMany({
    where:   { athleteId },
    orderBy: { createdAt: 'desc' },
  })
  return records.map(r => ({
    id:             r.id,
    summary:        r.summary,
    createdAt:      r.createdAt.toISOString(),
    conversationId: r.conversationId ?? null,
  }))
}

// ─── Delete all memories ──────────────────────────────────────────────────────

export async function deleteAllMemories(athleteId: string): Promise<number> {
  const result = await prisma.coachMemory.deleteMany({ where: { athleteId } })
  return result.count
}

// ─── Delete single memory ─────────────────────────────────────────────────────

export async function deleteMemory(
  id:        string,
  athleteId: string,
): Promise<'deleted' | 'not_found' | 'forbidden'> {
  const record = await prisma.coachMemory.findUnique({ where: { id } })
  if (!record) return 'not_found'
  if (record.athleteId !== athleteId) return 'forbidden'
  await prisma.coachMemory.delete({ where: { id } })
  return 'deleted'
}

// ─── Update memory summary ────────────────────────────────────────────────────

export async function updateMemory(
  id:        string,
  athleteId: string,
  summary:   string,
): Promise<{ id: string; summary: string; updatedAt: string } | 'not_found' | 'forbidden'> {
  const record = await prisma.coachMemory.findUnique({ where: { id } })
  if (!record) return 'not_found'
  if (record.athleteId !== athleteId) return 'forbidden'

  const updated = await prisma.coachMemory.update({
    where: { id },
    data:  { summary: summary.trim() },
  })
  return {
    id:        updated.id,
    summary:   updated.summary,
    updatedAt: updated.updatedAt.toISOString(),
  }
}

// ─── Retention policy ─────────────────────────────────────────────────────────
// Called fire-and-forget after every successful memory write.
// Keeps the per-athlete memory count at MEMORY_RETENTION_LIMIT by deleting
// the oldest records when the limit is exceeded.

export async function enforceMemoryRetentionPolicy(athleteId: string): Promise<void> {
  try {
    const count = await prisma.coachMemory.count({ where: { athleteId } })
    if (count <= MEMORY_RETENTION_LIMIT) return

    const overflow = count - MEMORY_RETENTION_LIMIT
    const oldest = await prisma.coachMemory.findMany({
      where:   { athleteId },
      orderBy: { createdAt: 'asc' },
      take:    overflow,
      select:  { id: true },
    })

    await prisma.coachMemory.deleteMany({
      where: { id: { in: oldest.map(r => r.id) } },
    })
  } catch (err) {
    console.error('[Pacer] Memory retention policy enforcement failed:', err)
  }
}
