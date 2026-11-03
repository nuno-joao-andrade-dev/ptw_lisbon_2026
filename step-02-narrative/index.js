import { getFixtureById } from '../shared/config.js';
import { loadAndNormalizeWavFile } from '../shared/audioUtils.js';
import { OllamaGemma4Client } from '../shared/client.js';
import {
  ANSI,
  printPtwBanner,
  printSectionHeader,
  printNarrativeReport
} from '../shared/terminalUi.js';

// ============================================================================
// WORKSHOP TWEAK ZONE (Step 02 — 15-35m: Narrative Structure Analyzer)
// ============================================================================
const FIXTURE_ID = 'fixture_02_sprint'; // Try: 'fixture_02_sprint' | 'fixture_01_roast' | 'fixture_03_clean'
const ENABLE_THINKING = true;           // Toggle Gemma 4 Configurable Thinking Mode (`think: true`)
// ============================================================================

async function main() {
  printPtwBanner(
    '02 (15-35m)',
    'SPRINT 1 — NARRATIVE STRUCTURE ANALYZER',
    '30s Spoken Pitch Audio + Gemma 4 Thinking Mode (think: true) + Strict Zod JSON Schema (format)'
  );

  const client = new OllamaGemma4Client();
  const status = await client.verifyConnection();
  const fixture = getFixtureById(FIXTURE_ID);
  const audio = loadAndNormalizeWavFile(fixture.audioFullPath);

  printSectionHeader('1. Audio Ingestion & Local Ollama Configuration');
  console.log(`  • Local Ollama Server : ${ANSI.cyan}${status.host}${ANSI.reset} (${status.model})`);
  console.log(`  • Startup Pitch       : ${ANSI.yellow}${ANSI.bold}${fixture.startupName}${ANSI.reset} (${fixture.founderName})`);
  console.log(
    `  • Normalized Audio    : ${audio.durationSec}s • ${audio.sampleRate}Hz ${audio.bitsPerSample}-bit Mono PCM (~${audio.estimatedAudioTokens} audio tokens)`
  );
  console.log(
    `  • Thinking Mode       : ${ENABLE_THINKING ? `${ANSI.green}ENABLED (think: true)${ANSI.reset}` : `${ANSI.orange}DISABLED (think: false)${ANSI.reset}`}`
  );

  printSectionHeader('2. Streaming Gemma 4 <think> Reasoning Trace');
  let startedThinking = false;
  const t0 = Date.now();

  const result = await client.analyzeNarrative({
    startupName: fixture.startupName,
    audio,
    think: ENABLE_THINKING,
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
    `\n  ${ANSI.green}✓ Zod Schema Validated (NarrativeStructureSchema) in ${elapsedSec}s${ANSI.reset}`
  );

  printNarrativeReport(result.data);
}

main().catch((err) => {
  console.error(`\n${ANSI.red}${ANSI.bold}✖ Step 02 Error:${ANSI.reset} ${err.message}`);
  process.exit(1);
});
