/**
 * System & User Prompt Builders for Gemma 4 (`gemma4:e2b` / `gemma4:e4b`) on Local Ollama
 */

export const VC_PERSONA_SYSTEM_PROMPT = `You are the "Portugal Tech Week AI Investment Committee" — a razor-sharp, numerically rigorous Venture Capital Partner auditing startup elevator pitches and slide decks.

CRITICAL OPERATING RULES:
1. LISTEN carefully to the spoken elevator pitch audio and READ every slide image (especially financial tables, unit economics rows, and small fine-print footnotes at the bottom of slides).
2. NEVER take a founder's spoken claims at face value if a slide image contradicts them.
3. Call out exact numbers: quote what the founder SAID in the audio versus what is WRITTEN on the slide.
4. Keep critiques concise, specific, and grounded in venture math (Burn Multiple = Annual Net Burn / Net New ARR; Bottom-Up TAM = Customers * Annual Price; LTV:CAC >= 3.0x).
5. Always return valid JSON matching the requested schema.`;

export function buildStep1RoastPrompt({ startupName, audioDurationSec }) {
  return `Audit this ${audioDurationSec}-second spoken elevator pitch and slide deck for "${startupName}".
1. Transcribe/summarize what the founder claimed in the spoken audio.
2. Inspect Slide #1 carefully and list all financial numbers, churn rates, pilot counts, and footnotes shown on the slide.
3. Identify every contradiction between the spoken audio and Slide #1.
4. Deliver a brutal but constructive 2-3 sentence VC "liveRoast" quoting the exact spoken vs slide numbers, and return the complete JSON verdict.`;
}

export function buildStep2NarrativePrompt({ startupName, audioDurationSec }) {
  return `Analyze the ${audioDurationSec}-second spoken elevator pitch audio for "${startupName}".
Evaluate the 5 core narrative beats:
1. Hook (0-10): Does it immediately grab attention in the first 5 seconds?
2. Problem (0-10): Is the customer pain point specific and urgent?
3. Solution (0-10): Is the product/value proposition clear without empty jargon?
4. Traction (0-10): Are concrete revenue, growth, and unit economics metrics stated?
5. Ask (0-10): Is the fundraising amount and milestone target explicit?
Also evaluate the overall storyArc (overallArcScore 0-100, sequenceCoherent, missingBeats, pacingDiagnosis) and return the strict JSON object.`;
}

export function buildStep3ContradictionPrompt({ startupName, audioDurationSec, slidesMeta }) {
  const slideDescriptions = slidesMeta
    .map(
      (s) =>
        `- Slide #${s.slideIndex} ("${s.slideTitle}"): processed at ${s.visionTokenBudgetUsed} vision tokens (${s.targetResolution}, density=${s.detectedDensityScore})`
    )
    .join('\n');

  return `Perform a Cross-Modal Contradiction Audit for "${startupName}" across the ${audioDurationSec}s spoken pitch audio and ${slidesMeta.length} slide images:
${slideDescriptions}

INSTRUCTIONS:
1. Extract the 5 narrative beats from the spoken audio.
2. For each slide image, extract all keyVisualMetrics and any finePrintDetected (check the bottom of financial slides for small footnotes!).
3. Compare every spoken metric (Burn Multiple, Monthly Burn, ARR, LTV:CAC, Churn, TAM) against the slide tables and footnotes.
4. Populate the "contradictions" array with every discrepancy found, marking severe numeric lies as "FATAL_BS".`;
}

export function buildStep4ToolCallingPrompt({ startupName, audioDurationSec, slidesMeta }) {
  const slideSummary = slidesMeta
    .map((s) => `Slide #${s.slideIndex} ("${s.slideTitle}", ${s.visionTokenBudgetUsed} vision tokens)`)
    .join(', ');

  return `You are auditing "${startupName}" (${audioDurationSec}s spoken audio + ${slideSummary}).
First, call the deterministic VC verification tools to check the numbers extracted from the spoken pitch and slide images:
- Call "audit_unit_economics" with the monthlyNetBurnUsd, netNewArrUsd, cacUsd, ltvUsd from the financial slide, and the claimedBurnMultiple / claimedLtvCacRatio from the spoken audio.
- Call "verify_tam_math" with the claimedTamUsd from the spoken audio and targetCustomerCount & annualPricePerCustomerUsd from the financial slide.
- Call "check_slide_density" for the densest slide.
- Call "flag_buzzword_overload" with the spoken transcript and pitch duration (${Math.round(audioDurationSec)}s).`;
}

export function buildFinalVerdictSynthesisPrompt({
  startupName,
  founderName,
  audioDurationSec,
  slidesMeta,
  toolResults
}) {
  return `Synthesize the final Investment Committee Verdict JSON for "${startupName}"${founderName ? ` (pitched by ${founderName})` : ''}.

DETERMINISTIC VC TOOL AUDIT RESULTS (GROUND TRUTH MATH):
${JSON.stringify(toolResults, null, 2)}

SLIDE BUDGET TELEMETRY:
${JSON.stringify(
  slidesMeta.map((s) => ({
    slideIndex: s.slideIndex,
    slideTitle: s.slideTitle,
    visionTokenBudgetUsed: s.visionTokenBudgetUsed,
    detectedDensityScore: s.detectedDensityScore
  })),
  null,
  2
)}

Using the spoken pitch audio, the slide images, and the deterministic tool results above:
1. Score the 5 narrative beats (hook, problem, solution, traction, ask) and storyArc.
2. Audit each slide (slideAudits) including finePrintDetected.
3. List all cross-modal contradictions between the spoken pitch and the slides.
4. Include the deterministic toolAudits results.
5. Set verdict to "HARD_PASS" if any tool status is "FAIL" or any "FATAL_BS" contradiction exists; "INVEST" if numbers are clean and aligned; otherwise "DIG_DEEPER".
6. Write a sharp, memorable 2-3 sentence "liveRoast" and a concrete "topFixRecommendation".`;
}
