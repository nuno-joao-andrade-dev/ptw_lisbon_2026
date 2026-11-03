# Step 03 (`35–55m`): Sprint 2 — Multimodal Contradiction Detection

## How to Run
```bash
cd step-03-contradictions
npm start
```

## What This Step Does
1. **Combines 30s Audio + 3 Slide Deck Images** in a single multimodal request to Local Ollama (`gemma4:e2b`).
2. **Enforces Variable Vision Token Budgets (`280` vs. `1120`)** via `sharp`:
   - Slide 1 (*Title & Value Prop*): `280` tokens (`448x448` fast layout tile).
   - Slide 2 (*Unit Economics & Bottom-Up TAM Table + 8pt Footnote*): `1120` tokens (`1120x1120` high-res multi-tile).
   - Slide 3 (*96-Word System Architecture*): `1120` tokens.
3. **Detects Cross-Modal Contradictions**: Catches *CloudMetrics Pro*'s spoken `1.0x` burn multiple vs. Slide 2's `$350,000/mo` net burn (`3.50x`), spoken `4.8x` LTV:CAC vs. Slide 2's `1.70x`, and spoken `$90B` TAM vs. `150,000 × $3,000 = $450M` (`200x` inflation).

## Workshop Tweaks to Try in `index.js`
- Change `SLIDE_2_VISION_BUDGET` from `1120` down to `280` and re-run `npm start` to see how downscaling to 280 tokens blurs the 8pt footnote at the bottom of Slide 2!
