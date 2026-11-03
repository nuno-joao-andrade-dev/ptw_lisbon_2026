import { z } from 'zod';

// 1. Narrative Beat Schema (Step 2)
export const NarrativeBeatSchema = z.object({
  score: z.number().min(0).max(10).describe('Score from 0 to 10 for this narrative beat'),
  spokenQuote: z.string().describe('Direct quote or key phrase from the spoken pitch'),
  timestampRange: z.string().describe('Approximate timestamp range in the 30s audio, e.g. "00:00-00:06"'),
  critique: z.string().describe('Concise 1-sentence VC critique of this beat')
});

export const StoryArcEvaluationSchema = z.object({
  overallArcScore: z.number().min(0).max(100).describe('Overall narrative arc score from 0 to 100'),
  sequenceCoherent: z.boolean().describe('True if Hook -> Problem -> Solution -> Traction -> Ask flows logically'),
  missingBeats: z.array(z.string()).describe('Any missing or weak narrative beats'),
  pacingDiagnosis: z.string().describe('Pacing and delivery diagnosis of the 30-second spoken pitch')
});

// Step 2: NarrativeStructureSchema
export const NarrativeStructureSchema = z.object({
  transcriptSummary: z.string().describe('Verbatim or near-verbatim transcript of the spoken pitch'),
  hook: NarrativeBeatSchema,
  problem: NarrativeBeatSchema,
  solution: NarrativeBeatSchema,
  traction: NarrativeBeatSchema,
  ask: NarrativeBeatSchema,
  storyArc: StoryArcEvaluationSchema
});

// Step 3: Slide Audit & Contradictions
export const SlideAuditSchema = z.object({
  slideIndex: z.number().int().min(1).max(3),
  slideTitle: z.string(),
  visionTokenBudgetUsed: z.number().describe('280 for layout or 1120 for dense slide inspection'),
  detectedDensityScore: z.number().min(0).max(1),
  keyVisualMetrics: z.array(z.string()).describe('Numbers, claims, and metrics read directly from the slide image'),
  finePrintDetected: z.string().nullable().describe('Any small footnote or fine-print text read from the slide, or null if unread')
});

export const ContradictionItemSchema = z.object({
  contradictionId: z.string(),
  category: z.enum([
    'REVENUE_MISMATCH',
    'BURN_MULTIPLE_LIE',
    'TAM_INFLATION',
    'UNIT_ECONOMICS_TRAP',
    'CHURN_CONCEALMENT',
    'TIMELINE_CONFLICT'
  ]),
  spokenClaim: z.string().describe('What the founder claimed out loud in the audio'),
  spokenTimestamp: z.string().describe('Approximate timestamp in the audio, e.g. "00:14"'),
  slideIndex: z.number().int().min(1).max(3),
  slideEvidence: z.string().describe('What the slide image actually shows in tables, charts, or footnotes'),
  severity: z.enum(['MINOR', 'MAJOR', 'FATAL_BS']),
  vcCallOut: z.string().describe('Sharp VC question calling out the contradiction')
});

// Step 3: MultimodalContradictionSchema
export const MultimodalContradictionSchema = z.object({
  narrative: NarrativeStructureSchema,
  slideAudits: z.array(SlideAuditSchema),
  contradictions: z.array(ContradictionItemSchema),
  crossModalAlignmentScore: z.number().min(0).max(100)
});

// Step 4 & 5: Tool Verification & Final IC Verdict
export const ToolVerificationResultSchema = z.object({
  toolName: z.enum([
    'audit_unit_economics',
    'verify_tam_math',
    'check_slide_density',
    'flag_buzzword_overload'
  ]),
  status: z.enum(['PASS', 'WARNING', 'FAIL']),
  computedMetrics: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])),
  explanation: z.string()
});

export const InvestmentCommitteeVerdictSchema = z.object({
  startupName: z.string(),
  overallIcScore: z.number().min(0).max(100),
  verdict: z.enum(['INVEST', 'DIG_DEEPER', 'HARD_PASS']),
  liveRoast: z.string().describe('Punchy 2-3 sentence VC roast referencing specific spoken vs slide numbers'),
  narrative: NarrativeStructureSchema,
  slideAudits: z.array(SlideAuditSchema),
  contradictions: z.array(ContradictionItemSchema),
  toolAudits: z.array(ToolVerificationResultSchema),
  topFixRecommendation: z.string().describe('Single highest-leverage action the founder must take to fix the pitch')
});

/**
 * Converts a Zod v4 schema to a clean JSON Schema object compatible with
 * Local Ollama's `format` parameter.
 */
export function toOllamaJsonSchema(zodSchema) {
  const rawSchema = z.toJSONSchema(zodSchema);
  const { $schema, ...cleanSchema } = rawSchema;
  return cleanSchema;
}
