import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadFixturesManifest, getFixtureById } from '../shared/config.js';
import { loadAndNormalizeWavFile } from '../shared/audioUtils.js';
import { prepareSlideForVisionBudget } from '../shared/visionBudget.js';
import { OllamaGemma4Client } from '../shared/client.js';
import { createArenaApp } from '../step-05-arena/server.js';

test('All 3 pitch fixtures load and normalize 16kHz mono PCM audio and 280/1120 slide images', async () => {
  const manifest = loadFixturesManifest();
  assert.equal(manifest.fixtures.length, 3);

  for (const item of manifest.fixtures) {
    const fixture = getFixtureById(item.id);
    const audio = loadAndNormalizeWavFile(fixture.audioFullPath);
    assert.equal(audio.sampleRate, 16000);
    assert.equal(audio.channels, 1);
    assert.equal(audio.bitsPerSample, 16);
    assert.ok(audio.durationSec >= 15 && audio.durationSec <= 35);
    assert.ok(audio.base64Wav.length > 1000);

    for (const s of fixture.slides) {
      const prepared280 = await prepareSlideForVisionBudget(s.fullPath, {
        slideIndex: s.slideIndex,
        slideTitle: s.title,
        budget: 280
      });
      assert.equal(prepared280.visionTokenBudgetUsed, 280);

      const prepared1120 = await prepareSlideForVisionBudget(s.fullPath, {
        slideIndex: s.slideIndex,
        slideTitle: s.title,
        budget: 1120
      });
      assert.equal(prepared1120.visionTokenBudgetUsed, 1120);
      assert.ok(prepared1120.byteLength > prepared280.byteLength);
    }
  }
});

test('Local Ollama server connection resolves gemma4:e2b and reports multimodal capabilities', async () => {
  const client = new OllamaGemma4Client();
  const status = await client.verifyConnection();
  assert.ok(status.model.startsWith('gemma4'));
  assert.ok(status.capabilities.includes('vision'));
  assert.ok(status.capabilities.includes('audio'));
  assert.ok(status.capabilities.includes('tools'));
  assert.ok(status.capabilities.includes('thinking'));
});

test('Step 05 Arena Express API endpoints respond properly', async () => {
  const app = await createArenaApp({ attachViteMiddleware: false });
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.equal(healthData.online, true);

    // 2. Fixtures list
    const fixRes = await fetch(`${baseUrl}/api/fixtures`);
    assert.equal(fixRes.status, 200);
    const fixData = await fixRes.json();
    assert.equal(fixData.fixtures.length, 3);

    // 3. Slide density inspection
    const slidePath = getFixtureById('fixture_02_sprint').slides[1].fullPath;
    const slideBuf = fs.readFileSync(slidePath);
    const fd = new FormData();
    fd.append('slide', new Blob([slideBuf], { type: 'image/png' }), 'slide_2.png');
    const inspectRes = await fetch(`${baseUrl}/api/slides/inspect`, {
      method: 'POST',
      body: fd
    });
    assert.equal(inspectRes.status, 200);
    const inspectData = await inspectRes.json();
    assert.ok(inspectData.densityScore > 0);

    // 4. Session reset
    const resetRes = await fetch(`${baseUrl}/api/session/reset`, { method: 'POST' });
    assert.equal(resetRes.status, 200);
    const resetData = await resetRes.json();
    assert.equal(resetData.status, 'ok');
  } finally {
    server.close();
  }
});
