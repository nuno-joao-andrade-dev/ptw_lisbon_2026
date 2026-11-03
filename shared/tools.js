/**
 * Deterministic VC Verification Tool Suite ("Bullshit Detector")
 * Used by Local Ollama (`gemma4:e2b` / `gemma4:e4b`) in Step 4 and Step 5.
 */

export const VC_BUZZWORD_LEXICON = [
  'quantum',
  'synergy',
  'blockchain',
  'hyper-scale',
  'hyperscale',
  'autonomous',
  'paradigm',
  'agentic',
  'web4',
  'infinite',
  'disruptive',
  'moat',
  'exponential',
  'decentralized',
  'zero-knowledge',
  'neural-mesh'
];

/**
 * 1. audit_unit_economics (Consolidates Burn Multiple + LTV:CAC verification)
 */
export function audit_unit_economics({
  monthlyNetBurnUsd = 0,
  netNewArrUsd = 0,
  claimedBurnMultiple = null,
  cacUsd = 0,
  ltvUsd = 0,
  claimedLtvCacRatio = null,
  grossMarginPct = 80
}) {
  const annualBurnUsd = Number(monthlyNetBurnUsd) * 12;
  const safeNetNewArr = Math.max(1, Number(netNewArrUsd));
  const actualBurnMultiple = Number((annualBurnUsd / safeNetNewArr).toFixed(2));
  const safeCac = Math.max(1, Number(cacUsd));
  const actualLtvCacRatio = Number((Number(ltvUsd) / safeCac).toFixed(2));
  const paybackMonths = Number(
    (safeCac / Math.max(1, (Number(ltvUsd) / 36) * (Number(grossMarginPct) / 100))).toFixed(1)
  );

  const burnDiscrepancy =
    claimedBurnMultiple !== null && claimedBurnMultiple !== undefined
      ? Number(Math.abs(actualBurnMultiple - Number(claimedBurnMultiple)).toFixed(2))
      : 0;

  const ltvCacDiscrepancy =
    claimedLtvCacRatio !== null && claimedLtvCacRatio !== undefined
      ? Number(Math.abs(actualLtvCacRatio - Number(claimedLtvCacRatio)).toFixed(2))
      : 0;

  let burnVerdict = 'ELITE';
  if (actualBurnMultiple > 3.0) burnVerdict = 'CAPITAL_INCINERATOR';
  else if (actualBurnMultiple > 2.0) burnVerdict = 'CONCERNING';
  else if (actualBurnMultiple > 1.0) burnVerdict = 'GOOD';

  let healthStatus = 'HEALTHY';
  let status = 'PASS';

  if (
    actualBurnMultiple > 3.0 ||
    burnDiscrepancy > 0.25 ||
    actualLtvCacRatio < 2.0 ||
    ltvCacDiscrepancy > 0.5
  ) {
    healthStatus = 'CRITICAL';
    status = 'FAIL';
  } else if (actualBurnMultiple > 2.0 || actualLtvCacRatio < 3.0) {
    healthStatus = 'STRETCHED';
    status = 'WARNING';
  }

  const reasons = [];
  if (burnDiscrepancy > 0.25 && claimedBurnMultiple !== null) {
    reasons.push(
      `Claimed ${claimedBurnMultiple}x burn multiple vs actual ${actualBurnMultiple}x ($${(annualBurnUsd / 1e6).toFixed(2)}M/yr burn on $${(safeNetNewArr / 1e6).toFixed(2)}M net new ARR)`
    );
  } else {
    reasons.push(`Burn multiple is ${actualBurnMultiple}x (${burnVerdict})`);
  }

  if (ltvCacDiscrepancy > 0.5 && claimedLtvCacRatio !== null) {
    reasons.push(`Claimed ${claimedLtvCacRatio}x LTV:CAC vs actual ${actualLtvCacRatio}x`);
  } else {
    reasons.push(`LTV:CAC is ${actualLtvCacRatio}x`);
  }

  return {
    toolName: 'audit_unit_economics',
    status,
    computedMetrics: {
      annualBurnUsd,
      actualBurnMultiple,
      claimedBurnMultiple: claimedBurnMultiple ?? actualBurnMultiple,
      burnDiscrepancy,
      burnVerdict,
      actualLtvCacRatio,
      claimedLtvCacRatio: claimedLtvCacRatio ?? actualLtvCacRatio,
      paybackMonths,
      healthStatus
    },
    explanation: reasons.join(' | ')
  };
}

/**
 * 2. verify_tam_math (Bottom-Up vs Top-Down TAM verification)
 */
