import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '..');
export const FIXTURES_DIR = path.join(ROOT_DIR, 'fixtures');

// Load .env from root if it exists
const envPath = path.join(ROOT_DIR, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}

export const CONFIG = {
  ollamaHost: (process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/+$/, ''),
  preferredModel: process.env.OLLAMA_MODEL || 'gemma4:e2b',
  fallbackModels: ['gemma4:e2b', 'gemma4:e4b', 'gemma4:latest', 'gemma4'],
  serverPort: Number(process.env.PORT || 4000),
  audioSampleRate: 16000,
  maxAudioDurationSec: 35.0,
  maxSlides: 3,
  visionBudgets: {
    LAYOUT_280: 280,
    DENSE_1120: 1120
  }
};

export function loadFixturesManifest() {
  const manifestPath = path.join(FIXTURES_DIR, 'manifest.json');
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const rawList = Array.isArray(raw.fixtures) ? raw.fixtures : Object.values(raw);

  const fixtures = rawList.map((f) => ({
    ...f,
    audioPath: f.audioPath || f.audioFile,
    slides: (f.slides || []).map((s, idx) => ({
      ...s,
      slideIndex: s.slideIndex || idx + 1,
      path: s.path || s.file
    }))
  }));

  return { fixtures };
}

export function getFixtureById(fixtureId) {
  const manifest = loadFixturesManifest();
  const found = manifest.fixtures.find((f) => f.id === fixtureId);
  if (!found) {
    throw new Error(`Fixture "${fixtureId}" not found in fixtures/manifest.json`);
  }
  return {
    ...found,
    audioFullPath: path.join(ROOT_DIR, found.audioPath),
    slides: found.slides.map((s) => ({
      ...s,
      fullPath: path.join(ROOT_DIR, s.path)
    }))
  };
}
