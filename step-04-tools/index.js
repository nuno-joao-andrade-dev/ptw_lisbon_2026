import { getFixtureById } from '../shared/config.js';
import { loadAndNormalizeWavFile } from '../shared/audioUtils.js';
import { prepareSlideForVisionBudget } from '../shared/visionBudget.js';
import { OllamaGemma4Client } from '../shared/client.js';
import {
  ANSI,
  printPtwBanner,
  printSectionHeader,
  printNarrativeReport,
  printContradictionsReport,
  printToolAuditsReport,
  printFinalVerdictCard
} from '../shared/terminalUi.js';

// ============================================================================
// WORKSHOP TWEAK ZONE (Step 04 — 55-75m: Deterministic VC Tool Calls)
// ============================================================================
const FIXTURE_ID = 'fixture_02_sprint'; // Try: 'fixture_02_sprint' (HARD_PASS) | 'fixture_03_clean' (INVEST)
// ============================================================================

async function main() {
  printPtwBanner(
    '04 (55-75m)',
    'SPRINT 3 — DETERMINISTIC VC TOOL CALLS ("BULLSHIT DETECTOR")',
    'Local Ollama Native Tool Calling Loop + Ground-Truth Unit Economics & TAM Math'
  );

  const client = new OllamaGemma4Client();
  const status = await client.verifyConnection();
  const fixture = getFixtureById(FIXTURE_ID);
  const audio = loadAndNormalizeWavFile(fixture.audioFullPath);

  const slides = [];
  for (const slideDef of fixture.slides) {
    const prepared = await prepareSlideForVisionBudget(slideDef.fullPath, {
      slideIndex: slideDef.slideIndex,
      slideTitle: slideDef.title,
      budget: slideDef.defaultBudget
    });
    slides.push(prepared);
  }

  printSectionHeader('1. Registered Deterministic VC Tools');
  console.log(`  • Local Ollama Server : ${ANSI.cyan}${status.host}${ANSI.reset} (${status.model})`);
  console.log(`  • Startup Audited     : ${ANSI.yellow}${ANSI.bold}${fixture.startupName}${ANSI.reset}`);
  console.log(
    `  • Active Tools (4)    : ${ANSI.cyan}audit_unit_economics, verify_tam_math, check_slide_density, flag_buzzword_overload${ANSI.reset}`
  );

  printSectionHeader('2. Executing 2-Turn Tool Calling & Verdict Synthesis');
  let startedThinking = false;
  const t0 = Date.now();

  const result = await client.runFullVcAudit({
    startupName: fixture.startupName,
    founderName: fixture.founderName,
    audio,
    slides,
    think: true,
    useTools: true,
    onThinkingChunk: (chunk) => {
      if (!startedThinking) {
        process.stdout.write(`  ${ANSI.dim}[<think>] `);
        startedThinking = true;
      }
      process.stdout.write(chunk.replace(/\n/g, ' '));
    },
    onToolCall: (toolResult, args) => {
      if (startedThinking) {
        process.stdout.write(`${ANSI.reset}\n`);
        startedThinking = false;
      }
      console.log(
        `\n  🔧 ${ANSI.yellow}${ANSI.bold}[Tool Executed] ${toolResult.toolName}${ANSI.reset} ${ANSI.muted}${JSON.stringify(args)}${ANSI.reset}`
      );
      console.log(`     ↳ Status: ${toolResult.status} — ${toolResult.explanation}`);
    }
  });

  if (startedThinking) {
    process.stdout.write(`${ANSI.reset}\n`);
  }

  const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(
    `\n  ${ANSI.green}✓ Completed 2-Turn VC Tool Audit & Final Synthesis in ${elapsedSec}s${ANSI.reset}`
  );

  printToolAuditsReport(result.data.toolAudits);
  printContradictionsReport(result.data.slideAudits, result.data.contradictions);
  printNarrativeReport(result.data.narrative);
  printFinalVerdictCard(result.data);
}

main().catch((err) => {
  console.error(`\n${ANSI.red}${ANSI.bold}✖ Step 04 Error:${ANSI.reset} ${err.message}`);
  process.exit(1);
});
