/**
 * scripts/capture-slide-screenshots.js
 * Renders all 14 slides from slides/index.html into high-DPI PNG screenshots
 * in slides/images/ (2880x1840, 1440x920 @ 2x) plus the 2400x1260 blog cover image.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const slidesHtmlPath = path.join(rootDir, 'slides', 'index.html');
const imagesDir = path.join(rootDir, 'slides', 'images');

// Resolve puppeteer from local or sibling workspace
const require = createRequire(
  fs.existsSync(path.join(rootDir, 'node_modules', 'puppeteer'))
    ? import.meta.url
    : pathToFileURL('/home/nja/projects/drawit.nja.dev/package.json').href
);
const puppeteer = require('puppeteer');

const SLIDE_FILES = [
  { num: 1, file: 'slide-01-title.png' },
  { num: 2, file: 'slide-02-speaker-nuno-andrade.png' },
  { num: 3, file: 'slide-03-problem-disclaimer.png' },
  { num: 4, file: 'slide-04-architecture.png' },
  { num: 5, file: 'slide-05-setup-ollama-gemma4.png' },
  { num: 6, file: 'slide-06-workshop-roadmap.png' },
  { num: 7, file: 'slide-07-step-01-roast.png' },
  { num: 8, file: 'slide-08-step-02-narrative.png' },
  { num: 9, file: 'slide-09-vision-token-budgets.png' },
  { num: 10, file: 'slide-10-step-03-contradictions.png' },
  { num: 11, file: 'slide-11-vc-tools-vs-hallucination.png' },
  { num: 12, file: 'slide-12-step-04-vc-judge.png' },
  { num: 13, file: 'slide-13-step-05-arena-ui.png' },
  { num: 14, file: 'slide-14-recap-cheatsheet.png' }
];

async function captureAll() {
  fs.mkdirSync(imagesDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1440,
      height: 920,
      deviceScaleFactor: 2
    });

    const baseUrl = pathToFileURL(slidesHtmlPath).href;
    await page.goto(`${baseUrl}#slide-1`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);

    for (const { num, file } of SLIDE_FILES) {
      await page.evaluate((slideIdx) => {
        window.location.hash = `slide-${slideIdx}`;
        const slides = Array.from(document.querySelectorAll('.slide'));
        slides.forEach((s, idx) => s.classList.toggle('active', idx === slideIdx - 1));
        const counterEl = document.getElementById('slideCounter');
        const progressEl = document.getElementById('progressBarFill');
        if (counterEl) counterEl.textContent = `${slideIdx} / ${slides.length}`;
        if (progressEl) progressEl.style.width = `${(slideIdx / slides.length) * 100}%`;
      }, num);

      await new Promise((r) => setTimeout(r, 150));

      const outPath = path.join(imagesDir, file);
      await page.screenshot({ path: outPath, type: 'png' });
      console.log(`✅ Captured Slide ${String(num).padStart(2, '0')} -> slides/images/${file}`);
    }

    // Also capture the 2400x1260 (1200x630 @ 2x) cover hero image from Slide 1
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 2
    });
    await page.evaluate(() => {
      window.location.hash = 'slide-1';
      const slides = Array.from(document.querySelectorAll('.slide'));
      slides.forEach((s, idx) => s.classList.toggle('active', idx === 0));
      const counterEl = document.getElementById('slideCounter');
      const progressEl = document.getElementById('progressBarFill');
      if (counterEl) counterEl.textContent = `1 / ${slides.length}`;
      if (progressEl) progressEl.style.width = `${(1 / slides.length) * 100}%`;
      // Hide top header and bottom footer for the clean hero card cover image, matching devfest_lagos_2026.jpeg
      const header = document.querySelector('.deck-header');
      const footer = document.querySelector('.deck-footer');
      const cmdBar = slides[0]?.querySelector('.cmd-bar');
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';
      if (cmdBar) cmdBar.style.display = 'none';
      if (slides[0]) {
        slides[0].style.padding = '36px 56px';
        slides[0].style.justifyContent = 'center';
      }
    });
    await new Promise((r) => setTimeout(r, 150));

    const coverPngPath = path.join(imagesDir, 'portugal_tech_week_2026.png');
    const coverJpegPath = path.join(imagesDir, 'portugal_tech_week_2026.jpeg');
    await page.screenshot({ path: coverPngPath, type: 'png' });
    await page.screenshot({ path: coverJpegPath, type: 'jpeg', quality: 92 });
    console.log('✅ Captured Hero Cover -> slides/images/portugal_tech_week_2026.png & .jpeg');
  } finally {
    await browser.close();
  }
}

captureAll().catch((err) => {
  console.error('❌ Screenshot capture failed:', err);
  process.exit(1);
});
