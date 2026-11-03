import { getFixtureById } from '../shared/config.js';
import { loadAndNormalizeWavFile } from '../shared/audioUtils.js';
import { prepareSlideForVisionBudget } from '../shared/visionBudget.js';
import { OllamaGemma4Client } from '../shared/client.js';
import {
  ANSI,
  printPtwBanner,
  printSectionHeader,
  printContradictionsReport,
  formatScoreBar
} from '../shared/terminalUi.js';

// ============================================================================
// WORKSHOP TWEAK ZONE (Step 03 — 35-55m: Multimodal Contradiction Detection)
// ============================================================================
const FIXTURE_ID = 'fixture_02_sprint'; // Try: 'fixture_02_sprint' | 'fixture_03_clean'
const SLIDE_1_VISION_BUDGET = 280;      // Layout slide -> 280 tokens (448x448)
const SLIDE_2_VISION_BUDGET = 1120;     // Try changing 1120 -> 280 to see what happens to the 8pt footnote!
const SLIDE_3_VISION_BUDGET = 1120;     // Dense architecture slide -> 1120 tokens
// ============================================================================

async function main() {
  printPtwBanner(
    '03 (35-55m)',
    'SPRINT 2 — MULTIMODAL CONTRADICTION DETECTION',
    'Cross-Checking 30s Spoken Pitch Audio Against 3 Slide Images (280 vs 1120 Vision Token Budgets)'
  );

  const client = new OllamaGemma4Client();
  const status = await client.verifyConnection();
  const fixture = getFixtureById(FIXTURE_ID);
  const audio = loadAndNormalizeWavFile(fixture.audioFullPath);

  const budgets = [SLIDE_1_VISION_BUDGET, SLIDE_2_VISION_BUDGET, SLIDE_3_VISION_BUDGET];
  const slides = [];

  for (let i = 0; i < fixture.slides.length; i++) {
    const slideDef = fixture.slides[i];
    const prepared = await prepareSlideForVisionBudget(slideDef.fullPath, {
      slideIndex: slideDef.slideIndex,
      slideTitle: slideDef.title,
      budget: budgets[i] || slideDef.defaultBudget
    });
    slides.push(prepared);
  }

  printSectionHeader('1. Multimodal Input & Vision Token Budget Allocation');
  console.log(`  • Local Ollama Server : ${ANSI.cyan}${status.host}${ANSI.reset} (${status.model})`);
  console.log(`  • Spoken Audio        : ${audio.durationSec}s (${audio.sampleRate}Hz Mono PCM)`);
  for (const s of slides) {
    console.log(
      `  • Slide #${s.slideIndex} (${s.slideTitle.padEnd(32)}): ${ANSI.yellow}${ANSI.bold}${s.visionTokenBudgetUsed} tokens${ANSI.reset} (${s.targetResolution}, density=${s.detectedDensityScore})`
    );
  }

  printSectionHeader('2. Streaming Cross-Modal Reasoning (<think>)');
  let startedThinking = false;
  const t0 = Date.now();

  const result = await client.analyzeContradictions({
    startupName: fixture.startupName,
    audio,
    slides,
    think: true,
    onThinkingChunk: (chunk) => {
      if (!startedThinking) {
        process.stdout.write(`  ${ANSI.dim}[<think>] `);
        startedThinking = true;
      }
      process.stdout.write(chunk.replace(/\n/g, ' '));
    }
  });

  if (startedThinking) {
    process.stdout.write(`${ANSI.reset}\n`);
  }

  const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(
    `\n  ${ANSI.green}✓ Cross-Modal Audit Complete in ${elapsedSec}s${ANSI.reset}`
  );
  console.log(
    `  • Cross-Modal Alignment Score: ${formatScoreBar(result.data.crossModalAlignmentScore, 100, 15)}`
  );

  printContradictionsReport(result.data.slideAudits, result.data.contradictions);
}

main().catch((err) => {
  console.error(`\n${ANSI.red}${ANSI.bold}✖ Step 03 Error:${ANSI.reset} ${err.message}`);
  process.exit(1);
});
