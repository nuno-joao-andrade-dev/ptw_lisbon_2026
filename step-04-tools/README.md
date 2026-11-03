# Step 04 (`55–75m`): Sprint 3 — Deterministic VC Tool Calls ("Bullshit Detector")

## How to Run
```bash
cd step-04-tools
npm start
```

## What This Step Does
1. **Registers 4 Native JavaScript Tools with Local Ollama (`tools` API)**:
   - `audit_unit_economics`: Computes actual Burn Multiple ($\frac{\text{Monthly Burn} \times 12}{\text{Net New ARR}}$) and LTV:CAC ratio.
   - `verify_tam_math`: Computes Bottom-Up TAM ($\text{Customers} \times \text{Annual Price}$) vs. claimed top-down TAM.
   - `check_slide_density`: Flags wall-of-text slides (`> 75` words) and recommends `280` vs. `1120` vision tokens.
   - `flag_buzzword_overload`: Counts VC hype buzzwords per minute.
2. **Runs the 2-Turn Verification Loop**:
   - **Turn 1**: Gemma 4 inspects the audio & slides and emits `tool_calls`.
   - **Turn 2**: Node.js executes the deterministic math functions and feeds the ground-truth results back into Gemma 4 with `format: InvestmentCommitteeVerdictSchema`.

## Workshop Tweaks to Try in `index.js`
- Switch `FIXTURE_ID` between `'fixture_02_sprint'` (*CloudMetrics Pro* — triggers `HARD_PASS`) and `'fixture_03_clean'` (*VeraGrid Energy* — passes all 4 tools and triggers `INVEST`).