export function verify_tam_math({
  claimedTamUsd = 0,
  targetCustomerCount = 0,
  annualPricePerCustomerUsd = 0
}) {
  const calculatedBottomUpTamUsd = Number(targetCustomerCount) * Number(annualPricePerCustomerUsd);
  const safeBottomUp = Math.max(1, calculatedBottomUpTamUsd);
  const inflationRatio = Number((Number(claimedTamUsd) / safeBottomUp).toFixed(2));
  const discrepancyUsd = Number(claimedTamUsd) - calculatedBottomUpTamUsd;

  let verdict = 'MATH_CONSISTENT';
  let status = 'PASS';

  if (inflationRatio > 1.25 || inflationRatio < 0.75) {
    verdict = 'TAM_INFLATED';
    status = 'FAIL';
  }

  const formatUsd = (val) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  return {
    toolName: 'verify_tam_math',
    status,
    computedMetrics: {
      claimedTamUsd: Number(claimedTamUsd),
      calculatedBottomUpTamUsd,
      discrepancyUsd,
      inflationRatio,
      verdict
    },
    explanation:
      status === 'FAIL'
        ? `Claimed TAM of ${formatUsd(Number(claimedTamUsd))} is ${inflationRatio}x larger than bottom-up math (${Number(targetCustomerCount).toLocaleString()} customers × $${Number(annualPricePerCustomerUsd).toLocaleString()}/yr = ${formatUsd(calculatedBottomUpTamUsd)}).`
        : `Bottom-up TAM math matches (${Number(targetCustomerCount).toLocaleString()} × $${Number(annualPricePerCustomerUsd).toLocaleString()}/yr = ${formatUsd(calculatedBottomUpTamUsd)}).`
  };
}

/**
 * 3. check_slide_density (Slide cognitive load + 280 vs 1120 vision budget advisor)
 */
export function check_slide_density({
  slideIndex = 1,
  wordCount = 0,
  dataPointCount = 0
}) {
  const words = Number(wordCount);
  const points = Number(dataPointCount);

  let readabilityGrade = 'OPTIMAL';
  let status = 'PASS';

  if (words > 75 || points > 18) {
    readabilityGrade = 'WALL_OF_TEXT';
    status = 'FAIL';
  } else if (words > 45 || points > 10) {
    readabilityGrade = 'DENSE';
    status = 'WARNING';
  }

  const recommendedVisionTokenBudget = words > 40 || points >= 6 ? 1120 : 280;
  const cognitiveLoadScore = Math.min(100, Math.round(words * 0.85 + points * 2.2));

  return {
    toolName: 'check_slide_density',
    status,
    computedMetrics: {
      slideIndex: Number(slideIndex),
      wordCount: words,
      dataPointCount: points,
      cognitiveLoadScore,
      readabilityGrade,
      recommendedVisionTokenBudget
    },
    explanation:
      status === 'FAIL'
        ? `Slide #${slideIndex} is a ${readabilityGrade} (${words} words, ${points} data points) — requires ${recommendedVisionTokenBudget} vision tokens and immediate decluttering.`
        : `Slide #${slideIndex} readability is ${readabilityGrade} (${words} words, ${points} data points; recommended budget: ${recommendedVisionTokenBudget} tokens).`
  };
}

/**
 * 4. flag_buzzword_overload (Jargon density detector)
 */
export function flag_buzzword_overload({
  spokenTranscript = '',
  slideHeaders = [],
  pitchDurationSeconds = 30
}) {
  const combinedText = `${spokenTranscript} ${(slideHeaders || []).join(' ')}`.toLowerCase();
  const matchedTerms = [];

  for (const buzzword of VC_BUZZWORD_LEXICON) {
    const regex = new RegExp(`\\b${buzzword.replace('-', '[-\\s]?')}\\b`, 'gi');
    const matches = combinedText.match(regex);
    if (matches && matches.length > 0) {
      matchedTerms.push(...matches.map((m) => m.toLowerCase()));
    }
  }

  const totalBuzzwords = matchedTerms.length;
  const safeDuration = Math.max(5, Number(pitchDurationSeconds));
  const buzzwordsPerMinute = Number(((totalBuzzwords / safeDuration) * 60).toFixed(1));

  let verdict = 'CLEAN';
  let status = 'PASS';

  if (totalBuzzwords >= 5) {
    verdict = 'OVERLOAD';
    status = 'FAIL';
  } else if (totalBuzzwords >= 3) {
    verdict = 'MODERATE';
    status = 'WARNING';
  }

  const uniqueHits = [...new Set(matchedTerms)];

  return {
    toolName: 'flag_buzzword_overload',
    status,
    computedMetrics: {
      totalBuzzwords,
      buzzwordsPerMinute,
      matchedTerms: uniqueHits.join(', ') || 'none',
      verdict
    },
    explanation:
      totalBuzzwords === 0
        ? 'Zero VC hype buzzwords detected (0.0/min).'
        : `Detected ${totalBuzzwords} buzzword hits (${buzzwordsPerMinute}/min) [${uniqueHits.slice(0, 6).join(', ')}] — Verdict: ${verdict}.`
  };
}

