# Step 02 (`15–35m`): Sprint 1 — Narrative Structure Analyzer

## How to Run
```bash
cd step-02-narrative
npm start
```

## What This Step Does
1. **Ingests the 30s Spoken Elevator Pitch (`pitch_30s.wav`)**: Normalizes the `.wav` buffer to `16,000 Hz` 16-bit mono PCM (`~25` audio tokens/sec for Gemma 4's USM encoder).
2. **Enables Configurable Thinking Mode (`think: true`)**: Streams Gemma 4's internal reasoning trace (`message.thinking`) from Local Ollama (`http://127.0.0.1:11434/api/chat`).
3. **Enforces Strict JSON Schema (`format`)**: Uses `toOllamaJsonSchema(NarrativeStructureSchema)` so Gemma 4 outputs guaranteed structured scores (`0–10`) for **Hook**, **Problem**, **Solution**, **Traction**, **The Ask**, and **Story Arc**.

## Workshop Tweaks to Try in `index.js`
- Toggle `ENABLE_THINKING` between `true` and `false` to compare latency vs. critique depth.
- Switch `FIXTURE_ID` between `'fixture_02_sprint'` (*CloudMetrics Pro*) and `'fixture_03_clean'` (*VeraGrid Energy*).
