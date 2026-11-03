import test from 'node:test';
import assert from 'node:assert/strict';
import {
  audit_unit_economics,
  verify_tam_math,
  check_slide_density,
  flag_buzzword_overload,
  executeVcTool
} from '../shared/tools.js';

test('audit_unit_economics catches CloudMetrics Pro 3.50x burn multiple lie', () => {
  const res = audit_unit_economics({
    monthlyNetBurnUsd: 350000,
    netNewArrUsd: 1200000,
    claimedBurnMultiple: 1.0,
    cacUsd: 18400,
    ltvUsd: 31200,
    claimedLtvCacRatio: 4.8
  });

  assert.equal(res.status, 'FAIL');
  assert.equal(res.computedMetrics.actualBurnMultiple, 3.5);
  assert.equal(res.computedMetrics.burnVerdict, 'CAPITAL_INCINERATOR');
  assert.equal(res.computedMetrics.actualLtvCacRatio, 1.7);
  assert.equal(res.computedMetrics.healthStatus, 'CRITICAL');
});

test('audit_unit_economics passes VeraGrid Energy disciplined unit economics', () => {
  const res = audit_unit_economics({
    monthlyNetBurnUsd: 100000,
    netNewArrUsd: 1600000,
    claimedBurnMultiple: 0.75,
    cacUsd: 12000,
    ltvUsd: 72000,
    claimedLtvCacRatio: 6.0
  });

  assert.equal(res.status, 'PASS');
  assert.equal(res.computedMetrics.actualBurnMultiple, 0.75);
  assert.equal(res.computedMetrics.actualLtvCacRatio, 6.0);
  assert.equal(res.computedMetrics.healthStatus, 'HEALTHY');
});

test('verify_tam_math flags 200x top-down TAM inflation on CloudMetrics Pro', () => {
  const res = verify_tam_math({
    claimedTamUsd: 90_000_000_000,
    targetCustomerCount: 150_000,
    annualPricePerCustomerUsd: 3_000
  });

  assert.equal(res.status, 'FAIL');
  assert.equal(res.computedMetrics.calculatedBottomUpTamUsd, 450_000_000);
  assert.equal(res.computedMetrics.inflationRatio, 200);
  assert.equal(res.computedMetrics.verdict, 'TAM_INFLATED');
});

test('check_slide_density flags 96-word wall of text and recommends 1120 vision tokens', () => {
  const res = check_slide_density({
    slideIndex: 3,
    wordCount: 96,
    dataPointCount: 19
  });

  assert.equal(res.status, 'FAIL');
  assert.equal(res.computedMetrics.readabilityGrade, 'WALL_OF_TEXT');
  assert.equal(res.computedMetrics.recommendedVisionTokenBudget, 1120);
});

test('flag_buzzword_overload catches QuantumSynergy.ai hype overload', () => {
  const res = flag_buzzword_overload({
    spokenTranscript:
      'We build autonomous quantum synergy blockchain neural-mesh hyper-scale agentic web4 infrastructure with an infinite moat.',
    slideHeaders: ['Quantum Synergy Paradigm'],
    pitchDurationSeconds: 20
  });

  assert.equal(res.status, 'FAIL');
  assert.equal(res.computedMetrics.verdict, 'OVERLOAD');
  assert.ok(res.computedMetrics.totalBuzzwords >= 8);
});

test('executeVcTool dispatches all 4 registered VC tools cleanly', () => {
  const res = executeVcTool('verify_tam_math', {
    claimedTamUsd: 675_000_000,
    targetCustomerCount: 45_000,
    annualPricePerCustomerUsd: 15_000
  });
  assert.equal(res.status, 'PASS');
  assert.equal(res.computedMetrics.verdict, 'MATH_CONSISTENT');
});
