import { z } from 'zod'

// ─── Generic API response wrapper ─────────────────────────────────────────────

// Base schema validates the envelope without constraining the data shape.
// Use createTypedApiResponseSchema for endpoint-specific validation.
export const ApiResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    data: z.unknown(),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
    code: z.string().optional(),
  }),
])
export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// Typed variant: wraps a known data schema in the success/error envelope.
export function createTypedApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.discriminatedUnion('success', [
    z.object({ success: z.literal(true), data: dataSchema }),
    z.object({ success: z.literal(false), error: z.string(), code: z.string().optional() }),
  ])
}

// Convenience: build a typed success response
export function apiSuccess<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

// Convenience: build a typed error response
export function apiError(error: string, code?: string): ApiResponse<never> {
  return { success: false, error, ...(code ? { code } : {}) }
}
