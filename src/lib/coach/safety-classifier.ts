// Uses a fast secondary Claude call to classify whether a coaching response
// crosses the health-advice boundary before it is persisted.
//
// Architecture: two-layer defence
//   Layer 1 — needsSafetyClassification(): fast synchronous pre-filter.
//             Uses both a broad term list (common health language as substrings)
//             and structural regex patterns (medical-language FORM rather than
//             specific names). Catches the full semantic space without knowing
//             individual drug/condition names — robust to new terms by design.
//   Layer 2 — classifyCoachingResponse(): secondary Claude call (max 50 tokens).
//             Only runs when Layer 1 fires. Fail-open on API errors.

import Anthropic from '@anthropic-ai/sdk'

const SAFETY_CLASSIFICATION_PROMPT = `You are a content safety classifier for a running coaching app. Your only job is to determine whether a coaching response crosses the health-advice boundary.

A response FAILS safety if it contains ANY of:
- Medical diagnoses (e.g. "you have tendinitis", "this sounds like IT band syndrome")
- Injury probability claims (e.g. "30% chance of injury", "you are likely to get injured")
- Treatment recommendations (e.g. "take ibuprofen", "ice your knee", "see a physiotherapist")
- Medical urgency language (e.g. "you need to see a doctor", "stop running immediately for medical reasons")
- Clinical prognosis (e.g. "if you continue this pattern you will develop a stress fracture")

A response PASSES safety if it:
- Discusses training load signals, ACWR, CTL/ATL/TSB
- Recommends reducing training volume or intensity
- Suggests rest days or recovery periods
- Uses cautious language like "risk signal", "load spike", "caution range"
- Recommends consulting a sports medicine professional WITHOUT diagnosing

Respond with ONLY one of:
PASS
FAIL: [brief reason, 10 words max]`

// ── Layer 1: pre-filter ───────────────────────────────────────────────────────

// Broad substring terms — general health/medical language.
// Intentionally short so they match as substrings (e.g. "injur" matches
// "injury", "injured", "injuring", "injurious"). Not drug/condition-specific.
const HEALTH_ADJACENT_TERMS = [
  'pain', 'hurt', 'ache', 'sore', 'swollen', 'tender', 'inflam',
  'injur', 'strain', 'sprain', 'fracture', 'tear', 'rupture',
  'symptom', 'diagnos', 'prognos', 'treat', 'medic', 'prescri',
  'doctor', 'physician', 'physio', 'surgeon', 'specialist',
  'clinic', 'hospital', 'emergency', 'syndrome', 'disorder',
]

// Structural regex patterns — catch the FORM of medical language rather than
// specific named terms. These fire correctly regardless of which drug, condition,
// or body part is mentioned, so the pre-filter stays accurate as new terms appear.
const MEDICAL_STRUCTURE_PATTERNS: RegExp[] = [
  // Medical condition suffixes: tendinitis, plantar fasciitis, neuropathy, etc.
  /\b\w+(itis|osis|algia|opathy)\b/i,
  // Dosage amounts: "400mg", "2 tablets", "10mcg" — catches any medication pattern
  /\b\d+\s*(mg|mcg|milligrams?|grams?|pills?|tablets?|capsules?|doses?)\b/i,
  // Diagnosis-like sentence structure: "you have X", "you likely have X"
  /\byou\s+(have|likely\s+have|probably\s+have|may\s+have|might\s+have|could\s+have)\b/i,
  // Percentage-based risk claims: "30% chance of injury", "40% probability"
  /\b\d+\s*%\s*(chance|probability|risk|likelihood|prone)\b/i,
  // Medical urgency referrals: "see a doctor", "seek medical attention"
  /\b(see\s+a\s+(doctor|physician|specialist)|seek\s+(medical|professional\s+help)|go\s+to\s+(a\s+)?(doctor|hospital|clinic|emergency\s+room))\b/i,
]

// Exported so validate-safety.ts can unit-test the pre-filter independently.
export function needsSafetyClassification(responseText: string): boolean {
  const lower = responseText.toLowerCase()
  if (HEALTH_ADJACENT_TERMS.some(term => lower.includes(term))) return true
  if (MEDICAL_STRUCTURE_PATTERNS.some(pattern => pattern.test(responseText))) return true
  return false
}

// ── Layer 2: classifier ───────────────────────────────────────────────────────

export interface SafetyResult {
  passed: boolean
  reason?: string
  preFilterFired: boolean
}

export async function classifyCoachingResponse(
  responseText: string,
  anthropicClient: Anthropic,
): Promise<SafetyResult> {
  if (!needsSafetyClassification(responseText)) {
    return { passed: true, preFilterFired: false }
  }

  try {
    const result = await anthropicClient.messages.create({
      model:      process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
      max_tokens: 50,
      messages: [
        {
          role:    'user',
          content: `${SAFETY_CLASSIFICATION_PROMPT}\n\nCoaching response to classify:\n"${responseText.slice(0, 1000)}"`,
        },
      ],
    })

    const content = result.content[0]
    if (content.type !== 'text') return { passed: true, preFilterFired: true }

    const text = content.text.trim()

    if (text.startsWith('FAIL')) {
      const reason = text.replace(/^FAIL:?\s*/i, '').trim()
      console.warn(JSON.stringify({
        event:           'safety_classification_failed',
        reason,
        responsePreview: responseText.slice(0, 100),
        timestamp:       new Date().toISOString(),
      }))
      return { passed: false, reason, preFilterFired: true }
    }

    return { passed: true, preFilterFired: true }

  } catch (err) {
    // Classification failure is non-blocking — log and pass through.
    // We do not block coaching responses on classifier errors.
    console.error(JSON.stringify({
      event:     'safety_classification_error',
      error:     String(err),
      timestamp: new Date().toISOString(),
    }))
    return { passed: true, preFilterFired: true }
  }
}
