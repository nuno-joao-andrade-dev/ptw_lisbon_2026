# Step 01 (`00–15m`): Live Roast & Local Ollama Architecture Setup

## How to Run
```bash
cd step-01-setup
npm start
```

## What This Step Does
1. **Verifies Local Ollama (`http://127.0.0.1:11434`)**: Confirms that `gemma4:e2b` (or `gemma4:e4b`) is installed and reports its native capabilities (`completion`, `vision`, `audio`, `tools`, `thinking`).
2. **Validates the Audio & Vision Pipelines**: Loads `fixtures/fixture_01_roast/pitch_20s.wav` (`16,000 Hz` 16-bit mono PCM) and `slide_1.png` (`1120` vision token budget).
3. **Executes the 20-Second Live VC Roast**: Streams Gemma 4's `<think>` reasoning trace and roasts **QuantumSynergy.ai** for claiming *"zero churn"*, *"infinite LTV"*, and *"4,200 enterprise pilots"* while Slide 1 shows `18.4% monthly churn`, `0.19x LTV:CAC`, and `3 unpaid design partners`.

## Workshop Tweaks to Try in `index.js`
- Change `VISION_BUDGET` from `1120` to `280` to compare layout vs. dense vision token speed.
- Change `FIXTURE_ID` from `'fixture_01_roast'` to `'fixture_03_clean'` to see how Gemma 4 responds to an honest pitch.
