# 🇵🇹 Portugal Tech Week — Multimodal Pitch & Deck Critic with Gemma 4 + Local Ollama

A 90-minute hands-on workshop building a **100% local, zero-retention AI Investment Committee ("VC Brain")** in **Node.js (ES Modules)** and **React** powered by **Gemma 4 (`gemma4:e2b`)** running on your **Local Ollama Server (`http://127.0.0.1:11434`)**.

> - **📦 Workshop GitHub Repository:** [https://github.com/nuno-joao-andrade-dev/ptw_lisbon_2026](https://github.com/nuno-joao-andrade-dev/ptw_lisbon_2026)
> - **📊 Interactive Presentation Slides:** [`slides/index.html`](./slides/index.html) (`npm run slides`)
> - **📝 Full Technical Blog Walkthrough:** [`ARTICLE.md`](./ARTICLE.md)
> - **🇵🇹 Special Thanks:** A special thank you to **[Portugal Tech Week](https://portugaltechweek.com/)**, **[Kátia Sidorenko](https://www.linkedin.com/in/sidorina-katerenko/)**, and **[Laura Andrade](https://www.linkedin.com/in/lauraandrade2025/)** for the warm invitation, organization, and support in making this hands-on session in Lisbon possible!

---

## 1. Prerequisites & One-Time Setup

1. **Local Ollama Server (`http://127.0.0.1:11434`)**:
   ```bash
   ollama serve
   ollama pull gemma4:e2b
   ```
   *(Optional: If your laptop is low on RAM, point to the room's LAN Ollama server via `export OLLAMA_HOST=http://<LAN_IP>:11434`)*

2. **Install Node.js Dependencies (Once at the Root)**:
   ```bash
   npm install
   ```

---

## 2. The 5-Step Workshop Flow

Each step is a self-contained folder. Simply `cd` into the step folder and run `npm start`:

| Step Folder | Workshop Time | Stage | Command |
| :--- | :--- | :--- | :--- |
| **[`step-01-setup/`](./step-01-setup)** | `00–15m` | **Live Roast & Local Ollama Check** | `cd step-01-setup && npm start` |
| **[`step-02-narrative/`](./step-02-narrative)** | `15–35m` | **Sprint 1: Narrative Structure Analyzer** | `cd step-02-narrative && npm start` |
| **[`step-03-contradictions/`](./step-03-contradictions)** | `35–55m` | **Sprint 2: Multimodal Contradiction Detection** | `cd step-03-contradictions && npm start` |
| **[`step-04-tools/`](./step-04-tools)** | `55–75m` | **Sprint 3: Deterministic VC Tool Calls** | `cd step-04-tools && npm start` |
| **[`step-05-arena/`](./step-05-arena)** | `75–90m` | **The Live Pitch Arena Finale (Web UI)** | `cd step-05-arena && npm start` → Open `http://localhost:4000` |

---

## 3. Pre-Built Test Material (`fixtures/`)

- **`fixtures/fixture_01_roast/` (`QuantumSynergy.ai` — 20s Pitch + 1 Slide)**:
  - `pitch_20s.wav` + `slide_1.png` (Spoken *"zero churn"* & *"4,200 pilots"* vs. Slide `18.4%` churn & `3` unpaid design partners).
- **`fixtures/fixture_02_sprint/` (`CloudMetrics Pro` — 30s Pitch + 3 Slides)**:
  - `pitch_30s.wav` + `slide_1.png`, `slide_2.png`, `slide_3.png` (Spoken `1.0x` burn multiple vs. Slide 2 `3.50x`; spoken `$90B` TAM vs. `$450M` bottom-up math; Slide 2 8pt footnote; Slide 3 96-word wall of text).
- **`fixtures/fixture_03_clean/` (`VeraGrid Energy` — 30s Pitch + 3 Slides)**:
  - `pitch_30s.wav` + `slide_1.png`, `slide_2.png`, `slide_3.png` (100% consistent unit economics and TAM math → `INVEST` verdict).

---

## 4. Verification & Testing

```bash
# Run automated unit & integration tests
npm test

# Verify all audio (.wav) & slide (.png) fixtures
npm run fixtures

# Build the production React frontend bundle
npm run build:ui
```
