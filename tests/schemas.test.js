import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NarrativeStructureSchema,
  MultimodalContradictionSchema,
  InvestmentCommitteeVerdictSchema,
  toOllamaJsonSchema
} from '../shared/schemas.js';

test('toOllamaJsonSchema produces clean JSON Schema for NarrativeStructureSchema', () => {
  const jsonSchema = toOllamaJsonSchema(NarrativeStructureSchema);
  assert.equal(jsonSchema.type, 'object');
  assert.ok(jsonSchema.properties.hook);
  assert.ok(jsonSchema.properties.problem);
  assert.ok(jsonSchema.properties.solution);
  assert.ok(jsonSchema.properties.traction);
  assert.ok(jsonSchema.properties.ask);
  assert.ok(jsonSchema.properties.storyArc);
  assert.equal(jsonSchema.$schema, undefined);
});

test('InvestmentCommitteeVerdictSchema validates a complete VC verdict object', () => {
  const sample = {
    startupName: 'CloudMetrics Pro',
    overallIcScore: 22,
    verdict: 'HARD_PASS',
    liveRoast:
      'Claiming a 1.0x burn multiple while burning $350K/mo ($4.2M/yr) against $1.2M net new ARR is a 3.5x capital incinerator.',
    narrative: {
      transcriptSummary: 'CloudMetrics Pro cuts idle cloud spend...',
      hook: { score: 8, spokenQuote: 'Enterprises waste 35% of cloud spend', timestampRange: '00:00-00:05', critique: 'Strong opening hook.' },
      problem: { score: 7, spokenQuote: 'Idle Kubernetes clusters', timestampRange: '00:05-00:10', critique: 'Clear pain point.' },
      solution: { score: 7, spokenQuote: 'Autonomous FinOps agent', timestampRange: '00:10-00:15', critique: 'Clear value prop.' },
      traction: { score: 3, spokenQuote: '1.0x burn multiple', timestampRange: '00:15-00:22', critique: 'Contradicted by Slide 2.' },
      ask: { score: 5, spokenQuote: 'Raising $5M Series A', timestampRange: '00:22-00:28', critique: 'Valuation unsupported.' },
      storyArc: {
        overallArcScore: 62,
        sequenceCoherent: true,
        missingBeats: [],
        pacingDiagnosis: 'Well-paced delivery but undermined by financial contradictions.'
      }
    },
    slideAudits: [
      {
        slideIndex: 2,
        slideTitle: 'Q3 2026 Unit Economics & TAM',
        visionTokenBudgetUsed: 1120,
        detectedDensityScore: 0.62,
        keyVisualMetrics: ['Net New ARR: $1.2M', 'Monthly Burn: $350K/mo'],
        finePrintDetected: '*Footnote: Spoken pitch figures exclude $190k/mo AWS GPU cluster costs'
      }
    ],
    contradictions: [
      {
        contradictionId: 'C1',
        category: 'BURN_MULTIPLE_LIE',
        spokenClaim: '1.0x burn multiple',
        spokenTimestamp: '00:14',
        slideIndex: 2,
        slideEvidence: '$350K/mo net burn ($4.2M/yr) on $1.2M Net New ARR = 3.50x',
        severity: 'FATAL_BS',
        vcCallOut: 'Explain why you claimed a 1.0x burn multiple when Slide 2 shows 3.50x.'
      }
    ],
    toolAudits: [
      {
        toolName: 'audit_unit_economics',
        status: 'FAIL',
        computedMetrics: { actualBurnMultiple: 3.5 },
        explanation: 'Burn multiple is 3.5x vs 1.0x claimed.'
      }
    ],
    topFixRecommendation: 'Reconcile spoken burn multiple and TAM figures with Slide 2 bottom-up numbers.'
  };

  const parsed = InvestmentCommitteeVerdictSchema.safeParse(sample);
  assert.equal(parsed.success, true);

  const contraSchema = toOllamaJsonSchema(MultimodalContradictionSchema);
  assert.equal(contraSchema.type, 'object');
});
