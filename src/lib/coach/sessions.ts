// Coach session management — thin data-access functions called by route handlers.
// Session = one named conversation thread. Memory is global per athlete, not per session.

import { prisma } from '../db/prisma'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionSummary {
  id:           string
  name:         string
  createdAt:    string
  updatedAt:    string
  messageCount: number
}

export interface SessionMessage {
  id:        string
  role:      'user' | 'assistant'
  content:   string
  createdAt: string
  metadata:  unknown
}

// ─── List sessions ────────────────────────────────────────────────────────────

export async function listSessions(athleteId: string): Promise<SessionSummary[]> {
  const sessions = await prisma.coachSession.findMany({
    where:   { athleteId },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { messages: true } } },
  })

  return sessions.map(s => ({
    id:           s.id,
    name:         s.name,
    createdAt:    s.createdAt.toISOString(),
    updatedAt:    s.updatedAt.toISOString(),
    messageCount: s._count.messages,
  }))
}

// ─── Create session ───────────────────────────────────────────────────────────

export async function createSession(athleteId: string): Promise<SessionSummary> {
  const session = await prisma.coachSession.create({
    data: { athleteId, name: 'New conversation' },
  })
  return {
    id:           session.id,
    name:         session.name,
    createdAt:    session.createdAt.toISOString(),
    updatedAt:    session.updatedAt.toISOString(),
    messageCount: 0,
  }
}

// ─── Rename session ───────────────────────────────────────────────────────────

export async function renameSession(
  sessionId: string,
  athleteId: string,
  name: string,
): Promise<SessionSummary | null> {
  const session = await prisma.coachSession.findUnique({ where: { id: sessionId } })
  if (!session || session.athleteId !== athleteId) return null

  const trimmed = name.trim().slice(0, 100)
  if (!trimmed) return null

  const updated = await prisma.coachSession.update({
    where: { id: sessionId },
    data:  { name: trimmed },
    include: { _count: { select: { messages: true } } },
  })
  return {
    id:           updated.id,
    name:         updated.name,
    createdAt:    updated.createdAt.toISOString(),
    updatedAt:    updated.updatedAt.toISOString(),
    messageCount: updated._count.messages,
  }
}

// ─── Delete session ───────────────────────────────────────────────────────────

export async function deleteSession(
  sessionId: string,
  athleteId: string,
): Promise<boolean> {
  const session = await prisma.coachSession.findUnique({ where: { id: sessionId } })
  if (!session || session.athleteId !== athleteId) return false
  await prisma.coachSession.delete({ where: { id: sessionId } })
  return true
}

// ─── Get session messages ─────────────────────────────────────────────────────

export async function getSessionMessages(
  sessionId: string,
  athleteId: string,
): Promise<SessionMessage[] | null> {
  const session = await prisma.coachSession.findUnique({ where: { id: sessionId } })
  if (!session || session.athleteId !== athleteId) return null

  const messages = await prisma.coachMessage.findMany({
    where:   { sessionId },
    orderBy: { createdAt: 'asc' },
  })

  return messages
    .filter(m => m.role !== 'SYSTEM')
    .map(m => ({
      id:        m.id,
      role:      m.role === 'USER' ? ('user' as const) : ('assistant' as const),
      content:   m.content,
      createdAt: m.createdAt.toISOString(),
      metadata:  m.metadata ?? null,
    }))
}

// ─── Touch session updatedAt ──────────────────────────────────────────────────
// Called after a message is saved to keep ordering by most recent activity.

export async function touchSession(sessionId: string): Promise<void> {
  await prisma.coachSession.update({
    where: { id: sessionId },
    data:  { updatedAt: new Date() },
  })
}
