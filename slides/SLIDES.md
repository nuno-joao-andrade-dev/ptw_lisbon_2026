---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  section {
    background-color: #FFFFFF;
    background-image:
      linear-gradient(90deg, #E86C2C 0%, #F7C948 35%, #5AB6E8 70%, #05509B 100%);
    background-size: 100% 8px;
    background-repeat: no-repeat;
    background-position: top left;
    color: #090C15;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    padding: 46px 64px 40px 64px;
    line-height: 1.4;
  }

  h1 {
    font-weight: 800;
    color: #090C15;
    font-size: 2.3rem;
    letter-spacing: -0.03em;
    margin: 0 0 12px 0;
  }

  h2 {
    font-weight: 800;
    color: #05509B;
    font-size: 1.45rem;
    letter-spacing: -0.02em;
    margin: 0 0 12px 0;
  }

  h3 {
    font-weight: 700;
    color: #E86C2C;
    font-size: 1.05rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 8px 0;
  }

  p, li {
    color: #25334A;
    font-size: 0.96rem;
  }

  code {
    font-family: 'IBM Plex Mono', monospace;
    background: #F0F6FC;
    color: #05509B;
    padding: 2px 6px;
    border-radius: 5px;
    font-size: 0.86em;
  }

  pre {
    background: #0B1528 !important;
    color: #F8FAFC !important;
    border-radius: 12px;
    padding: 16px 20px !important;
    border-left: 5px solid #E86C2C;
    font-size: 0.78rem;
  }

  pre code {
    background: transparent;
    color: #F8FAFC;
    padding: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  th {
    background: #05509B;
    color: #FFFFFF;
    text-align: left;
    padding: 10px 14px;
  }

  td {
    border-bottom: 1px solid #D8E2F0;
    padding: 9px 14px;
    background: #F8FAFD;
    color: #090C15;
  }

  blockquote {
    background: #FFF9EB;
    border-left: 5px solid #E86C2C;
    padding: 12px 18px;
    border-radius: 10px;
    color: #4D5E78;
    margin: 12px 0;
  }
---

<!-- Slide 1: Title Slide -->
### PORTUGAL TECH WEEK • HANDS-ON AI WORKSHOP (90 MIN)

# Build a Multimodal Pitch & Deck Critic with **Gemma 4**

**Audio Delivery + Slide Deck Vision + Deterministic VC Audit Tools — 100% Local on Ollama (`gemma4:e2b`)**

- **Stack:** Node.js 22+ (ESM) • Native `fetch` • Local Ollama (`http://127.0.0.1:11434`) • React + Vite
- **Architecture:** Progressive 5-Step Repository (`step-01-setup` → `step-05-arena`)
- **Speaker:** **Nuno João Andrade** — `www.linkedin.com/in/nuno-andrade-964b2416`

> **Educational Workshop Guide — Not a Real Investment Verdict:**
> This project is a hands-on technical workshop and training guide to help founders practice their startup pitch. Scores and roasts are simulated for educational purposes only.

---

<!-- Slide 2: Speaker Bio (Immediately After Title Slide) -->
### ABOUT YOUR SPEAKER • PORTUGAL TECH WEEK

# Nuno João Andrade
**Senior Developer & Cloud Platform Expert (GCP / AWS) • Google Developer Expert (GDE) for Cloud**

- **10+ Years Engineering Leadership:** Designing resilient, scalable cloud platforms, high-throughput backend systems (**Node.js**, **C++**), and production **AI & Computer Vision** solutions.
- **Industry Track Record:**
  - **High-Volume Transaction Systems:** Mission-critical, low-latency distributed financial & transactional pipelines
  - **Energy Sector:** Smart grid telemetry & cloud-native energy platforms
  - **Gaming Industry:** Real-time backend services & scalable online infrastructure
  - **Computer Vision & Applied AI:** Multimodal inference & edge/local AI deployments

> **Connect on LinkedIn:** [**`www.linkedin.com/in/nuno-andrade-964b2416`**](https://www.linkedin.com/in/nuno-andrade-964b2416)
> **Website:** [`nja.dev`](https://nja.dev) • **GitHub:** [`github.com/nuno-joao-andrade`](https://github.com/nuno-joao-andrade)

---

<!-- Slide 3: The Pitch Problem & Workshop Goal -->
### 01 • THE PROBLEM WE ARE SOLVING

# Why Most Startup Pitches Fail in the First 60 Seconds

Founders rehearse their spoken pitch and design their slide deck separately — creating hidden blind spots:

| Failure Mode | What Happens in the Room | How Our Gemma 4 Critic Catches It |
| :--- | :--- | :--- |
| **1. Spoken vs. Visual Contradictions** | Saying *"15% MoM growth"* out loud while Slide 2 shows a flat chart or `$18k MRR` vs `$20k MRR`. | **Step 3:** Cross-Modal Audio + Slide Vision Contradiction Detector |
| **2. Pacing & Delivery Blind Spots** | Speaking at `185 WPM` in a rushed monotone or filling pauses with *"um, basically, like"*. | **Step 2:** Native Audio Delivery & Narrative Arc Analyzer |
| **3. Broken Unit Economics** | Claiming `LTV:CAC = 9.0x` when `$2,400 LTV / $600 CAC` actually equals **`4.0x`**. | **Step 4:** Deterministic VC Tool Calling (`verify_unit_economics`) |

> **Workshop Disclaimer:** Built as an interactive self-coaching mirror in the UI (`#dialog-workshop-disclaimer`) — a safe rehearsal arena before pitching to real investors.

---

<!-- Slide 4: Architecture Overview -->
### 02 • MULTIMODAL SYSTEM ARCHITECTURE

# End-to-End Local Multimodal Pipeline (`gemma4:e2b`)

```
[Founder Pitch Input]
  ├── Pitch Audio (WAV/WebM Mic) + Transcript
  └── Slide Deck PNGs (1600x900)
          │
          ▼
[shared/ollama-client.js] ──► POST http://127.0.0.1:11434/api/chat (options: { temperature: 0.1 })
          │
          ├──► Step 1: 20s Elevator Pitch Roast (Structured JSON)
          ├──► Step 2: Audio Delivery & Narrative Arc (Hook → Problem → Solution → Traction → Ask)
          ├──► Step 3: Cross-Modal Audio + Multi-Slide Vision Contradiction Detector
          └──► Step 4: Multi-Turn VC Tool Loop (shared/vc-tools.js)
                  ├── verify_unit_economics({ cac, ltv, grossMarginPct, paybackMonths })
                  ├── check_tam_math({ targetCustomers, acvUsd, claimedTamUsd })
                  ├── score_slide_readability({ slideNumber, wordCount, dataPointsCount, fontSizePt })
                  └── compute_fundability_index({ clarityScore, tractionScore, moatScore, teamScore })
          │
          ▼
[Step 5: Portugal Tech Week Pitch Critic Arena UI (http://localhost:3000)]
```

---

<!-- Slide 5: Environment Setup -->
### 03 • PREREQUISITES & LOCAL SETUP

# Zero-Cloud Setup with Node.js 22+ & Local Ollama

Everything runs **100% locally on your laptop** with **0 npm vulnerabilities** and **no API keys**:

```bash
# 1. Verify Ollama is running locally and gemma4:e2b is installed
ollama list
# Expected: gemma4:e2b (7.2 GB, Q4_K_M multimodal checkpoint)

# 2. Install workshop dependencies and generate synthetic pitch fixtures
npm install
npm run generate:fixtures

# 3. Run the 11-test verification suite
npm test
```

- **`shared/ollama-client.js`**: Wraps `POST /api/chat`, encodes PNG slides as Base64 in `message.images`, and extracts structured JSON responses reliably.

---

<!-- Slide 6: 5-Step Roadmap & Fixtures -->
### 04 • PROGRESSIVE 5-STEP ROADMAP & TEST FIXTURES

# 5 Incremental Steps + 3 Built-In Startup Pitch Scenarios

| Step | Directory | Command | Core Capability Built |
| :--- | :--- | :--- | :--- |
| **Step 1** | `step-01-setup/` | `npm run step1` | Local Ollama check + 20-Second Elevator Pitch Roast (`roast`, `clarityScore`) |
| **Step 2** | `step-02-audio-critic/` | `npm run step2` | Audio Delivery Metrics (`estimatedWpm`, `fillerWordCount`) + 5-Part Narrative Arc |
| **Step 3** | `step-03-deck-critic/` | `npm run step3` | Multi-Slide Vision (`LOW 280` vs `HIGH 1120` tokens) + Audio/Deck Contradictions |
| **Step 4** | `step-04-vc-judge/` | `npm run step4` | Multi-Turn Tool Calling with 4 Deterministic VC Math Calculators |
| **Step 5** | `step-05-arena/` | `npm run step5` | Full-Stack Express + React Portugal Tech Week Pitch Critic Arena |

**3 Ready-to-Run Fixtures in `fixtures/`:**
1. **Pitch 01 (`pitch-01` — Strong):** * Lusitania Cloud AI* (`$48k MRR`, `18% MoM`, `LTV:CAC = 9.0x`, clean slides)
2. **Pitch 02 (`pitch-02` — Flawed):** *QuantumPet Blockchain* (`$1.2k MRR`, `LTV:CAC = 0.27x`, `112` words on Slide 1)
3. **Pitch 03 (`pitch-03` — Contradiction):** *GreenGrid Portugal* (Says `$20k MRR` & `9x LTV:CAC` vs Slide `$18k MRR` & `4.0x`)

---

<!-- Slide 7: Step 1 — 20s Roast -->
### 05 • STEP 1 (`step-01-setup/index.js`)

# Step 1: The 20-Second Elevator Pitch Roast

Verify connectivity to Local Ollama (`gemma4:e2b`) and enforce a **strict JSON output contract**:

```js
const response = await chatOllama({
  system:
    'You are a blunt Partner at Portugal Tech Week Ventures. ' +
    'Evaluate the startup pitch and return ONLY valid JSON.',
  messages: [{ role: 'user', content: buildStep1Prompt(pitchText) }],
  format: 'json',
  temperature: 0.1
});
```

**Guaranteed Output Schema (`analyzeElevatorPitch`):**
- `oneLineVerdict`: Sharp summary of what the startup actually does
- `clarityScore`: Integer `1..10`
- `roast`: Punchy VC critique exposing buzzwords or vague value propositions
- `buzzwordsDetected`: Array of hype terms (`["quantum", "metaverse", "AI-powered"]`)
- `improvedHook`: Rewritten 1-sentence opening hook ready for stage

---

<!-- Slide 8: Step 2 — Audio Delivery & Narrative Arc -->
### 06 • STEP 2 (`step-02-audio-critic/index.js`)

# Step 2: Audio Pitch Delivery & 5-Part Narrative Arc

Combine **deterministic WAV telemetry** (`inspectWavFile` + `computeSpeechMetrics`) with **Gemma 4 narrative coaching**:

1. **Objective Audio Delivery Metrics:**
   - Speaking Pace (`estimatedWpm` — ideal target: **`130–155 WPM`**)
   - Filler Word Detection (`fillerWordCount`, `fillerWordsFound`: *um, uh, like, basically, literally*)
   - Monotone Risk (`monotoneRisk`: `"LOW" | "MEDIUM" | "HIGH"`)
2. **5-Stage VC Narrative Arc Checklist (`narrativeArc`):**
   - `hook` • `problem` • `solution` • `traction` • `ask` (each scored `"STRONG" | "WEAK" | "MISSING"`)
3. **Top 3 Delivery Coaching Tips (`top3DeliveryTips`):**
   - Concrete rehearsal adjustments for pacing, pauses, and vocal emphasis.

---

<!-- Slide 9: Vision Token Budgets -->
### 07 • MULTIMODAL VISION ENGINEERING

# Vision Token Budgets: `LOW (280)` vs `HIGH (1120)` Tokens

Located in [`shared/media-utils.js`](../shared/media-utils.js), `prepareSlideImage(imagePath, resolution)` resizes slide PNGs with `sharp` before Base64 encoding to control latency vs. OCR precision:

| Resolution Mode | Bounding Box | Approx. Token Budget | Best Used For |
| :--- | :--- | :--- | :--- |
| **`LOW` Mode** | `640 × 360 px` | **`~280 tokens / slide`** | Fast layout scan, visual clutter check, headline hierarchy |
| **`HIGH` Mode** (Default) | `1280 × 720 px` | **`~1120 tokens / slide`** | Reading dense financial tables, chart axes, unit economics, footnotes |

```js
export async function prepareSlideImage(imageInput, resolution = 'HIGH') {
  const mode = VISION_RESOLUTION_MODES[resolution] || VISION_RESOLUTION_MODES.HIGH;
  const resizedBuffer = await sharp(rawBuffer)
    .resize(mode.width, mode.height, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 8 })
    .toBuffer();
  return { base64: resizedBuffer.toString('base64'), tokenBudget: mode.tokenBudget };
}
```

---

<!-- Slide 10: Step 3 — Cross-Modal Contradiction Detector -->
### 08 • STEP 3 (`step-03-deck-critic/index.js`)

# Step 3: Cross-Modal Audio + Slide Contradiction Detector

Pass the **spoken pitch transcript** alongside **multiple slide PNGs (`images: [base64_1, base64_2]`)** in a single multimodal request:

```js
const response = await chatOllama({
  messages: [{
    role: 'user',
    content: prompt,
    images: preparedSlides.map((s) => s.base64) // Slide 1 + Slide 2 PNGs
  }],
  format: 'json'
});
```

**What Step 3 Catches on Pitch 03 (*GreenGrid Portugal*):**
- **Contradiction #1 (MRR):** Spoken audio claims **`$20,000 MRR`**, while Slide 2 displays **`$18,000 MRR`**.
- **Contradiction #2 (LTV:CAC):** Spoken audio claims **`9x LTV:CAC`**, while Slide 2 shows **`$2,400 LTV / $600 CAC = 4.0x`**.
- **Contradiction #3 (MoM Growth):** Spoken audio claims **`15% MoM`**, while Slide 2 shows **`14% MoM`**.

---

<!-- Slide 11: Deterministic VC Tools -->
### 09 • STEP 4 DETERMINISTIC VC TOOLS (`shared/vc-tools.js`)

# Never Let an LLM Hallucinate Startup Arithmetic

LLMs are great at reasoning, but financial diligence requires **exact math**. We expose **4 deterministic tools** in `shared/vc-tools.js`:

1. **`verify_unit_economics({ cac, ltv, grossMarginPct, paybackMonths })`**
   - Computes exact `ltvCacRatio = ltv / cac` and classifies `"ELITE_SAAS" (≥5x)`, `"HEALTHY" (≥3x)`, `"MARGINAL"`, or `"UNSUSTAINABLE" (<1.5x)`.
2. **`check_tam_math({ targetCustomers, acvUsd, claimedTamUsd })`**
   - Computes `bottomUpTamUsd = targetCustomers * acvUsd` and flags `INFLATED_TAM` if claimed TAM exceeds bottom-up math by `>50%`.
3. **`score_slide_readability({ slideNumber, wordCount, dataPointsCount, fontSizePt })`**
   - Flags `WALL_OF_TEXT (>75 words)`, `DATA_OVERLOAD (>6 metrics)`, and `FONT_TOO_SMALL (<18pt)`.
4. **`compute_fundability_index({ clarityScore, tractionScore, moatScore, teamScore })`**
   - Weighted rubric (**Traction 30% • Clarity 25% • Moat 25% • Team 20%**) → `0–100` score + `"STRONG PASS" | "SOFT PASS" | "BORDERLINE" | "HARD PASS"`.

---

<!-- Slide 12: Step 4 Multi-Turn Tool Loop -->
### 10 • STEP 4 (`step-04-vc-judge/index.js`)

# Step 4: Multi-Turn VC Judge & Investment Memo

```
Turn 1: Gemma 4 inspects Pitch + Deck + Claims ──► Emits tool_calls[]
Turn 2: Node.js executes executeVcTool(name, args) ──► Appends role: "tool" results
Turn 3: Gemma 4 synthesizes verified math into Final JSON Investment Memo
```

- **Resilient Hybrid Design:**
  - Executes native Ollama `tool_calls` in a multi-turn loop (`maxTurns = 5`).
  - Automatically ensures all 4 VC tools (`verify_unit_economics`, `check_tam_math`, `score_slide_readability`, `compute_fundability_index`) run against the structured pitch claims so the UI audit breakdown is **100% deterministic**.

---

<!-- Slide 13: Step 5 Live Pitch Arena UI -->
### 11 • STEP 5 (`step-05-arena/`)

# Step 5: Portugal Tech Week Pitch Critic Arena Web UI

Launch the full-stack Express + React application at **`http://localhost:3000`**:

```bash
npm run step5
```

- **Left Column (`PitchInputCard.jsx`):**
  - 1-click **Sample Scenario Loader** (`Pitch 01 Strong`, `Pitch 02 Flawed`, `Pitch 03 Contradiction`)
  - **Live Browser Microphone Recorder** (`MediaRecorder` + live timer) or **Audio File Upload**
  - **Multi-Slide Drag-and-Drop Uploader** + **Vision Token Toggle (`LOW 280` vs `HIGH 1120`)**
- **Right Column (`VerdictAndRoastCard.jsx` + `AuditBreakdownCard.jsx`):**
  - **Fundability Index Ring (`0–100`)**, **VC Verdict Badge**, **20s Roast**, **Cross-Modal Contradictions**, **5-Part Narrative Arc**, and **Deterministic VC Tool Verification Cards**.
- **Workshop Guide Disclaimer Modal (`WorkshopDisclaimerDialog.jsx`):**
  - Opens on load & via header button (`#btn-open-workshop-dialog`) reminding founders this is a training guide, not a real investment verdict.

---

<!-- Slide 14: Recap & Next Steps -->
### 12 • WORKSHOP WRAP-UP & CHEAT SHEET

# Summary, Commands & Connect with Nuno

```bash
npm test              # Run all 11 automated tests (Fixtures + Steps 1-5 + API)
npm run step1         # Step 1: 20-Second Elevator Pitch Roast
npm run step2         # Step 2: Audio Delivery & 5-Part Narrative Arc
npm run step3         # Step 3: Slide Vision + Cross-Modal Contradiction Detector
npm run step4         # Step 4: Deterministic VC Tool-Calling Judge
npm run step5         # Step 5: Launch Portugal Tech Week Web Arena (http://localhost:3000)
npm run slides        # Open this Portugal Tech Week Workshop Slide Deck
```

- **Key Takeaway:** Combine **Gemma 4 multimodal perception** (Audio + Multi-Slide Vision) with **deterministic Node.js tools** (`shared/vc-tools.js`) so your AI applications never hallucinate critical math.
- **Speaker:** **Nuno João Andrade** — Senior Developer & Cloud Platform Expert (GCP / AWS) • GDE Cloud
- **LinkedIn:** [**`www.linkedin.com/in/nuno-andrade-964b2416`**](https://www.linkedin.com/in/nuno-andrade-964b2416) • **Web:** [`nja.dev`](https://nja.dev)
