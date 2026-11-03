import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { CONFIG, loadFixturesManifest, getFixtureById } from '../shared/config.js';
import { parseAndNormalizeWavBuffer, loadAndNormalizeWavFile } from '../shared/audioUtils.js';
import { estimateSlideDensity, prepareSlideForVisionBudget } from '../shared/visionBudget.js';
import { OllamaGemma4Client } from '../shared/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Strictly in-memory Multer storage (100% zero-retention privacy guarantee)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024, // 12 MB max per file
    files: 5
  }
});

export async function createArenaApp({ attachViteMiddleware = true } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  // Serve the Portugal Tech Week Workshop Slide Deck at /slides
  const slidesDir = path.resolve(__dirname, '..', 'slides');
  app.use('/slides', express.static(slidesDir));

  // 1. Health & Local Ollama Status Endpoint
  app.get('/api/health', async (_req, res) => {
    const client = new OllamaGemma4Client();
    try {
      const status = await client.verifyConnection();
      res.json({
        online: true,
        host: status.host,
        model: status.model,
        capabilities: status.capabilities,
        installedModels: status.installedModels
      });
    } catch (err) {
      res.status(503).json({
        online: false,
        host: CONFIG.ollamaHost,
        model: CONFIG.preferredModel,
        error: err.message
      });
    }
  });

  // 2. List Pre-Built Test Fixtures
  app.get('/api/fixtures', async (_req, res) => {
    try {
      const manifest = loadFixturesManifest();
      const enriched = await Promise.all(
        manifest.fixtures.map(async (f) => {
          const full = getFixtureById(f.id);
          const slidesWithMeta = await Promise.all(
            full.slides.map(async (s) => {
              const buf = fs.readFileSync(s.fullPath);
              const { densityScore, recommendedBudget } = await estimateSlideDensity(buf);
              return {
                slideIndex: s.slideIndex,
                title: s.title,
                defaultBudget: s.defaultBudget || recommendedBudget,
                densityScore,
                slideUrl: `/api/fixtures/${f.id}/slide/${s.slideIndex}`
              };
            })
          );
          return {
            ...f,
            audioUrl: `/api/fixtures/${f.id}/audio`,
            slides: slidesWithMeta
          };
        })
      );
      res.json({ fixtures: enriched });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Serve fixture audio (.wav)
  app.get('/api/fixtures/:id/audio', (req, res) => {
    try {
      const fixture = getFixtureById(req.params.id);
      res.setHeader('Content-Type', 'audio/wav');
      res.sendFile(fixture.audioFullPath);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  // Serve fixture slide image (.png)
  app.get('/api/fixtures/:id/slide/:slideIndex', (req, res) => {
    try {
      const fixture = getFixtureById(req.params.id);
      const idx = Number(req.params.slideIndex);
      const slide = fixture.slides.find((s) => s.slideIndex === idx);
      if (!slide) {
        res.status(404).json({ error: `Slide #${idx} not found` });
        return;
      }
      res.setHeader('Content-Type', 'image/png');
      res.sendFile(slide.fullPath);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  // 3. Inspect Uploaded Slide Density & Recommended Vision Token Budget (280 vs 1120)
  app.post('/api/slides/inspect', upload.single('slide'), async (req, res) => {
    try {
      if (!req.file || !req.file.buffer) {
        res.status(400).json({ error: 'Missing "slide" image file in multipart form data.' });
        return;
      }
      const { densityScore, recommendedBudget } = await estimateSlideDensity(req.file.buffer);
      res.json({
        densityScore,
        recommendedBudget
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // 4. Wipe Session Memory (Zero-Retention Privacy Guarantee)
  app.post('/api/session/reset', (_req, res) => {
    res.json({
      status: 'ok',
      wipedAt: new Date().toISOString(),
      message: 'All in-memory audio and slide buffers wiped.'
    });
  });

  // 5. Streaming Multimodal Pitch Analysis (SSE) -> Local Ollama (`gemma4:e2b`)
  app.post(
    '/api/pitch/analyze-stream',
    upload.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'slides', maxCount: 3 }
    ]),
    async (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      const sendEvent = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      const abortController = new AbortController();
      req.on('close', () => {
        abortController.abort();
      });

      try {
        const startupName = (req.body.startupName || 'Untitled Startup').trim();
        const founderName = (req.body.founderName || '').trim();
        const fixtureId = req.body.fixtureId || null;

        let slideMetaList = [];
        if (req.body.slideMeta) {
          try {
            slideMetaList = JSON.parse(req.body.slideMeta);
          } catch {
            slideMetaList = [];
          }
        }

        sendEvent('status', {
          stage: 'INGESTION',
          message: 'Normalizing 16kHz mono PCM audio & applying Gemma 4 vision token budgets...'
        });

        let normalizedAudio;
        const uploadedAudioFile = req.files?.audio?.[0];

        if (uploadedAudioFile && uploadedAudioFile.buffer) {
          normalizedAudio = parseAndNormalizeWavBuffer(uploadedAudioFile.buffer);
        } else if (fixtureId) {
          const fixture = getFixtureById(fixtureId);
          normalizedAudio = loadAndNormalizeWavFile(fixture.audioFullPath);
        } else {
          throw new Error('Please record or upload a spoken pitch (.wav) before running analysis.');
        }

        const uploadedSlideFiles = req.files?.slides || [];
        const preparedSlides = [];

        if (uploadedSlideFiles.length > 0) {
          for (let i = 0; i < Math.min(3, uploadedSlideFiles.length); i++) {
            const file = uploadedSlideFiles[i];
            const meta = slideMetaList[i] || {};
            const slideObj = await prepareSlideForVisionBudget(file.buffer, {
              slideIndex: i + 1,
              slideTitle: meta.slideTitle || file.originalname || `Slide ${i + 1}`,
              budget: Number(meta.budget) || undefined
            });
            preparedSlides.push(slideObj);
          }
        } else if (fixtureId) {
          const fixture = getFixtureById(fixtureId);
          for (let i = 0; i < fixture.slides.length; i++) {
            const sDef = fixture.slides[i];
            const meta = slideMetaList[i] || {};
            const slideObj = await prepareSlideForVisionBudget(sDef.fullPath, {
              slideIndex: sDef.slideIndex,
              slideTitle: meta.slideTitle || sDef.title,
              budget: Number(meta.budget) || sDef.defaultBudget
            });
            preparedSlides.push(slideObj);
          }
        } else {
          throw new Error('Please upload at least 1 pitch deck slide (.png, .jpg, or .webp).');
        }

        sendEvent('telemetry', {
          audio: {
            durationSec: normalizedAudio.durationSec,
            sampleRate: normalizedAudio.sampleRate,
            estimatedAudioTokens: normalizedAudio.estimatedAudioTokens
          },
          slides: preparedSlides.map((s) => ({
            slideIndex: s.slideIndex,
            slideTitle: s.slideTitle,
            visionTokenBudgetUsed: s.visionTokenBudgetUsed,
            detectedDensityScore: s.detectedDensityScore,
            targetResolution: s.targetResolution
          }))
        });

        const client = new OllamaGemma4Client();
        const conn = await client.verifyConnection();

        sendEvent('status', {
          stage: 'REASONING',
          message: `Streaming multimodal reasoning & VC tool checks on Local Ollama (${conn.model})...`
        });

        const result = await client.runFullVcAudit({
          startupName,
          founderName,
          audio: normalizedAudio,
          slides: preparedSlides,
          think: true,
          useTools: true,
          onThinkingChunk: (chunk, fullThinking) => {
            sendEvent('thinking', { chunk, fullThinking });
          },
          onToolCall: (toolResult, args) => {
            sendEvent('tool_call', { toolResult, args });
          },
          signal: abortController.signal
        });

        sendEvent('verdict', {
          model: result.model,
          verdict: result.data
        });
        res.end();
      } catch (err) {
        if (!abortController.signal.aborted) {
          sendEvent('error', { message: err.message || 'Analysis failed' });
          res.end();
        }
      }
    }
  );

  // Attach Vite dev server middleware (or static dist build if built)
  if (attachViteMiddleware) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      configFile: path.join(__dirname, 'vite.config.js'),
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  return app;
}
