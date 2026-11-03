import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SLIDES_DIR = path.join(ROOT_DIR, 'slides');
const IMAGES_DIR = path.join(SLIDES_DIR, 'images');
const ASSETS_DIR = path.join(SLIDES_DIR, 'assets');

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function baseSlideSvg({ slideNumber, totalSlides = 14, kicker, title, subtitle, bodySvg }) {
  return `<svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ptwRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E86C2C"/>
      <stop offset="35%" stop-color="#F7C948"/>
      <stop offset="70%" stop-color="#5AB6E8"/>
      <stop offset="100%" stop-color="#05509B"/>
    </linearGradient>
    <pattern id="azulejoGrid" width="80" height="80" patternUnits="userSpaceOnUse">
      <rect width="80" height="80" fill="none" stroke="#05509B" stroke-width="0.7" opacity="0.06"/>
      <circle cx="40" cy="40" r="24" fill="none" stroke="#5AB6E8" stroke-width="0.7" opacity="0.06"/>
      <polygon points="40,8 72,40 40,72 8,40" fill="none" stroke="#E86C2C" stroke-width="0.6" opacity="0.05"/>
    </pattern>
  </defs>

  <!-- Crisp White Background -->
  <rect width="1600" height="900" fill="#FFFFFF"/>
  <rect width="1600" height="900" fill="url(#azulejoGrid)"/>

  <!-- Top Portugal Tech Week Color Ribbon -->
  <rect x="0" y="0" width="1600" height="10" fill="url(#ptwRibbon)"/>

  <!-- Right Decorative Geometric PTW Tile Strip -->
  <g transform="translate(1520, 10)" opacity="0.12">
    <rect x="0" y="0" width="80" height="80" fill="#05509B"/>
    <circle cx="40" cy="40" r="28" fill="#5AB6E8"/>
    <rect x="0" y="80" width="80" height="80" fill="#E86C2C"/>
    <polygon points="40,92 68,120 40,148 12,120" fill="#F7C948"/>
    <rect x="0" y="160" width="80" height="80" fill="#5AB6E8"/>
    <circle cx="40" cy="200" r="24" fill="#FFFFFF"/>
    <rect x="0" y="240" width="80" height="80" fill="#F7C948"/>
    <polygon points="10,250 70,250 40,310" fill="#05509B"/>
  </g>

  <!-- Header Bar -->
  <rect x="0" y="10" width="1600" height="72" fill="#FFFFFF" opacity="0.95"/>
  <line x1="64" y1="82" x2="1536" y2="82" stroke="#D8E2F0" stroke-width="1.5"/>

  <!-- Header Pill Badge -->
  <rect x="330" y="27" width="380" height="36" rx="18" fill="#F0F6FC" stroke="#B9D7F6"/>
  <circle cx="352" cy="45" r="5" fill="#E86C2C"/>
  <text x="368" y="50" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="800" fill="#05509B" letter-spacing="1.2">PORTUGAL TECH WEEK • AI WORKSHOP</text>

  <!-- Header Right Speaker Tag -->
  <text x="1450" y="50" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#4D5E78">Nuno João Andrade • gemma4:e2b</text>
  <rect x="1468" y="27" width="68" height="36" rx="10" fill="#05509B"/>
  <text x="1502" y="50" text-anchor="middle" font-family="Courier New, monospace" font-size="15" font-weight="800" fill="#FFFFFF">${String(slideNumber).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}</text>

  <!-- Kicker -->
  <rect x="64" y="108" width="460" height="32" rx="16" fill="#FFF3EC" stroke="#FAD0B8"/>
  <circle cx="84" cy="124" r="5" fill="#E86C2C"/>
  <text x="98" y="129" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="800" fill="#C85216" letter-spacing="1.4">${esc(kicker)}</text>

  <!-- Slide Title & Subtitle -->
  <text x="64" y="186" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="900" fill="#090C15">${esc(title)}</text>
  <text x="64" y="222" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="500" fill="#4D5E78">${esc(subtitle)}</text>

  <!-- Main Body Content -->
  ${bodySvg}

  <!-- Footer Bar -->
  <line x1="64" y1="836" x2="1536" y2="836" stroke="#D8E2F0" stroke-width="1.5"/>
  <text x="64" y="868" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#05509B">PORTUGAL TECH WEEK • MULTIMODAL PITCH &amp; DECK CRITIC WORKSHOP</text>
  <text x="800" y="868" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="600" fill="#C85216">Educational Workshop Guide — Simulated Coaching Output Only</text>
  <text x="1536" y="868" text-anchor="end" font-family="Courier New, monospace" font-size="14" font-weight="700" fill="#090C15">www.linkedin.com/in/nuno-andrade-964b2416</text>
</svg>`;
}

