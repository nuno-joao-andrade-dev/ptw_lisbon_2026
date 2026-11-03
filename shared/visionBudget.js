import fs from 'node:fs';
import sharp from 'sharp';
import { CONFIG } from './config.js';

/**
 * Computes a visual information density score (0.0 to 1.0) from a slide buffer
 * by analyzing high-frequency edge transitions (text/tables/diagrams vs blank space)
 * on a 200x200 grayscale grid.
 */
export async function estimateSlideDensity(imageBuffer) {
  const { data, info } = await sharp(imageBuffer)
    .resize(200, 200, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let edgeTransitions = 0;
  const totalPixels = info.width * info.height;

  for (let y = 0; y < info.height; y++) {
    for (let x = 1; x < info.width; x++) {
      const idx = y * info.width + x;
      const diffX = Math.abs(data[idx] - data[idx - 1]);
      if (diffX > 26) {
        edgeTransitions++;
      }
    }
  }

  // Normalize edge transition ratio into a 0.00 - 1.00 density score
  const rawRatio = edgeTransitions / (totalPixels * 0.16);
  const densityScore = Number(Math.max(0.05, Math.min(0.99, rawRatio)).toFixed(2));
  const recommendedBudget =
    densityScore >= 0.35 ? CONFIG.visionBudgets.DENSE_1120 : CONFIG.visionBudgets.LAYOUT_280;

  return {
    densityScore,
    recommendedBudget
  };
}

/**
 * Resizes and encodes a slide image according to Gemma 4's variable vision token budgets:
 * - 280 tokens (Layout): Downscales to 448x448 (1 base tile) -> fast prefill, blurs 8pt footnotes.
 * - 1120 tokens (Dense): Preserves 1120x1120 high-res detail (2x2 tiles = 4 x 280 tokens) -> reads 8pt footnotes & financial tables.
 */
export async function prepareSlideForVisionBudget(imageInput, options = {}) {
  const buffer = typeof imageInput === 'string' ? fs.readFileSync(imageInput) : imageInput;
  const metadata = await sharp(buffer).metadata();
  const { densityScore, recommendedBudget } = await estimateSlideDensity(buffer);

  const requestedBudget =
    options.budget === 280 || options.budget === 1120
      ? Number(options.budget)
      : recommendedBudget;

  let processedBuffer;
  let targetResolution;

  if (requestedBudget === CONFIG.visionBudgets.LAYOUT_280) {
    targetResolution = '448x448 (1x1 Base Tile)';
    processedBuffer = await sharp(buffer)
      .resize(448, 448, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 78 })
      .toBuffer();
  } else {
    targetResolution = '1120x1120 (2x2 High-Res Multi-Tile)';
    processedBuffer = await sharp(buffer)
      .resize(1120, 1120, { fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 6 })
      .toBuffer();
  }

  return {
    slideIndex: options.slideIndex || 1,
    slideTitle: options.slideTitle || `Slide ${options.slideIndex || 1}`,
    visionTokenBudgetUsed: requestedBudget,
    recommendedBudget,
    detectedDensityScore: densityScore,
    originalDimensions: `${metadata.width || 0}x${metadata.height || 0}`,
    targetResolution,
    byteLength: processedBuffer.length,
    base64Image: processedBuffer.toString('base64'),
    previewDataUrl: `data:image/png;base64,${buffer.toString('base64')}`
  };
}
