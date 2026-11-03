# Step 05 (`75–90m`): The Live Pitch Arena Finale (Express + Portugal Tech Week React UI)

## How to Run
```bash
cd step-05-arena
npm start
```
Then open **[http://localhost:4000](http://localhost:4000)** in your browser.

## Features in the Portugal Tech Week Pitch Arena UI
1. **Quick-Load Test Fixtures**:
   - **🔥 Test 1: QuantumSynergy (20s)** (`fixtures/fixture_01_roast`)
   - **🧪 Test 2: CloudMetrics (30s)** (`fixtures/fixture_02_sprint`)
   - **✅ Test 3: VeraGrid (30s)** (`fixtures/fixture_03_clean`)
2. **Spoken Elevator Pitch Controls (Record Live Mic AND/OR Upload `.wav`)**:
   - Record a live 30-second microphone pitch in the browser (`16,000 Hz` 16-bit mono PCM `.wav` encoder + live `#4E9DE0` waveform visualizer), **or** upload any `.wav` file from disk.
   - Play/pause preview, telemetry badge, and 1-click clear.
3. **Slide Deck Upload & Per-Slide Vision Token Budget Controls (Up to 3 Slides)**:
   - Upload 1–3 `.png`, `.jpg`, or `.webp` slides via file picker or drag-and-drop.
   - Edit slide titles, toggle each slide between **`280 Tokens • Layout`** and **`1120 Tokens • Dense`**, replace individual slides, or remove slides.
4. **Live SSE Streaming from Local Ollama (`gemma4:e2b`)**:
   - Watch Gemma 4's `<think>` trace and deterministic VC tool executions stream in real time before revealing the final **Pitch Scorecard & VC Roast**.