const SLIDE_DEFINITIONS = [
  {
    filename: 'slide-01-title.png',
    kicker: 'PORTUGAL TECH WEEK • HANDS-ON WORKSHOP',
    title: 'Build a Multimodal Pitch & Deck Critic with Gemma 4',
    subtitle: 'Audio Delivery + Slide Deck Vision + Deterministic VC Audit Tools on Local Ollama (gemma4:e2b)',
    bodySvg: `
      <rect x="64" y="254" width="910" height="390" rx="20" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <rect x="64" y="254" width="910" height="8" rx="4" fill="#05509B"/>
      <text x="100" y="312" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="#05509B">What You Will Build in 90 Minutes</text>

      <circle cx="112" cy="362" r="14" fill="#E86C2C"/><text x="112" y="367" text-anchor="middle" font-family="Arial" font-size="14" font-weight="800" fill="#FFF">1</text>
      <text x="140" y="368" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#090C15">Step 1: 20-Second Elevator Pitch Roast (Structured JSON via Ollama)</text>

      <circle cx="112" cy="414" r="14" fill="#05509B"/><text x="112" y="419" text-anchor="middle" font-family="Arial" font-size="14" font-weight="800" fill="#FFF">2</text>
      <text x="140" y="420" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#090C15">Step 2: Audio Pitch Delivery &amp; 5-Part VC Narrative Arc Analyzer</text>

      <circle cx="112" cy="466" r="14" fill="#0E9F6E"/><text x="112" y="471" text-anchor="middle" font-family="Arial" font-size="14" font-weight="800" fill="#FFF">3</text>
      <text x="140" y="472" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#090C15">Step 3: Multi-Slide Vision (280 vs 1120 Tokens) + Contradiction Detector</text>

      <circle cx="112" cy="518" r="14" fill="#D97706"/><text x="112" y="523" text-anchor="middle" font-family="Arial" font-size="14" font-weight="800" fill="#FFF">4</text>
      <text x="140" y="524" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#090C15">Step 4: Multi-Turn VC Judge with 4 Deterministic Math Calculators</text>

      <circle cx="112" cy="570" r="14" fill="#05509B"/><text x="112" y="575" text-anchor="middle" font-family="Arial" font-size="14" font-weight="800" fill="#FFF">5</text>
      <text x="140" y="576" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#090C15">Step 5: Live Portugal Tech Week Pitch Critic Web Arena (React + Express)</text>

      <!-- Right Stack Summary Card -->
      <rect x="1004" y="254" width="532" height="390" rx="20" fill="#F0F6FC" stroke="#B9D7F6" stroke-width="2"/>
      <text x="1040" y="308" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="800" fill="#05509B">Workshop Stack &amp; Host</text>
      <text x="1040" y="354" font-family="Courier New, monospace" font-size="17" font-weight="700" fill="#090C15">• Model: gemma4:e2b (Local Ollama)</text>
      <text x="1040" y="392" font-family="Courier New, monospace" font-size="17" font-weight="700" fill="#090C15">• Runtime: Node.js 22+ ESM</text>
      <text x="1040" y="430" font-family="Courier New, monospace" font-size="17" font-weight="700" fill="#090C15">• Vision: Sharp 280 / 1120 Tokens</text>
      <text x="1040" y="468" font-family="Courier New, monospace" font-size="17" font-weight="700" fill="#090C15">• Tests: 11/11 Passing • 0 Vulns</text>

      <rect x="1040" y="502" width="460" height="114" rx="14" fill="#FFFFFF" stroke="#D8E2F0"/>
      <text x="1064" y="536" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="800" fill="#E86C2C">PRESENTED BY</text>
      <text x="1064" y="568" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" fill="#090C15">Nuno João Andrade</text>
      <text x="1064" y="596" font-family="Courier New, monospace" font-size="15" font-weight="700" fill="#05509B">www.linkedin.com/in/nuno-andrade-964b2416</text>

      <!-- Bottom Workshop Disclaimer Banner -->
      <rect x="64" y="672" width="1472" height="130" rx="16" fill="#FFF9EB" stroke="#F7C948" stroke-width="2"/>
      <rect x="64" y="672" width="10" height="130" rx="5" fill="#E86C2C"/>
      <text x="100" y="714" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" fill="#C85216">WORKSHOP GUIDE DISCLAIMER — NOT A REAL INVESTMENT VERDICT</text>
      <text x="100" y="748" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="500" fill="#25334A">This application is an educational workshop and rehearsal tool designed to help you practice and improve your project pitch.</text>
      <text x="100" y="778" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="500" fill="#25334A">All scores, roasts, and VC personas are simulated coaching aids and do not represent real funding decisions.</text>
    `
  },
  {
    filename: 'slide-02-speaker-nuno-andrade.png',
    hasSpeakerPhoto: true,
    kicker: 'MEET YOUR SPEAKER • PORTUGAL TECH WEEK',
    title: 'Nuno João Andrade',
    subtitle: 'Senior Developer & Cloud Platform Expert (GCP / AWS) • Google Developer Expert (GDE) for Cloud',
    bodySvg: `
      <!-- Left Photo Card Frame (Photo composited via sharp at x=92, y=282) -->
      <rect x="64" y="254" width="440" height="552" rx="22" fill="#F8FAFD" stroke="#B9D7F6" stroke-width="2"/>
      <rect x="64" y="254" width="440" height="8" rx="4" fill="#E86C2C"/>
      <rect x="114" y="598" width="340" height="36" rx="18" fill="#05509B"/>
      <text x="284" y="622" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" letter-spacing="0.8">GOOGLE DEVELOPER EXPERT • CLOUD</text>
      <text x="284" y="666" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="900" fill="#090C15">Nuno João Andrade</text>
      <text x="284" y="696" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="600" fill="#4D5E78">Senior Developer &amp; Cloud Platform Architect</text>
      <text x="284" y="726" text-anchor="middle" font-family="Courier New, monospace" font-size="16" font-weight="700" fill="#05509B">https://nja.dev</text>
      <rect x="94" y="746" width="380" height="42" rx="10" fill="#FFF3EC" stroke="#FAD0B8"/>
      <text x="284" y="772" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="800" fill="#C85216">10+ Years in Cloud, Node.js, C++ &amp; Applied AI</text>

      <!-- Right Bio & LinkedIn Details -->
      <rect x="536" y="254" width="1000" height="378" rx="22" fill="#FFFFFF" stroke="#D8E2F0" stroke-width="2"/>
      <text x="576" y="306" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="#05509B">Engineering Leadership Across Mission-Critical Industries</text>
      <text x="576" y="344" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="500" fill="#25334A">Over a decade building high-throughput backend architectures, cloud infrastructure (GCP &amp; AWS),</text>
      <text x="576" y="370" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="500" fill="#25334A">and multimodal AI systems that bridge developer productivity with production reliability.</text>

      <!-- 4 Industry Pillars -->
      <rect x="576" y="398" width="445" height="96" rx="14" fill="#F8FAFD" stroke="#D8E2F0"/>
      <rect x="576" y="398" width="6" height="96" rx="3" fill="#05509B"/>
      <text x="600" y="432" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" fill="#090C15">High-Volume Transaction Systems</text>
      <text x="600" y="460" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="500" fill="#4D5E78">Low-latency, fault-tolerant distributed pipelines</text>

      <rect x="1051" y="398" width="445" height="96" rx="14" fill="#F8FAFD" stroke="#D8E2F0"/>
      <rect x="1051" y="398" width="6" height="96" rx="3" fill="#E86C2C"/>
      <text x="1075" y="432" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" fill="#090C15">Energy Sector Platforms</text>
      <text x="1075" y="460" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="500" fill="#4D5E78">Smart grid telemetry &amp; cloud-native architectures</text>

      <rect x="576" y="512" width="445" height="96" rx="14" fill="#F8FAFD" stroke="#D8E2F0"/>
      <rect x="576" y="512" width="6" height="96" rx="3" fill="#0E9F6E"/>
      <text x="600" y="546" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" fill="#090C15">Gaming Industry Infrastructure</text>
      <text x="600" y="574" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="500" fill="#4D5E78">Real-time backend services &amp; high-concurrency scale</text>

      <rect x="1051" y="512" width="445" height="96" rx="14" fill="#F8FAFD" stroke="#D8E2F0"/>
      <rect x="1051" y="512" width="6" height="96" rx="3" fill="#D97706"/>
      <text x="1075" y="546" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" fill="#090C15">Computer Vision &amp; Applied AI</text>
      <text x="1075" y="574" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="500" fill="#4D5E78">Multimodal LLMs, edge inference &amp; agentic tooling</text>

      <!-- Prominent LinkedIn Callout Banner -->
      <rect x="536" y="654" width="1000" height="152" rx="22" fill="#05509B"/>
      <rect x="568" y="686" width="88" height="88" rx="18" fill="#FFFFFF"/>
      <text x="612" y="748" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="900" fill="#05509B">in</text>
      <text x="684" y="712" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800" fill="#F7C948" letter-spacing="1.5">CONNECT WITH NUNO JOÃO ANDRADE ON LINKEDIN</text>
      <text x="684" y="754" font-family="Courier New, monospace" font-size="30" font-weight="900" fill="#FFFFFF">www.linkedin.com/in/nuno-andrade-964b2416</text>
      <text x="684" y="786" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="600" fill="#BAE6FD">Website: https://nja.dev   •   GitHub: github.com/nuno-joao-andrade</text>
    `
  },
  {
    filename: 'slide-03-problem-disclaimer.png',
    kicker: '01 • THE STARTUP PITCH PROBLEM',
    title: 'Why Founders Lose Investors in the First 60 Seconds',
    subtitle: 'Three multimodal blind spots that text-only prompt wrappers completely miss',
    bodySvg: `
      <rect x="64" y="258" width="466" height="390" rx="18" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <rect x="64" y="258" width="466" height="8" rx="4" fill="#E86C2C"/>
      <text x="96" y="314" font-family="Arial" font-size="22" font-weight="800" fill="#E86C2C">1. Audio Delivery Blind Spots</text>
      <text x="96" y="356" font-family="Arial" font-size="18" fill="#25334A">• Rushing at 185+ WPM under stage stress</text>
      <text x="96" y="392" font-family="Arial" font-size="18" fill="#25334A">• Filler words ("um, like, basically")</text>
      <text x="96" y="428" font-family="Arial" font-size="18" fill="#25334A">• Skipping the Ask or Quantified Traction</text>
      <rect x="96" y="540" width="402" height="76" rx="12" fill="#FFF3EC"/>
      <text x="116" y="584" font-family="Courier New, monospace" font-size="16" font-weight="700" fill="#C85216">Solved in Step 2: Audio Narrative Critic</text>

      <rect x="567" y="258" width="466" height="390" rx="18" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <rect x="567" y="258" width="466" height="8" rx="4" fill="#05509B"/>
      <text x="599" y="314" font-family="Arial" font-size="22" font-weight="800" fill="#05509B">2. Audio vs. Slide Contradictions</text>
      <text x="599" y="356" font-family="Arial" font-size="18" fill="#25334A">• Saying "$20k MRR" while Slide 2 says "$18k"</text>
      <text x="599" y="392" font-family="Arial" font-size="18" fill="#25334A">• Saying "9x LTV:CAC" when chart shows 4.0x</text>
      <text x="599" y="428" font-family="Arial" font-size="18" fill="#25334A">• 112-word wall of text in 13pt font on Slide 1</text>
      <rect x="599" y="540" width="402" height="76" rx="12" fill="#F0F6FC"/>
      <text x="619" y="584" font-family="Courier New, monospace" font-size="16" font-weight="700" fill="#05509B">Solved in Step 3: Cross-Modal Vision</text>

      <rect x="1070" y="258" width="466" height="390" rx="18" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <rect x="1070" y="258" width="466" height="8" rx="4" fill="#0E9F6E"/>
      <text x="1102" y="314" font-family="Arial" font-size="22" font-weight="800" fill="#0E9F6E">3. Broken VC Unit Economics</text>
      <text x="1102" y="356" font-family="Arial" font-size="18" fill="#25334A">• Claiming $500B TAM for 5,000 customers</text>
      <text x="1102" y="392" font-family="Arial" font-size="18" fill="#25334A">• Negative payback periods ($450 CAC / $120 LTV)</text>
      <text x="1102" y="428" font-family="Arial" font-size="18" fill="#25334A">• Letting LLMs guess arithmetic instead of tools</text>
      <rect x="1102" y="540" width="402" height="76" rx="12" fill="#ECFDF5"/>
      <text x="1122" y="584" font-family="Courier New, monospace" font-size="16" font-weight="700" fill="#0E9F6E">Solved in Step 4: Deterministic Tools</text>

      <rect x="64" y="676" width="1472" height="124" rx="16" fill="#FFF9EB" stroke="#F7C948" stroke-width="2"/>
      <text x="100" y="722" font-family="Arial" font-size="20" font-weight="800" fill="#C85216">Built-In UI Workshop Disclaimer Dialog (#dialog-workshop-disclaimer)</text>
      <text x="100" y="760" font-family="Arial" font-size="17" fill="#25334A">Every user sees a clear modal stating this is a Portugal Tech Week workshop guide to practice your pitch — not a real VC investment result.</text>
    `
  },
  {
    filename: 'slide-04-architecture.png',
    kicker: '02 • END-TO-END ARCHITECTURE',
    title: 'Local Multimodal Architecture with Ollama & Gemma 4',
    subtitle: 'Zero external cloud dependencies — 100% local inference via http://127.0.0.1:11434',
    bodySvg: `
      <!-- Left Inputs -->
      <rect x="64" y="268" width="320" height="510" rx="18" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <text x="94" y="316" font-family="Arial" font-size="21" font-weight="800" fill="#05509B">1. Multimodal Inputs</text>
      <rect x="92" y="344" width="264" height="110" rx="12" fill="#FFFFFF" stroke="#B9D7F6"/>
      <text x="112" y="380" font-family="Arial" font-size="17" font-weight="800" fill="#090C15">Pitch Audio (WAV/WebM)</text>
      <text x="112" y="410" font-family="Courier New" font-size="14" fill="#4D5E78">16kHz PCM + Transcript</text>
      <rect x="92" y="476" width="264" height="110" rx="12" fill="#FFFFFF" stroke="#B9D7F6"/>
      <text x="112" y="512" font-family="Arial" font-size="17" font-weight="800" fill="#090C15">Slide Deck PNGs</text>
      <text x="112" y="542" font-family="Courier New" font-size="14" fill="#4D5E78">LOW (280) / HIGH (1120)</text>
      <rect x="92" y="608" width="264" height="110" rx="12" fill="#FFFFFF" stroke="#B9D7F6"/>
      <text x="112" y="644" font-family="Arial" font-size="17" font-weight="800" fill="#090C15">Structured Claims</text>
      <text x="112" y="674" font-family="Courier New" font-size="14" fill="#4D5E78">CAC, LTV, TAM, Font Pt</text>

      <!-- Center Pipeline -->
      <rect x="430" y="268" width="660" height="510" rx="18" fill="#F0F6FC" stroke="#05509B" stroke-width="2"/>
      <text x="464" y="316" font-family="Arial" font-size="22" font-weight="800" fill="#05509B">2. Local Ollama (gemma4:e2b) + Node.js Pipeline</text>
      <rect x="464" y="344" width="592" height="82" rx="12" fill="#FFFFFF" stroke="#D8E2F0"/>
      <text x="488" y="380" font-family="Arial" font-size="18" font-weight="800" fill="#E86C2C">Step 1 &amp; Step 2: Pitch Roast + Audio Narrative Critic</text>
      <text x="488" y="408" font-family="Courier New" font-size="15" fill="#25334A">clarityScore • WPM • fillerWordCount • 5-Stage Arc</text>

      <rect x="464" y="446" width="592" height="82" rx="12" fill="#FFFFFF" stroke="#D8E2F0"/>
      <text x="488" y="482" font-family="Arial" font-size="18" font-weight="800" fill="#05509B">Step 3: Multi-Slide Vision &amp; Contradiction Detector</text>
      <text x="488" y="510" font-family="Courier New" font-size="15" fill="#25334A">message.images: [slide1_b64, slide2_b64] vs Spoken Audio</text>

      <rect x="464" y="548" width="592" height="196" rx="12" fill="#0B1528"/>
      <text x="488" y="586" font-family="Arial" font-size="18" font-weight="800" fill="#F7C948">Step 4: Deterministic VC Tool Loop (shared/vc-tools.js)</text>
      <text x="488" y="622" font-family="Courier New" font-size="15" fill="#BAE6FD">• verify_unit_economics({ cac, ltv, grossMarginPct })</text>
      <text x="488" y="652" font-family="Courier New" font-size="15" fill="#BAE6FD">• check_tam_math({ targetCustomers, acvUsd, claimedTamUsd })</text>
      <text x="488" y="682" font-family="Courier New" font-size="15" fill="#BAE6FD">• score_slide_readability({ slideNumber, wordCount, fontSizePt })</text>
      <text x="488" y="712" font-family="Courier New" font-size="15" fill="#BAE6FD">• compute_fundability_index({ clarity, traction, moat, team })</text>

      <!-- Right Web UI -->
      <rect x="1136" y="268" width="400" height="510" rx="18" fill="#FFF9EB" stroke="#E86C2C" stroke-width="2"/>
      <text x="1168" y="316" font-family="Arial" font-size="21" font-weight="800" fill="#C85216">3. Step 5 PTW Arena UI</text>
      <text x="1168" y="362" font-family="Arial" font-size="17" font-weight="700" fill="#090C15">• Fundability Ring (0–100)</text>
      <text x="1168" y="402" font-family="Arial" font-size="17" font-weight="700" fill="#090C15">• VC Verdict Badge</text>
      <text x="1168" y="442" font-family="Arial" font-size="17" font-weight="700" fill="#090C15">• 20s Roast &amp; Improved Hook</text>
      <text x="1168" y="482" font-family="Arial" font-size="17" font-weight="700" fill="#090C15">• Cross-Modal Contradictions</text>
      <text x="1168" y="522" font-family="Arial" font-size="17" font-weight="700" fill="#090C15">• 5-Stage Narrative Checklist</text>
      <text x="1168" y="562" font-family="Arial" font-size="17" font-weight="700" fill="#090C15">• 4 VC Tool Verification Cards</text>
      <rect x="1168" y="618" width="336" height="120" rx="14" fill="#FFFFFF" stroke="#FAD0B8"/>
      <text x="1336" y="668" text-anchor="middle" font-family="Courier New" font-size="20" font-weight="800" fill="#05509B">localhost:3000</text>
      <text x="1336" y="704" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700" fill="#E86C2C">Portugal Tech Week Theme</text>
    `
  },
  {
    filename: 'slide-05-setup-ollama.png',
    kicker: '03 • ENVIRONMENT & OLLAMA SETUP',
    title: 'Zero-Key Local Setup with Ollama & gemma4:e2b',
    subtitle: 'Verify your local model, generate the test fixtures, and run the 11-test suite',
    bodySvg: `
      <rect x="64" y="264" width="720" height="516" rx="18" fill="#0B1528"/>
      <rect x="64" y="264" width="10" height="516" rx="5" fill="#E86C2C"/>
      <text x="104" y="316" font-family="Arial" font-size="20" font-weight="800" fill="#F7C948">Terminal Quickstart Commands</text>
      <text x="104" y="366" font-family="Courier New" font-size="18" fill="#94A3B8"># 1. Check Ollama &amp; gemma4:e2b model</text>
      <text x="104" y="398" font-family="Courier New" font-size="20" font-weight="700" fill="#F8FAFC">$ ollama list</text>
      <text x="104" y="430" font-family="Courier New" font-size="16" fill="#34D399">gemma4:e2b   7.2 GB   Q4_K_M (Multimodal)</text>

      <text x="104" y="486" font-family="Courier New" font-size="18" fill="#94A3B8"># 2. Install &amp; generate synthetic fixtures</text>
      <text x="104" y="518" font-family="Courier New" font-size="20" font-weight="700" fill="#F8FAFC">$ npm install</text>
      <text x="104" y="550" font-family="Courier New" font-size="20" font-weight="700" fill="#F8FAFC">$ npm run generate:fixtures</text>

      <text x="104" y="606" font-family="Courier New" font-size="18" fill="#94A3B8"># 3. Run full automated test suite</text>
      <text x="104" y="638" font-family="Courier New" font-size="20" font-weight="700" fill="#F8FAFC">$ npm test</text>
      <text x="104" y="670" font-family="Courier New" font-size="16" fill="#34D399">✔ 11 passing tests (0 vulnerabilities)</text>

      <rect x="820" y="264" width="716" height="516" rx="18" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <text x="856" y="318" font-family="Arial" font-size="22" font-weight="800" fill="#05509B">Shared Ollama Client (shared/ollama-client.js)</text>
      <text x="856" y="366" font-family="Arial" font-size="18" fill="#25334A">• Connects to http://127.0.0.1:11434/api/chat</text>
      <text x="856" y="406" font-family="Arial" font-size="18" fill="#25334A">• Default model: gemma4:e2b (override via OLLAMA_MODEL)</text>
      <text x="856" y="446" font-family="Arial" font-size="18" fill="#25334A">• Deterministic temperature: 0.1 for repeatable JSON</text>
      <text x="856" y="486" font-family="Arial" font-size="18" fill="#25334A">• parseJsonResponse() strips markdown fences safely</text>
      <text x="856" y="526" font-family="Arial" font-size="18" fill="#25334A">• Supports Base64 PNG arrays in message.images</text>
      <text x="856" y="566" font-family="Arial" font-size="18" fill="#25334A">• Supports multi-turn tool calling via tools[] parameter</text>
    `
  },
  {
    filename: 'slide-06-roadmap-fixtures.png',
    kicker: '04 • 5-STEP ROADMAP & TEST FIXTURES',
    title: '3 Synthetic Startup Pitches Ready Out-of-the-Box',
    subtitle: 'Generated locally in fixtures/ via scripts/generate-fixtures.js (WAV audio + 1600x900 PNG slides)',
    bodySvg: `
      <rect x="64" y="264" width="466" height="516" rx="18" fill="#ECFDF5" stroke="#0E9F6E" stroke-width="2"/>
      <text x="96" y="314" font-family="Arial" font-size="22" font-weight="800" fill="#0E9F6E">Pitch 01: Strong &amp; Aligned</text>
      <text x="96" y="348" font-family="Arial" font-size="18" font-weight="700" fill="#090C15">Lusitania Cloud AI</text>
      <text x="96" y="392" font-family="Courier New" font-size="16" fill="#25334A">• Audio: 145 WPM, 0 fillers</text>
      <text x="96" y="426" font-family="Courier New" font-size="16" fill="#25334A">• Traction: $48k MRR, 18% MoM</text>
      <text x="96" y="460" font-family="Courier New" font-size="16" fill="#25334A">• LTV:CAC: $5,400 / $600 = 9.0x</text>
      <text x="96" y="494" font-family="Courier New" font-size="16" fill="#25334A">• Slides: Clean 28pt typography</text>
      <text x="96" y="528" font-family="Courier New" font-size="16" fill="#25334A">• Contradictions: 0</text>
      <rect x="96" y="680" width="402" height="58" rx="10" fill="#0E9F6E"/>
      <text x="297" y="716" text-anchor="middle" font-family="Arial" font-size="18" font-weight="800" fill="#FFFFFF">Expected Verdict: STRONG PASS</text>

      <rect x="567" y="264" width="466" height="516" rx="18" fill="#FEF2F2" stroke="#E02424" stroke-width="2"/>
      <text x="599" y="314" font-family="Arial" font-size="22" font-weight="800" fill="#E02424">Pitch 02: Flawed &amp; Cluttered</text>
      <text x="599" y="348" font-family="Arial" font-size="18" font-weight="700" fill="#090C15">QuantumPet Blockchain</text>
      <text x="599" y="392" font-family="Courier New" font-size="16" fill="#25334A">• Audio: Filler-heavy ("um, like")</text>
      <text x="599" y="426" font-family="Courier New" font-size="16" fill="#25334A">• Traction: $1.2k MRR</text>
      <text x="599" y="460" font-family="Courier New" font-size="16" fill="#25334A">• LTV:CAC: $120 / $450 = 0.27x</text>
      <text x="599" y="494" font-family="Courier New" font-size="16" fill="#25334A">• Slide 1: 112 words in 13pt font</text>
      <text x="599" y="528" font-family="Courier New" font-size="16" fill="#25334A">• TAM: Claimed $500B vs $1.2M</text>
      <rect x="599" y="680" width="402" height="58" rx="10" fill="#E02424"/>
      <text x="800" y="716" text-anchor="middle" font-family="Arial" font-size="18" font-weight="800" fill="#FFFFFF">Expected Verdict: HARD PASS</text>

      <rect x="1070" y="264" width="466" height="516" rx="18" fill="#FFF9EB" stroke="#D97706" stroke-width="2"/>
      <text x="1102" y="314" font-family="Arial" font-size="22" font-weight="800" fill="#D97706">Pitch 03: Audio/Deck Mismatch</text>
      <text x="1102" y="348" font-family="Arial" font-size="18" font-weight="700" fill="#090C15">GreenGrid Portugal</text>
      <text x="1102" y="392" font-family="Courier New" font-size="16" fill="#25334A">• Audio says: "$20,000 MRR"</text>
      <text x="1102" y="426" font-family="Courier New" font-size="16" fill="#25334A">• Slide 2 shows: "$18,000 MRR"</text>
      <text x="1102" y="460" font-family="Courier New" font-size="16" fill="#25334A">• Audio says: "9x LTV:CAC"</text>
      <text x="1102" y="494" font-family="Courier New" font-size="16" fill="#25334A">• Slide 2 shows: "4.0x ($2.4k/$600)"</text>
      <text x="1102" y="528" font-family="Courier New" font-size="16" fill="#25334A">• Audio says 15% MoM vs 14% Slide</text>
      <rect x="1102" y="680" width="402" height="58" rx="10" fill="#D97706"/>
      <text x="1303" y="716" text-anchor="middle" font-family="Arial" font-size="18" font-weight="800" fill="#FFFFFF">Catches 3 Cross-Modal Conflicts</text>
    `
  },
  {
    filename: 'slide-07-step1-roast.png',
    kicker: '05 • STEP 1 (step-01-setup/index.js)',
    title: 'Step 1: The 20-Second Elevator Pitch Roast',
    subtitle: 'Structured JSON extraction with gemma4:e2b — zero markdown fluff, instant VC feedback',
    bodySvg: `
      <rect x="64" y="264" width="740" height="516" rx="18" fill="#0B1528"/>
      <text x="100" y="316" font-family="Arial" font-size="20" font-weight="800" fill="#F7C948">step-01-setup/index.js</text>
      <text x="100" y="366" font-family="Courier New" font-size="16" fill="#BAE6FD">export async function analyzeElevatorPitch(pitchText) {</text>
      <text x="100" y="400" font-family="Courier New" font-size="16" fill="#F8FAFC">  const response = await chatOllama({</text>
      <text x="100" y="434" font-family="Courier New" font-size="16" fill="#F8FAFC">    system: 'You are a blunt Partner at PTW Ventures...',</text>
      <text x="100" y="468" font-family="Courier New" font-size="16" fill="#F8FAFC">    messages: [{ role: 'user', content: prompt }],</text>
      <text x="100" y="502" font-family="Courier New" font-size="16" fill="#34D399">    format: 'json',</text>
      <text x="100" y="536" font-family="Courier New" font-size="16" fill="#34D399">    temperature: 0.1</text>
      <text x="100" y="570" font-family="Courier New" font-size="16" fill="#F8FAFC">  });</text>
      <text x="100" y="604" font-family="Courier New" font-size="16" fill="#F8FAFC">  return parseJsonResponse(response.message.content);</text>
      <text x="100" y="638" font-family="Courier New" font-size="16" fill="#BAE6FD">}</text>
      <text x="100" y="710" font-family="Courier New" font-size="18" font-weight="700" fill="#E86C2C">$ npm run step1</text>

      <rect x="836" y="264" width="700" height="516" rx="18" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <text x="872" y="316" font-family="Arial" font-size="22" font-weight="800" fill="#05509B">Guaranteed JSON Output Contract</text>
      <text x="872" y="368" font-family="Courier New" font-size="17" font-weight="700" fill="#090C15">• oneLineVerdict: string</text>
      <text x="872" y="410" font-family="Courier New" font-size="17" font-weight="700" fill="#090C15">• clarityScore: integer (1..10)</text>
      <text x="872" y="452" font-family="Courier New" font-size="17" font-weight="700" fill="#090C15">• roast: string (2-3 sentence critique)</text>
      <text x="872" y="494" font-family="Courier New" font-size="17" font-weight="700" fill="#090C15">• buzzwordsDetected: string[]</text>
      <text x="872" y="536" font-family="Courier New" font-size="17" font-weight="700" fill="#090C15">• improvedHook: string (1-sentence rewrite)</text>
      <rect x="872" y="582" width="628" height="160" rx="14" fill="#FFF3EC" stroke="#FAD0B8"/>
      <text x="896" y="620" font-family="Arial" font-size="16" font-weight="800" fill="#C85216">SAMPLE ROAST (QUANTUMPET BLOCKCHAIN)</text>
      <text x="896" y="654" font-family="Arial" font-size="16" fill="#25334A">"You crammed quantum, blockchain, and metaverse into</text>
      <text x="896" y="682" font-family="Arial" font-size="16" fill="#25334A">a dog collar pitch while losing $330 on every customer."</text>
    `
  },
  {
    filename: 'slide-08-step2-audio.png',
    kicker: '06 • STEP 2 (step-02-audio-critic/index.js)',
    title: 'Step 2: Audio Delivery & 5-Stage Narrative Arc',
    subtitle: 'Combining WAV header inspection, WPM/filler telemetry, and Gemma 4 narrative analysis',
    bodySvg: `
      <rect x="64" y="264" width="680" height="516" rx="18" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <text x="98" y="316" font-family="Arial" font-size="22" font-weight="800" fill="#05509B">Audio Delivery Telemetry (shared/media-utils.js)</text>
      <text x="98" y="366" font-family="Arial" font-size="18" fill="#25334A">• inspectWavFile(audioPath): Parses RIFF/WAV PCM header</text>
      <text x="98" y="406" font-family="Arial" font-size="18" fill="#25334A">• computeSpeechMetrics(transcript, durationSec):</text>
      <text x="124" y="444" font-family="Courier New" font-size="17" font-weight="700" fill="#05509B">- estimatedWpm (Target: 130–155 WPM)</text>
      <text x="124" y="480" font-family="Courier New" font-size="17" font-weight="700" fill="#E86C2C">- fillerWordCount ("um", "uh", "like", "basically")</text>
      <text x="124" y="516" font-family="Courier New" font-size="17" font-weight="700" fill="#0E9F6E">- pacingAssessment: OPTIMAL | TOO_FAST | TOO_SLOW</text>
      <text x="124" y="552" font-family="Courier New" font-size="17" font-weight="700" fill="#D97706">- monotoneRisk: LOW | MEDIUM | HIGH</text>
      <rect x="98" y="616" width="612" height="120" rx="14" fill="#0B1528"/>
      <text x="124" y="664" font-family="Courier New" font-size="20" font-weight="700" fill="#F7C948">$ npm run step2</text>
      <text x="124" y="702" font-family="Courier New" font-size="15" fill="#BAE6FD">Evaluates fixtures/pitch-01-strong.wav + transcript</text>

      <rect x="780" y="264" width="756" height="516" rx="18" fill="#F0F6FC" stroke="#B9D7F6" stroke-width="2"/>
      <text x="816" y="316" font-family="Arial" font-size="22" font-weight="800" fill="#05509B">The 5-Part VC Narrative Arc Checklist</text>
      <rect x="816" y="346" width="684" height="66" rx="10" fill="#FFFFFF" stroke="#D8E2F0"/>
      <text x="840" y="386" font-family="Arial" font-size="18" font-weight="800" fill="#0E9F6E">1. HOOK (STRONG) — Immediate 1-sentence value clarity</text>
      <rect x="816" y="426" width="684" height="66" rx="10" fill="#FFFFFF" stroke="#D8E2F0"/>
      <text x="840" y="466" font-family="Arial" font-size="18" font-weight="800" fill="#0E9F6E">2. PROBLEM (STRONG) — Quantified customer pain point</text>
      <rect x="816" y="506" width="684" height="66" rx="10" fill="#FFFFFF" stroke="#D8E2F0"/>
      <text x="840" y="546" font-family="Arial" font-size="18" font-weight="800" fill="#0E9F6E">3. SOLUTION (STRONG) — Clear product wedge &amp; moat</text>
      <rect x="816" y="586" width="684" height="66" rx="10" fill="#FFFFFF" stroke="#D8E2F0"/>
      <text x="840" y="626" font-family="Arial" font-size="18" font-weight="800" fill="#0E9F6E">4. TRACTION (STRONG) — MRR, MoM growth &amp; retention</text>
      <rect x="816" y="666" width="684" height="66" rx="10" fill="#FFFFFF" stroke="#D8E2F0"/>
      <text x="840" y="706" font-family="Arial" font-size="18" font-weight="800" fill="#0E9F6E">5. ASK (STRONG) — Round size + 18-month milestones</text>
    `
  },
  {
    filename: 'slide-09-vision-tokens.png',
    kicker: '07 • MULTIMODAL VISION ENGINEERING',
    title: 'Controlling Vision Token Budgets: 280 vs 1120 Tokens',
    subtitle: 'Resizing slide deck PNGs with Sharp in shared/media-utils.js before Base64 encoding',
    bodySvg: `
      <rect x="64" y="264" width="710" height="516" rx="18" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <rect x="64" y="264" width="710" height="8" rx="4" fill="#5AB6E8"/>
      <text x="100" y="320" font-family="Arial" font-size="24" font-weight="800" fill="#05509B">LOW Mode — ~280 Tokens / Slide</text>
      <text x="100" y="366" font-family="Courier New" font-size="18" font-weight="700" fill="#E86C2C">Bounding Box: 640 × 360 px</text>
      <text x="100" y="414" font-family="Arial" font-size="18" fill="#25334A">• Fastest time-to-first-token on laptop GPUs/CPUs</text>
      <text x="100" y="454" font-family="Arial" font-size="18" fill="#25334A">• Ideal for checking layout balance &amp; headline hierarchy</text>
      <text x="100" y="494" font-family="Arial" font-size="18" fill="#25334A">• Detects high-level visual clutter and wall-of-text slides</text>

      <rect x="826" y="264" width="710" height="516" rx="18" fill="#F0F6FC" stroke="#05509B" stroke-width="2"/>
      <rect x="826" y="264" width="710" height="8" rx="4" fill="#05509B"/>
      <text x="862" y="320" font-family="Arial" font-size="24" font-weight="800" fill="#05509B">HIGH Mode (Default) — ~1120 Tokens / Slide</text>
      <text x="862" y="366" font-family="Courier New" font-size="18" font-weight="700" fill="#0E9F6E">Bounding Box: 1280 × 720 px</text>
      <text x="862" y="414" font-family="Arial" font-size="18" fill="#25334A">• Preserves crisp OCR on 13pt–18pt financial tables</text>
      <text x="862" y="454" font-family="Arial" font-size="18" fill="#25334A">• Accurately reads MRR charts, CAC/LTV ratios &amp; footnotes</text>
      <text x="862" y="494" font-family="Arial" font-size="18" fill="#25334A">• Essential for cross-modal contradiction detection in Step 3</text>
      <rect x="862" y="556" width="638" height="176" rx="14" fill="#0B1528"/>
      <text x="890" y="602" font-family="Courier New" font-size="16" fill="#F7C948">prepareSlideImage(slidePath, 'HIGH')</text>
      <text x="890" y="640" font-family="Courier New" font-size="15" fill="#F8FAFC">sharp(buf).resize(1280, 720, { fit: 'inside' })</text>
      <text x="890" y="676" font-family="Courier New" font-size="15" fill="#34D399">  .png({ compressionLevel: 8 }).toBuffer()</text>
    `
  },
  {
    filename: 'slide-10-step3-contradictions.png',
    kicker: '08 • STEP 3 (step-03-deck-critic/index.js)',
    title: 'Step 3: Cross-Modal Audio + Slide Contradiction Detector',
    subtitle: 'Catching founders when their spoken pitch contradicts the numbers printed on their slides',
    bodySvg: `
      <rect x="64" y="264" width="1472" height="516" rx="18" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <text x="100" y="318" font-family="Arial" font-size="22" font-weight="800" fill="#05509B">Case Study: Pitch 03 (GreenGrid Portugal) — Spoken Pitch vs. Slide 2</text>

      <!-- Table Header -->
      <rect x="100" y="348" width="1400" height="54" rx="8" fill="#05509B"/>
      <text x="130" y="382" font-family="Arial" font-size="17" font-weight="800" fill="#FFFFFF">METRIC</text>
      <text x="430" y="382" font-family="Arial" font-size="17" font-weight="800" fill="#FFFFFF">SPOKEN IN AUDIO PITCH</text>
      <text x="860" y="382" font-family="Arial" font-size="17" font-weight="800" fill="#FFFFFF">SHOWN ON SLIDE 2 PNG</text>
      <text x="1260" y="382" font-family="Arial" font-size="17" font-weight="800" fill="#FFFFFF">SEVERITY</text>

      <!-- Row 1 -->
      <rect x="100" y="414" width="1400" height="82" rx="8" fill="#FEF2F2" stroke="#F8B4B4"/>
      <text x="130" y="462" font-family="Arial" font-size="19" font-weight="800" fill="#090C15">Monthly Recurring Revenue</text>
      <text x="430" y="462" font-family="Courier New" font-size="19" font-weight="700" fill="#E02424">"We are at $20,000 MRR"</text>
      <text x="860" y="462" font-family="Courier New" font-size="19" font-weight="700" fill="#05509B">Slide 2 Box: $18,000 MRR</text>
      <text x="1260" y="462" font-family="Arial" font-size="18" font-weight="800" fill="#E02424">HIGH (11% Overstated)</text>

      <!-- Row 2 -->
      <rect x="100" y="510" width="1400" height="82" rx="8" fill="#FEF2F2" stroke="#F8B4B4"/>
      <text x="130" y="558" font-family="Arial" font-size="19" font-weight="800" fill="#090C15">LTV : CAC Ratio</text>
      <text x="430" y="558" font-family="Courier New" font-size="19" font-weight="700" fill="#E02424">"LTV to CAC ratio is 9x"</text>
      <text x="860" y="558" font-family="Courier New" font-size="19" font-weight="700" fill="#05509B">$2,400 LTV / $600 CAC = 4.0x</text>
      <text x="1260" y="558" font-family="Arial" font-size="18" font-weight="800" fill="#E02424">CRITICAL (2.25x Off)</text>

      <!-- Row 3 -->
      <rect x="100" y="606" width="1400" height="82" rx="8" fill="#FFF9EB" stroke="#F7C948"/>
      <text x="130" y="654" font-family="Arial" font-size="19" font-weight="800" fill="#090C15">MoM Growth Rate</text>
      <text x="430" y="654" font-family="Courier New" font-size="19" font-weight="700" fill="#D97706">"Growing 15% month-over-month"</text>
      <text x="860" y="654" font-family="Courier New" font-size="19" font-weight="700" fill="#05509B">Slide 2 Table: 14% MoM</text>
      <text x="1260" y="654" font-family="Arial" font-size="18" font-weight="800" fill="#D97706">MEDIUM (Mismatch)</text>

      <text x="100" y="742" font-family="Courier New" font-size="18" font-weight="700" fill="#05509B">Run it live: $ npm run step3</text>
    `
  },
  {
    filename: 'slide-11-vc-tools.png',
    kicker: '09 • DETERMINISTIC VC TOOLS (shared/vc-tools.js)',
    title: '4 Deterministic VC Audit Calculators',
    subtitle: 'Why we delegate startup arithmetic to pure Node.js functions instead of LLM token prediction',
    bodySvg: `
      <rect x="64" y="264" width="716" height="242" rx="16" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <text x="96" y="310" font-family="Courier New" font-size="20" font-weight="800" fill="#05509B">1. verify_unit_economics(args)</text>
      <text x="96" y="350" font-family="Arial" font-size="17" fill="#25334A">• Computes exact ltvCacRatio = ltv / cac</text>
      <text x="96" y="384" font-family="Arial" font-size="17" fill="#25334A">• Classifies ELITE_SAAS (≥5x), HEALTHY (≥3x), UNSUSTAINABLE (&lt;1.5x)</text>
      <text x="96" y="418" font-family="Arial" font-size="17" fill="#25334A">• Flags CAC_EXCEEDS_LTV and PAYBACK_TOO_LONG (&gt;18m)</text>

      <rect x="820" y="264" width="716" height="242" rx="16" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <text x="852" y="310" font-family="Courier New" font-size="20" font-weight="800" fill="#E86C2C">2. check_tam_math(args)</text>
      <text x="852" y="350" font-family="Arial" font-size="17" fill="#25334A">• Computes bottomUpTamUsd = targetCustomers * acvUsd</text>
      <text x="852" y="384" font-family="Arial" font-size="17" fill="#25334A">• Compares against founder's claimedTamUsd</text>
      <text x="852" y="418" font-family="Arial" font-size="17" fill="#25334A">• Flags INFLATED_TAM when overstatement ratio &gt; 1.5x</text>

      <rect x="64" y="538" width="716" height="242" rx="16" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <text x="96" y="584" font-family="Courier New" font-size="20" font-weight="800" fill="#0E9F6E">3. score_slide_readability(args)</text>
      <text x="96" y="624" font-family="Arial" font-size="17" fill="#25334A">• Evaluates wordCount, dataPointsCount, fontSizePt</text>
      <text x="96" y="658" font-family="Arial" font-size="17" fill="#25334A">• Flags WALL_OF_TEXT (&gt;75 words) &amp; FONT_TOO_SMALL (&lt;18pt)</text>
      <text x="96" y="692" font-family="Arial" font-size="17" fill="#25334A">• Produces 1–10 readabilityScore per slide</text>

      <rect x="820" y="538" width="716" height="242" rx="16" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <text x="852" y="584" font-family="Courier New" font-size="20" font-weight="800" fill="#D97706">4. compute_fundability_index(args)</text>
      <text x="852" y="624" font-family="Arial" font-size="17" fill="#25334A">• Weighted rubric: Traction 30%, Clarity 25%, Moat 25%, Team 20%</text>
      <text x="852" y="658" font-family="Arial" font-size="17" fill="#25334A">• Outputs 0–100 fundabilityIndex</text>
      <text x="852" y="692" font-family="Arial" font-size="17" fill="#25334A">• Maps to STRONG PASS | SOFT PASS | BORDERLINE | HARD PASS</text>
    `
  },
  {
    filename: 'slide-12-step4-vc-judge.png',
    kicker: '10 • STEP 4 (step-04-vc-judge/index.js)',
    title: 'Step 4: Multi-Turn VC Tool-Calling Loop',
    subtitle: 'Combining Gemma 4 tool selection with guaranteed deterministic fallback execution',
    bodySvg: `
      <rect x="64" y="264" width="1472" height="516" rx="18" fill="#0B1528"/>
      <rect x="64" y="264" width="10" height="516" rx="5" fill="#F7C948"/>
      <text x="108" y="320" font-family="Arial" font-size="22" font-weight="800" fill="#F7C948">Multi-Turn Agentic Loop in step-04-vc-judge/index.js</text>

      <text x="108" y="376" font-family="Courier New" font-size="17" fill="#BAE6FD">for (let turn = 0; turn &lt; maxTurns; turn++) {</text>
      <text x="108" y="412" font-family="Courier New" font-size="17" fill="#F8FAFC">  const response = await chatOllama({ messages, tools: VC_TOOL_DECLARATIONS, temperature: 0.1 });</text>
      <text x="108" y="448" font-family="Courier New" font-size="17" fill="#F8FAFC">  messages.push(response.message);</text>
      <text x="108" y="484" font-family="Courier New" font-size="17" fill="#34D399">  if (!response.message.tool_calls?.length) break; // Final Investment Memo reached</text>
      <text x="108" y="520" font-family="Courier New" font-size="17" fill="#F8FAFC">  for (const call of response.message.tool_calls) {</text>
      <text x="108" y="556" font-family="Courier New" font-size="17" fill="#F7C948">    const output = executeVcTool(call.function.name, call.function.arguments);</text>
      <text x="108" y="592" font-family="Courier New" font-size="17" fill="#F8FAFC">    messages.push({ role: 'tool', content: JSON.stringify(output) });</text>
      <text x="108" y="628" font-family="Courier New" font-size="17" fill="#F8FAFC">  }</text>
      <text x="108" y="664" font-family="Courier New" font-size="17" fill="#BAE6FD">}</text>

      <text x="108" y="732" font-family="Courier New" font-size="20" font-weight="700" fill="#E86C2C">$ npm run step4   # Runs full VC audit on Pitch 01, 02, or 03</text>
    `
  },
  {
    filename: 'slide-13-step5-arena-ui.png',
    kicker: '11 • STEP 5 (step-05-arena/)',
    title: 'Step 5: Portugal Tech Week Pitch Critic Arena UI',
    subtitle: 'Full-stack Express + React application styled with authentic Portugal Tech Week assets',
    bodySvg: `
      <rect x="64" y="264" width="710" height="516" rx="18" fill="#F8FAFD" stroke="#D8E2F0" stroke-width="2"/>
      <rect x="64" y="264" width="710" height="8" rx="4" fill="#E86C2C"/>
      <text x="100" y="318" font-family="Arial" font-size="22" font-weight="800" fill="#05509B">Left Column: Founder Pitch Input Card</text>
      <text x="100" y="366" font-family="Arial" font-size="18" fill="#25334A">• 3 Preset Scenario Buttons (#btn-load-sample-1..3)</text>
      <text x="100" y="406" font-family="Arial" font-size="18" fill="#25334A">• Live Browser Microphone Recorder (#btn-record-toggle)</text>
      <text x="100" y="446" font-family="Arial" font-size="18" fill="#25334A">• Audio File Upload &amp; Preview Player (#audio-preview-player)</text>
      <text x="100" y="486" font-family="Arial" font-size="18" fill="#25334A">• Multi-Slide PNG/JPG Drag-and-Drop (#dropzone-slides)</text>
      <text x="100" y="526" font-family="Arial" font-size="18" fill="#25334A">• Vision Token Resolution Toggle (LOW 280 / HIGH 1120)</text>
      <text x="100" y="566" font-family="Arial" font-size="18" fill="#25334A">• Primary CTA (#btn-analyze-pitch)</text>

      <rect x="826" y="264" width="710" height="516" rx="18" fill="#F0F6FC" stroke="#05509B" stroke-width="2"/>
      <rect x="826" y="264" width="710" height="8" rx="4" fill="#05509B"/>
      <text x="862" y="318" font-family="Arial" font-size="22" font-weight="800" fill="#05509B">Right Column: Verdict, Roast &amp; Audit Cards</text>
      <text x="862" y="366" font-family="Arial" font-size="18" fill="#25334A">• Fundability Score Ring (0–100) + VC Verdict Badge</text>
      <text x="862" y="406" font-family="Arial" font-size="18" fill="#25334A">• 20-Second Elevator Roast + Improved Opening Hook</text>
      <text x="862" y="446" font-family="Arial" font-size="18" fill="#25334A">• Cross-Modal Contradiction Alert Cards</text>
      <text x="862" y="486" font-family="Arial" font-size="18" fill="#25334A">• 5-Stage Narrative Arc + Audio WPM &amp; Filler Pills</text>
      <text x="862" y="526" font-family="Arial" font-size="18" fill="#25334A">• 4 Deterministic VC Tool Verification Badges</text>
      <text x="862" y="566" font-family="Arial" font-size="18" fill="#25334A">• Interactive Workshop Disclaimer Modal (#dialog-workshop-disclaimer)</text>
    `
  },
  {
    filename: 'slide-14-recap.png',
    kicker: '12 • WORKSHOP WRAP-UP & CHEAT SHEET',
    title: 'Thank You, Portugal Tech Week! Keep Building.',
    subtitle: 'Full command reference and where to connect with Nuno João Andrade',
    bodySvg: `
      <rect x="64" y="264" width="760" height="516" rx="18" fill="#0B1528"/>
      <text x="100" y="318" font-family="Arial" font-size="22" font-weight="800" fill="#F7C948">Complete Workshop Command Reference</text>
      <text x="100" y="372" font-family="Courier New" font-size="18" fill="#34D399">$ npm test</text>
      <text x="340" y="372" font-family="Arial" font-size="16" fill="#CBD5E1"># Run all 11 automated tests</text>
      <text x="100" y="418" font-family="Courier New" font-size="18" fill="#F8FAFC">$ npm run step1</text>
      <text x="340" y="418" font-family="Arial" font-size="16" fill="#CBD5E1"># Step 1: 20s Elevator Pitch Roast</text>
      <text x="100" y="464" font-family="Courier New" font-size="18" fill="#F8FAFC">$ npm run step2</text>
      <text x="340" y="464" font-family="Arial" font-size="16" fill="#CBD5E1"># Step 2: Audio &amp; Narrative Arc Critic</text>
      <text x="100" y="510" font-family="Courier New" font-size="18" fill="#F8FAFC">$ npm run step3</text>
      <text x="340" y="510" font-family="Arial" font-size="16" fill="#CBD5E1"># Step 3: Multi-Slide Vision Contradictions</text>
      <text x="100" y="556" font-family="Courier New" font-size="18" fill="#F8FAFC">$ npm run step4</text>
      <text x="340" y="556" font-family="Arial" font-size="16" fill="#CBD5E1"># Step 4: Deterministic VC Tool Judge</text>
      <text x="100" y="602" font-family="Courier New" font-size="18" fill="#F7C948">$ npm run step5</text>
      <text x="340" y="602" font-family="Arial" font-size="16" fill="#CBD5E1"># Step 5: Launch Web Arena (:3000)</text>
      <text x="100" y="648" font-family="Courier New" font-size="18" fill="#5AB6E8">$ npm run slides</text>
      <text x="340" y="648" font-family="Arial" font-size="16" fill="#CBD5E1"># Open Workshop Presentation Deck</text>

      <rect x="860" y="264" width="676" height="516" rx="18" fill="#05509B"/>
      <text x="900" y="330" font-family="Arial" font-size="16" font-weight="800" fill="#F7C948" letter-spacing="1.5">STAY IN TOUCH WITH YOUR SPEAKER</text>
      <text x="900" y="388" font-family="Arial" font-size="38" font-weight="900" fill="#FFFFFF">Nuno João Andrade</text>
      <text x="900" y="430" font-family="Arial" font-size="19" font-weight="600" fill="#BAE6FD">Senior Developer &amp; Cloud Platform Expert (GCP / AWS)</text>
      <text x="900" y="462" font-family="Arial" font-size="19" font-weight="600" fill="#BAE6FD">Google Developer Expert (GDE) for Cloud</text>

      <rect x="900" y="508" width="596" height="110" rx="16" fill="#FFFFFF"/>
      <text x="928" y="546" font-family="Arial" font-size="14" font-weight="800" fill="#E86C2C" letter-spacing="1.2">LINKEDIN PROFILE</text>
      <text x="928" y="588" font-family="Courier New" font-size="23" font-weight="900" fill="#05509B">www.linkedin.com/in/nuno-andrade-964b2416</text>

      <text x="900" y="676" font-family="Courier New" font-size="20" font-weight="700" fill="#FFFFFF">Website: https://nja.dev</text>
      <text x="900" y="716" font-family="Courier New" font-size="20" font-weight="700" fill="#BAE6FD">GitHub:  github.com/nuno-joao-andrade</text>
    `
  }
];

