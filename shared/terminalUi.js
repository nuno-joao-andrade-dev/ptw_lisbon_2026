/**
 * ANSI Terminal UI Formatter styled with Portugal Tech Week colors
 * Used across step-01-setup, step-02-narrative, step-03-contradictions, and step-04-tools.
 */

export const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  yellow: '\x1b[38;2;255;192;23m',  // PTW Solar Gold (#FFC017)
  blue: '\x1b[38;2;40;60;200m',     // PTW Royal Blue (#283CC8)
  cyan: '\x1b[38;2;78;157;224m',    // PTW Tech Cyan (#4E9DE0)
  green: '\x1b[38;2;97;206;112m',   // PTW Green (#61CE70)
  red: '\x1b[38;2;255;59;92m',      // PTW Red (#FF3B5C)
  orange: '\x1b[38;2;255;116;0m',   // PTW Orange (#FF7400)
  white: '\x1b[38;2;255;255;255m',
  muted: '\x1b[38;2;172;172;172m'
};

export function printPtwBanner(stepNumber, stepTitle, subtitle) {
  const line = `${ANSI.blue}${'━'.repeat(78)}${ANSI.reset}`;
  console.log('\n' + line);
  console.log(
    `${ANSI.yellow}${ANSI.bold} 🇵🇹 PORTUGAL TECH WEEK 2026 ${ANSI.reset}${ANSI.muted}•${ANSI.reset} ${ANSI.cyan}${ANSI.bold}GEMMA 4 + LOCAL OLLAMA PITCH CRITIC${ANSI.reset}`
  );
  console.log(
    `${ANSI.white}${ANSI.bold} STEP ${stepNumber}: ${stepTitle}${ANSI.reset}`
  );
  if (subtitle) {
    console.log(`${ANSI.muted} ${subtitle}${ANSI.reset}`);
  }
  console.log(line + '\n');
}

export function printSectionHeader(title) {
  console.log(`\n${ANSI.yellow}${ANSI.bold}▸ ${title.toUpperCase()}${ANSI.reset}`);
  console.log(`${ANSI.blue}${'─'.repeat(78)}${ANSI.reset}`);
}

export function formatScoreBar(score, max = 10, width = 10) {
  const clamped = Math.max(0, Math.min(max, Number(score) || 0));
  const filled = Math.round((clamped / max) * width);
  const empty = Math.max(0, width - filled);
  const color =
    clamped / max >= 0.7 ? ANSI.green : clamped / max >= 0.45 ? ANSI.yellow : ANSI.red;
  return `${color}${'█'.repeat(filled)}${ANSI.dim}${'░'.repeat(empty)}${ANSI.reset} ${color}${ANSI.bold}${clamped}/${max}${ANSI.reset}`;
}

export function printNarrativeReport(narrative) {
  printSectionHeader('Spoken Elevator Pitch Transcript Summary');
  console.log(`  ${ANSI.white}"${narrative.transcriptSummary}"${ANSI.reset}`);

  printSectionHeader('5 Narrative Beat Scores (0-10)');
  const beats = [
    ['1. HOOK    ', narrative.hook],
    ['2. PROBLEM ', narrative.problem],
    ['3. SOLUTION', narrative.solution],
    ['4. TRACTION', narrative.traction],
    ['5. THE ASK ', narrative.ask]
  ];

  for (const [label, beat] of beats) {
    if (!beat) continue;
    console.log(
      `  ${ANSI.cyan}${ANSI.bold}${label}${ANSI.reset}  ${formatScoreBar(beat.score, 10, 10)}  ${ANSI.muted}[${beat.timestampRange}]${ANSI.reset}`
    );
    console.log(`              ${ANSI.dim}Quote:${ANSI.reset} "${beat.spokenQuote}"`);
    console.log(`              ${ANSI.yellow}VC Note:${ANSI.reset} ${beat.critique}`);
  }

  if (narrative.storyArc) {
    printSectionHeader('Story Arc & Pacing Diagnosis');
    console.log(
      `  • Overall Arc Score : ${formatScoreBar(narrative.storyArc.overallArcScore, 100, 15)}`
    );
    console.log(
      `  • Sequence Coherent : ${
        narrative.storyArc.sequenceCoherent
          ? `${ANSI.green}${ANSI.bold}YES${ANSI.reset}`
          : `${ANSI.red}${ANSI.bold}NO${ANSI.reset}`
      }`
    );
    console.log(
      `  • Missing/Weak Beats: ${
        narrative.storyArc.missingBeats?.length
          ? `${ANSI.orange}${narrative.storyArc.missingBeats.join(', ')}${ANSI.reset}`
          : `${ANSI.green}None${ANSI.reset}`
      }`
    );
    console.log(`  • Pacing Diagnosis  : ${narrative.storyArc.pacingDiagnosis}`);
  }
}

