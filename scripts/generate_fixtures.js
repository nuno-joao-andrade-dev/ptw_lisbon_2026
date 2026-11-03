import fs from 'node:fs';
import { loadFixturesManifest, getFixtureById } from '../shared/config.js';
import { loadAndNormalizeWavFile } from '../shared/audioUtils.js';
import { prepareSlideForVisionBudget } from '../shared/visionBudget.js';

async function verifyOrGenerateFixtures() {
  const manifest = loadFixturesManifest();
  console.log(`Verifying ${manifest.fixtures.length} Portugal Tech Week pitch fixtures...\n`);

  for (const item of manifest.fixtures) {
    const fixture = getFixtureById(item.id);
    if (!fs.existsSync(fixture.audioFullPath)) {
      throw new Error(`Missing audio fixture: ${fixture.audioFullPath}`);
    }
    const audio = loadAndNormalizeWavFile(fixture.audioFullPath);
    console.log(
      `✓ [${fixture.id}] ${fixture.startupName}: ${audio.durationSec}s WAV (${audio.sampleRate}Hz ${audio.bitsPerSample}-bit Mono, ${audio.byteLength} bytes)`
    );

    for (const s of fixture.slides) {
      if (!fs.existsSync(s.fullPath)) {
        throw new Error(`Missing slide image: ${s.fullPath}`);
      }
      const prepared = await prepareSlideForVisionBudget(s.fullPath, {
        slideIndex: s.slideIndex,
        slideTitle: s.title,
        budget: s.defaultBudget
      });
      console.log(
        `  ↳ Slide #${prepared.slideIndex} "${prepared.slideTitle}": ${prepared.originalDimensions} -> ${prepared.visionTokenBudgetUsed} tokens (${prepared.targetResolution}, density=${prepared.detectedDensityScore})`
      );
    }
    console.log('');
  }

  console.log('All test audio (.wav) and slide deck images (.png) are valid and ready.');
}

verifyOrGenerateFixtures().catch((err) => {
  console.error('Fixture verification failed:', err.message);
  process.exit(1);
});
