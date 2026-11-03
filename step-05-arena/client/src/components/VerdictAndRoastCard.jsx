import React from 'react';

export function VerdictAndRoastCard({
  verdictData,
  isStreaming,
  streamStageMessage,
  founderName
}) {
  if (!verdictData && !isStreaming) {
    return (
      <section
        id="verdict-section"
        className="ptw-card p-6 sm:p-7 flex flex-col items-center justify-center text-center min-h-[210px]"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <img
            src="/ptw/tile-sky.svg"
            alt=""
            className="w-7 h-7"
            aria-hidden="true"
          />
          <span className="font-display text-xs font-extrabold uppercase tracking-widest px-3.5 py-1 rounded bg-[#283CC8] text-[#F9E11B]">
            PORTUGAL TECH WEEK • AI INVESTMENT COMMITTEE
          </span>
          <img
            src="/ptw/tile-yellow.svg"
            alt=""
            className="w-7 h-7"
            aria-hidden="true"
          />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white mb-2">
          IC Verdict &amp; Live Founder Roast
        </h2>
        <p className="text-sm text-[#ACACAC] max-w-xl leading-relaxed">
          Select one of the Portugal Tech Week demo presets on the left — or record a live 30-second spoken pitch and upload up to 3 slide images — then click{' '}
          <span className="text-[#F9E11B] font-display font-bold uppercase">
            Analyze Pitch with Gemma 4
          </span>
          .
        </p>
      </section>
    );
  }

  if (isStreaming && !verdictData) {
    return (
      <section
        id="verdict-section"
        className="ptw-card p-6 sm:p-7 flex flex-col justify-center min-h-[210px]"
        style={{ borderColor: '#FEFF00' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="w-3.5 h-3.5 rounded-full bg-[#FEFF00] animate-ping inline-block" />
          <span className="font-display text-sm font-extrabold text-[#FEFF00] uppercase tracking-wider">
            LOCAL OLLAMA MULTIMODAL INFERENCE IN PROGRESS
          </span>
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-extrabold uppercase text-white mb-1.5">
          {streamStageMessage || 'Auditing spoken pitch audio & slide deck visuals...'}
        </h2>
        <p className="text-xs text-[#4E9DE0] font-mono-tech">
          Streaming &lt;think&gt; reasoning trace and deterministic VC tool executions below in real time.
        </p>
      </section>
    );
  }

  const verdict = verdictData.verdict || 'DIG_DEEPER';
  const badgeStyle =
    verdict === 'INVEST'
      ? { bg: '#61CE70', text: '#131313', border: '#61CE70' }
      : verdict === 'HARD_PASS'
      ? { bg: '#FF3B5C', text: '#FFFFFF', border: '#FF3B5C' }
      : { bg: '#FFC017', text: '#131313', border: '#FFC017' };

  return (
    <section
      id="verdict-section"
      className="ptw-card p-6 sm:p-7 transition-all"
      style={{ borderColor: badgeStyle.border }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-[#283CC8]">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <span
              className="font-display text-sm font-extrabold uppercase tracking-wider px-4 py-1 rounded-[5px]"
              style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
            >
              {verdict.replace('_', ' ')}
            </span>
            <span className="font-display text-xl sm:text-2xl font-extrabold uppercase text-white">
              {verdictData.startupName}
            </span>
            {founderName && (
              <span className="font-display text-sm font-bold text-[#4E9DE0]">
                • {founderName}
              </span>
            )}
          </div>
          <p className="font-mono-tech text-xs text-[#4E9DE0]">
            WORKSHOP GUIDE ONLY • JUST A GUIDE TO BETTER PITCH YOUR PROJECT (NOT THE REAL RESULT)
          </p>
        </div>

        <div className="text-right bg-[#08071A] border border-[#283CC8] rounded-xl px-4 py-2">
          <div className="font-display text-[11px] font-bold text-[#4E9DE0] uppercase tracking-wider">
            OVERALL IC SCORE
          </div>
          <div
            className="font-display text-4xl font-extrabold leading-none"
            style={{ color: badgeStyle.bg }}
          >
            {verdictData.overallIcScore}
            <span className="text-lg text-[#ACACAC] font-normal">/100</span>
          </div>
        </div>
      </div>

      {/* Live VC Roast */}
      <div className="rounded-xl bg-[#08071A] border-2 border-[#283CC8] p-4 mb-4">
        <div className="flex items-center gap-2 font-display text-xs font-extrabold text-[#FFC017] uppercase tracking-wider mb-1.5">
          <img
            src="/ptw/tile-orange.svg"
            alt=""
            className="w-4 h-4"
            aria-hidden="true"
          />
          <span>🎤 LIVE INVESTMENT COMMITTEE ROAST</span>
        </div>
        <blockquote className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
          &ldquo;{verdictData.liveRoast}&rdquo;
        </blockquote>
      </div>

      {/* Top Fix Recommendation */}
      <div className="flex items-start gap-2.5 text-sm bg-[#08071A]/70 border border-[#4E9DE0]/40 rounded-lg px-3.5 py-2.5">
        <span className="font-display font-extrabold text-[#F9E11B] shrink-0 uppercase">
          🛠️ Top Fix Before Stage:
        </span>
        <span className="text-white font-medium">{verdictData.topFixRecommendation}</span>
      </div>
    </section>
  );
}
