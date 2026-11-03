import { getFixtureById } from '../shared/config.js';
import { loadAndNormalizeWavFile } from '../shared/audioUtils.js';
import { prepareSlideForVisionBudget } from '../shared/visionBudget.js';
import { OllamaGemma4Client } from '../shared/client.js';
import {
  ANSI,
  printPtwBanner,
  printSectionHeader,
  printContradictionsReport,
  printToolAuditsReport,
  printFinalVerdictCard
} from '../shared/terminalUi.js';

// ============================================================================
// WORKSHOP TWEAK ZONE (Step 01 — 00-15m: Live Roast & Architecture Setup)
// ============================================================================
const FIXTURE_ID = 'fixture_01_roast'; // Try: 'fixture_01_roast' | 'fixture_02_sprint' | 'fixture_03_clean'
const VISION_BUDGET = 1120;            // Try: 280 (Layout Fast) vs 1120 (Dense High-Res)
const ENABLE_THINKING = true;          // Stream Gemma 4's <think> trace from Local Ollama
// ============================================================================

async function main() {
  printPtwBanner(
    '01 (00-15m)',
    'LIVE ROAST & LOCAL OLLAMA ARCHITECTURE SETUP',
    'Verifying Local Ollama (http://127.0.0.1:11434) + gemma4:e2b Multimodal Audio/Vision Pipeline'
  );

  // 1. Verify Local Ollama Server & Gemma 4 Capabilities
  printSectionHeader('1. Local Ollama Server & Model Capability Check');
  const client = new OllamaGemma4Client();
  const status = await client.verifyConnection();

  console.log(`  ${ANSI.green}${ANSI.bold}✓ Connected to Local Ollama:${ANSI.reset} ${status.host}`);
  console.log(`  ${ANSI.cyan}${ANSI.bold}✓ Active Model Resolved    :${ANSI.reset} ${status.model}`);
  console.log(
    `  ${ANSI.yellow}${ANSI.bold}✓ Native Capabilities      :${ANSI.reset} [${status.capabilities.join(', ')}]`
  );

  // 2. Load & Normalize 20s Spoken Pitch (.wav) and Slide Deck (.png)
  printSectionHeader('2. Multimodal Payload Preparation (Audio + Vision Budget)');
  const fixture = getFixtureById(FIXTURE_ID);
  const audio = loadAndNormalizeWavFile(fixture.audioFullPath);
  const slide1 = await prepareSlideForVisionBudget(fixture.slides[0].fullPath, {
    slideIndex: 1,
    slideTitle: fixture.slides[0].title,
    budget: VISION_BUDGET
  });

  console.log(
    `  🎙️  ${ANSI.white}${ANSI.bold}Spoken Audio :${ANSI.reset} ${fixture.Startup || fixture.startupName} (${audio.durationSec}s • ${audio.sampleRate}Hz ${audio.bitsPerSample}-bit Mono PCM • ~${audio.estimatedAudioTokens} audio tokens)`
  );
  console.log(
    `  📊 ${ANSI.white}${ANSI.bold}Slide #1     :${ANSI.reset} "${slide1.slideTitle}" (${slide1.targetResolution} • ${slide1.visionTokenBudgetUsed} vision tokens • density=${slide1.detectedDensityScore})`
  );

  // 3. Execute Live 20s Roast on Local Ollama
  printSectionHeader('3. Streaming Gemma 4 <think> Trace & VC Roast');
  let startedThinking = false;
  const t0 = Date.now();

  const result = await client.runFullVcAudit({
    startupName: fixture.startupName,
    founderName: fixture.founderName,
    audio,
    slides: [slide1],
    think: ENABLE_THINKING,
    useTools: false,
    onThinkingChunk: (chunk) => {
      if (!startedThinking) {
        process.stdout.write(`  ${ANSI.dim}[Gemma 4 Thinking] `);
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
    `\n  ${ANSI.green}✓ Completed local multimodal inference in ${elapsedSec}s on ${result.model}${ANSI.reset}`
  );

  printContradictionsReport(result.data.slideAudits, result.data.contradictions);
  printToolAuditsReport(result.data.toolAudits);
  printFinalVerdictCard(result.data);
}

main().catch((err) => {
  console.error(`\n${ANSI.red}${ANSI.bold}✖ Step 01 Error:${ANSI.reset} ${err.message}`);
  process.exit(1);
});