export async function generateWorkshopSlides() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  // Prepare PTW Black Logo for header (top-left of every slide)
  const logoPath = path.join(ASSETS_DIR, 'ptw-logo-black.png');
  const logoBuffer = await sharp(logoPath)
    .resize(210, 46, { fit: 'inside' })
    .png()
    .toBuffer();

  // Prepare rounded speaker photo for Slide 2
  const avatarPath = path.join(ASSETS_DIR, 'avatar_photo.jpeg');
  const avatarMask = Buffer.from(
    `<svg width="280" height="280"><rect x="0" y="0" width="280" height="280" rx="28" ry="28" fill="#fff"/></svg>`
  );
  const avatarBuffer = await sharp(avatarPath)
    .resize(280, 280, { fit: 'cover' })
    .composite([{ input: avatarMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const generatedFiles = [];

  for (let i = 0; i < SLIDE_DEFINITIONS.length; i++) {
    const def = SLIDE_DEFINITIONS[i];
    const svg = baseSlideSvg({
      slideNumber: i + 1,
      totalSlides: SLIDE_DEFINITIONS.length,
      kicker: def.kicker,
      title: def.title,
      subtitle: def.subtitle,
      bodySvg: def.bodySvg
    });

    const composites = [{ input: logoBuffer, left: 64, top: 24 }];
    if (def.hasSpeakerPhoto) {
      composites.push({ input: avatarBuffer, left: 144, top: 294 });
    }

    const outPath = path.join(IMAGES_DIR, def.filename);
    await sharp(Buffer.from(svg))
      .composite(composites)
      .png({ compressionLevel: 8 })
      .toFile(outPath);

    generatedFiles.push(outPath);
  }

  return generatedFiles;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = await generateWorkshopSlides();
  console.log(`Generated ${files.length} Portugal Tech Week white-background slides in slides/images/:`);
  for (const f of files) {
    console.log(` - ${path.relative(ROOT_DIR, f)}`);
  }
}