/**
 * Ollama Native Tool Calling Definitions (`/api/chat` `tools` parameter)
 */
export const OLLAMA_VC_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'audit_unit_economics',
      description:
        'Verify startup unit economics including Burn Multiple ((monthlyNetBurnUsd * 12) / netNewArrUsd), LTV:CAC ratio, and compare against spoken claims.',
      parameters: {
        type: 'object',
        properties: {
          monthlyNetBurnUsd: {
            type: 'number',
            description: 'Monthly net burn in USD from the financial slide (e.g., 350000)'
          },
          netNewArrUsd: {
            type: 'number',
            description: 'Annualized or Net New ARR in USD from the slide (e.g., 1200000)'
          },
          claimedBurnMultiple: {
            type: 'number',
            description: 'Burn multiple claimed by the founder in the spoken audio (e.g., 1.0)'
          },
          cacUsd: {
            type: 'number',
            description: 'Customer Acquisition Cost (CAC) in USD from the slide (e.g., 18400)'
          },
          ltvUsd: {
            type: 'number',
            description: 'Customer Lifetime Value (LTV) in USD from the slide (e.g., 31200)'
          },
          claimedLtvCacRatio: {
            type: 'number',
            description: 'LTV:CAC ratio claimed in the spoken audio (e.g., 4.8)'
          },
          grossMarginPct: {
            type: 'number',
            description: 'Gross margin percentage (0-100), default 80'
          }
        },
        required: ['monthlyNetBurnUsd', 'netNewArrUsd', 'cacUsd', 'ltvUsd']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'verify_tam_math',
      description:
        'Verify whether the founder claimed Total Addressable Market (TAM) matches bottom-up math (targetCustomerCount * annualPricePerCustomerUsd).',
      parameters: {
        type: 'object',
        properties: {
          claimedTamUsd: {
            type: 'number',
            description: 'Top-line TAM in USD claimed by the founder (e.g., 90000000000 for $90B)'
          },
          targetCustomerCount: {
            type: 'number',
            description: 'Number of target customers listed on the slide (e.g., 150000)'
          },
          annualPricePerCustomerUsd: {
            type: 'number',
            description: 'Annual contract value (ACV) per customer in USD (e.g., 3000)'
          }
        },
        required: ['claimedTamUsd', 'targetCustomerCount', 'annualPricePerCustomerUsd']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_slide_density',
      description:
        'Evaluate a slide word count and data point count to flag walls of text and recommend 280 vs 1120 vision tokens.',
      parameters: {
        type: 'object',
        properties: {
          slideIndex: {
            type: 'number',
            description: '1-based slide index (1, 2, or 3)'
          },
          wordCount: {
            type: 'number',
            description: 'Approximate number of words on the slide'
          },
          dataPointCount: {
            type: 'number',
            description: 'Approximate number of numeric metrics or table cells on the slide'
          }
        },
        required: ['slideIndex', 'wordCount', 'dataPointCount']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'flag_buzzword_overload',
      description:
        'Count VC hype buzzwords in the spoken pitch transcript and slide titles and compute buzzwords per minute.',
      parameters: {
        type: 'object',
        properties: {
          spokenTranscript: {
            type: 'string',
            description: 'Spoken pitch transcript text'
          },
          slideHeaders: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of slide titles or headers'
          },
          pitchDurationSeconds: {
            type: 'number',
            description: 'Duration of the spoken pitch in seconds (e.g., 28)'
          }
        },
        required: ['spokenTranscript', 'pitchDurationSeconds']
      }
    }
  }
];

export function executeVcTool(toolName, args = {}) {
  switch (toolName) {
    case 'audit_unit_economics':
      return audit_unit_economics(args);
    case 'verify_tam_math':
      return verify_tam_math(args);
    case 'check_slide_density':
      return check_slide_density(args);
    case 'flag_buzzword_overload':
      return flag_buzzword_overload(args);
    default:
      throw new Error(`Unknown VC verification tool: "${toolName}"`);
  }
}
