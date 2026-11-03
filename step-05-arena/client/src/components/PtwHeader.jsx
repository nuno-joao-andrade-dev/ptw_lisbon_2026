import React from 'react';

const PTW_CITIES = [
  'LISBOA',
  'PORTO',
  'BRAGA',
  'COIMBRA',
  'AVEIRO',
  'FARO',
  'ÉVORA',
  'GUIMARÃES',
  'FUNCHAL',
  'AÇORES',
  'AMARANTE',
  'BEJA',
  'COVILHÃ',
  'FUNDÃO',
  'LEIRIA',
  'SETÚBAL',
  'VIANA DO CASTELO',
  'VISEU'
];

function GoldStar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
    </svg>
  );
}

export function PtwHeader({ ollamaStatus, onResetSession, onOpenWorkshopDialog }) {
  const isOnline = ollamaStatus?.online;

  return (
    <>
      {/* 1. OFFICIAL PORTUGAL TECH WEEK STICKY WHITE TOP NAVBAR (post-730.css) */}
      <nav className="ptw-navbar w-full px-4 sm:px-8 flex items-center justify-between gap-4">
        <div className="max-w-[1360px] w-full mx-auto flex items-center justify-between gap-4">
          {/* Left: Official Black PTW Horizontal Logo */}
          <a
            href="#top"
            className="flex items-center gap-3 shrink-0"
            title="Portugal Tech Week — Pitch Critic Arena"
          >
            <img
              src="/ptw/ptw-logo-black.png"
              alt="Portugal Tech Week"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </a>

          {/* Center: Official Sofia Sans 20px Weight-600 Nav Items */}
          <div className="hidden xl:flex items-center gap-7">
            <a href="#pitch-input-section" className="ptw-nav-link">
              Pitch Studio
            </a>
            <a href="#verdict-section" className="ptw-nav-link">
              IC Verdict &amp; Roast
            </a>
            <a href="#audit-section" className="ptw-nav-link">
              Contradictions &amp; VC Tools
            </a>
            <a
              id="btn-open-workshop-slides"
              href="/slides/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="ptw-nav-link"
              title="Open Portugal Tech Week Workshop Presentation Slides"
            >
              📊 Workshop Slides
            </a>
            <button
              id="btn-open-workshop-dialog"
              type="button"
              onClick={onOpenWorkshopDialog}
              className="font-display text-base font-bold text-[#283CC8] hover:underline cursor-pointer"
            >
              ℹ️ Workshop Notice
            </button>
          </div>

          {/* Right: Local Ollama Status Pill + Reset Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenWorkshopDialog}
              className="xl:hidden font-display text-xs font-bold px-2.5 py-1.5 rounded bg-[#F9E11B] text-[#131313] cursor-pointer"
              title="View Workshop Disclaimer"
            >
              ℹ️ Workshop Guide
            </button>

            <div
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#F4F4F6] border border-[#131313]/15"
              title={
                ollamaStatus?.capabilities?.length
                  ? `Capabilities: ${ollamaStatus.capabilities.join(', ')} (${ollamaStatus?.host || 'http://127.0.0.1:11434'})`
                  : 'Local Ollama Server Status'
              }
            >
              <span
                className="w-6 h-6 rounded-full bg-[#131313] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: isOnline ? '#61CE70' : '#FF3B5C' }}
                />
              </span>
              <span className="font-display text-sm sm:text-base font-bold text-[#131313]">
                {isOnline ? `Ollama: ${ollamaStatus.model}` : 'Ollama Offline'}
              </span>
              <span className="font-mono-tech text-[11px] text-[#131313]/70 hidden md:inline">
                127.0.0.1:11434
              </span>
            </div>

            <button
              id="btn-reset-session"
              type="button"
              onClick={onResetSession}
              className="ptw-btn-primary !text-sm sm:!text-base !py-2 !px-4 cursor-pointer"
            >
              ↺ Reset / Custom Pitch
            </button>
          </div>
        </div>
      </nav>

      {/* 2. OFFICIAL PORTUGAL TECH WEEK HERO BANNER & AZULEJO TILE STRIP (post-2205.css) */}
      <header id="top" className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-5 pb-4">
        {/* Persistent Workshop Guide Notice Bar */}
        <div
          id="banner-workshop-disclaimer"
          className="mb-3.5 rounded-xl bg-[#0F0D30] border-2 border-[#FEFF00] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white">
            <span className="font-display font-extrabold uppercase px-2.5 py-0.5 rounded bg-[#FEFF00] text-[#131313] shrink-0">
              ⚠️ WORKSHOP GUIDE
            </span>
            <span>
              This is an educational <strong>Portugal Tech Week workshop</strong> and is{' '}
              <strong className="text-[#F9E11B]">
                just a guide to better pitch your project — this isn&apos;t the real result
              </strong>
              .
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenWorkshopDialog}
            className="font-display text-xs font-extrabold uppercase text-[#4E9DE0] hover:text-[#F9E11B] underline cursor-pointer shrink-0"
          >
            Read Full Notice ▸
          </button>
        </div>

        <div className="ptw-hero-banner">
          {/* Decorative Azulejo Pixel Frame Top Strip */}
          <div
            className="h-2.5 w-full bg-repeat-x bg-top opacity-90"
            style={{
              backgroundImage: "url('/ptw/hero-frame.png')",
              backgroundSize: 'cover'
            }}
          />

          <div className="p-5 sm:p-7 lg:px-9 lg:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Hero Display Title (14655df9) */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#283CC8] text-white font-display text-xs sm:text-sm font-bold uppercase tracking-wider mb-2.5">
                  <span>🇵🇹 Official Workshop Arena</span>
                  <span className="text-[#F9E11B]">•</span>
                  <span>Gemma 4 + Local Ollama</span>
                </div>
                <h1 className="ptw-hero-title text-4xl sm:text-5xl xl:text-[62px]">
                  PORTUGAL TECH WEEK
                </h1>
                <p className="font-display text-lg sm:text-2xl font-bold text-[#4E9DE0] uppercase tracking-wide mt-1">
                  Multimodal Pitch &amp; Deck Critic • AI Investment Committee
                </p>
              </div>

              {/* Right Hero Tagline Stack (4034b492 / 246419ea / 371db979 / 672acd7) */}
              <div className="lg:col-span-5 lg:text-right flex flex-col lg:items-end justify-center">
                <div className="font-display text-2xl sm:text-3xl xl:text-[36px] font-extrabold uppercase leading-tight text-white">
                  BUILDING VISION
                </div>
                <div className="font-display text-xl sm:text-2xl xl:text-[30px] font-normal uppercase leading-tight text-white">
                  SHAPING THE FUTURE
                </div>
                <div className="font-display text-base sm:text-xl font-bold uppercase tracking-wider text-[#F9E11B] mt-1">
                  6–15 NOV 2026 • 100% ON-DEVICE PRIVACY
                </div>
              </div>
            </div>

            {/* 3 Official Portuguese Azulejo Tile Counters (63b1efc4) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5 pt-5 border-t border-[#283CC8]/60">
              <div className="flex items-center gap-3.5 bg-[#08071A]/80 border border-[#283CC8]/70 rounded-xl px-4 py-2.5">
                <img
                  src="/ptw/tile-sky.svg"
                  alt="Portuguese Azulejo Sky Tile"
                  className="w-11 h-11 shrink-0"
                />
                <div>
                  <div className="font-display text-xl font-extrabold text-white leading-none">
                    16kHz Mono WAV
                  </div>
                  <div className="font-display text-sm font-medium text-[#4D9DE0]">
                    Native Audio Pitch Ingestion
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-[#08071A]/80 border border-[#283CC8]/70 rounded-xl px-4 py-2.5">
                <img
                  src="/ptw/tile-orange.svg"
                  alt="Portuguese Azulejo Orange Tile"
                  className="w-11 h-11 shrink-0"
                />
                <div>
                  <div className="font-display text-xl font-extrabold text-white leading-none">
                    280 vs 1,120 Tokens
                  </div>
                  <div className="font-display text-sm font-medium text-[#F26419]">
                    Variable Slide Vision Budgets
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-[#08071A]/80 border border-[#283CC8]/70 rounded-xl px-4 py-2.5">
                <img
                  src="/ptw/tile-yellow.svg"
                  alt="Portuguese Azulejo Yellow Tile"
                  className="w-11 h-11 shrink-0"
                />
                <div>
                  <div className="font-display text-xl font-extrabold text-white leading-none">
                    4 Native VC Tools
                  </div>
                  <div className="font-display text-sm font-medium text-[#F9E11B]">
                    Deterministic Math &amp; BS Audit
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. OFFICIAL PORTUGAL TECH WEEK SCROLLING CITIES TICKER (STYLE 15 & STYLE 19) */}
          <div className="city-ticker" aria-label="Portugal Tech Week Host Cities">
            <div className="ticker-track">
              {[0, 1].map((loopIdx) => (
                <div key={loopIdx} className="ticker-content">
                  {PTW_CITIES.map((city) => (
                    <span key={`${loopIdx}-${city}`}>
                      {city}
                      <GoldStar />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