export function printContradictionsReport(slideAudits = [], contradictions = []) {
  if (slideAudits.length > 0) {
    printSectionHeader('Slide Deck Vision Token Budget Audit');
    for (const s of slideAudits) {
      const budgetBadge =
        s.visionTokenBudgetUsed >= 1120
          ? `${ANSI.cyan}${ANSI.bold}[1120 Tokens • Dense High-Res]${ANSI.reset}`
          : `${ANSI.yellow}${ANSI.bold}[280 Tokens • Layout Fast]${ANSI.reset}`;
      console.log(
        `  📊 ${ANSI.white}${ANSI.bold}Slide #${s.slideIndex}: ${s.slideTitle}${ANSI.reset} ${budgetBadge} ${ANSI.muted}(Density: ${s.detectedDensityScore})${ANSI.reset}`
      );
      if (s.keyVisualMetrics?.length) {
        console.log(`     Metrics : ${s.keyVisualMetrics.join(' | ')}`);
      }
      if (s.finePrintDetected) {
        console.log(`     ${ANSI.orange}Footnote: ${s.finePrintDetected}${ANSI.reset}`);
      } else {
        console.log(`     ${ANSI.muted}Footnote: (None detected at this token budget)${ANSI.reset}`);
      }
    }
  }

  printSectionHeader(`Cross-Modal Contradictions Detected (${contradictions.length})`);
  if (contradictions.length === 0) {
    console.log(
      `  ${ANSI.green}${ANSI.bold}✓ ZERO CONTRADICTIONS: Spoken claims align with slide visuals.${ANSI.reset}`
    );
    return;
  }

  for (const c of contradictions) {
    const sevColor =
      c.severity === 'FATAL_BS' ? ANSI.red : c.severity === 'MAJOR' ? ANSI.orange : ANSI.yellow;
    console.log(
      `  ⚡ ${sevColor}${ANSI.bold}[${c.severity}] ${c.category}${ANSI.reset} ${ANSI.muted}(Slide #${c.slideIndex} @ ${c.spokenTimestamp})${ANSI.reset}`
    );
    console.log(`     🎙️  ${ANSI.white}Spoken Claim  :${ANSI.reset} "${c.spokenClaim}"`);
    console.log(`     📊 ${ANSI.white}Slide Evidence:${ANSI.reset} "${c.slideEvidence}"`);
    console.log(`     🔥 ${ANSI.yellow}VC Call-Out   :${ANSI.reset} ${c.vcCallOut}\n`);
  }
}

export function printToolAuditsReport(toolAudits = []) {
  printSectionHeader('Deterministic VC Tool Verification ("Bullshit Detector")');
  for (const t of toolAudits) {
    const badge =
      t.status === 'PASS'
        ? `${ANSI.green}${ANSI.bold}[✓ PASS]${ANSI.reset}`
        : t.status === 'WARNING'
        ? `${ANSI.yellow}${ANSI.bold}[! WARN]${ANSI.reset}`
        : `${ANSI.red}${ANSI.bold}[✗ FAIL]${ANSI.reset}`;
    console.log(`  ${badge} ${ANSI.cyan}${ANSI.bold}${t.toolName}${ANSI.reset}`);
    console.log(`         ${t.explanation}`);
  }
}

export function printFinalVerdictCard(verdictObj) {
  const vColor =
    verdictObj.verdict === 'INVEST'
      ? ANSI.green
      : verdictObj.verdict === 'DIG_DEEPER'
      ? ANSI.yellow
      : ANSI.red;

  const line = `${vColor}${'═'.repeat(78)}${ANSI.reset}`;
  console.log('\n' + line);
  console.log(
    `  ${vColor}${ANSI.bold}VERDICT: ${verdictObj.verdict}${ANSI.reset}   |   ${ANSI.white}${ANSI.bold}IC SCORE: ${verdictObj.overallIcScore}/100${ANSI.reset}   |   ${ANSI.cyan}${ANSI.bold}${verdictObj.startupName}${ANSI.reset}`
  );
  console.log(line);
  console.log(`\n  ${ANSI.yellow}${ANSI.bold}🎤 LIVE VC ROAST:${ANSI.reset}`);
  console.log(`  ${ANSI.white}${ANSI.bold}"${verdictObj.liveRoast}"${ANSI.reset}\n`);
  console.log(`  ${ANSI.cyan}${ANSI.bold}🛠️  TOP FIX RECOMMENDATION:${ANSI.reset}`);
  console.log(`  ${verdictObj.topFixRecommendation}`);
  console.log(line + '\n');
}
