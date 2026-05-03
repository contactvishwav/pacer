// Singleton Anthropic client — hot-reload-safe for Next.js dev mode.

import Anthropic from '@anthropic-ai/sdk'

const g = globalThis as unknown as { _anthropic?: Anthropic }
export const anthropic = g._anthropic ?? new Anthropic()
if (process.env.NODE_ENV !== 'production') g._anthropic = anthropic

export const COACH_MODEL =
  process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'
