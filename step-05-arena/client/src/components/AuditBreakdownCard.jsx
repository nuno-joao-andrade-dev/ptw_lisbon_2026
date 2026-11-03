import React, { useState } from 'react';

export function AuditBreakdownCard({
  verdictData,
  liveToolCalls,
  thinkingTrace,
  isStreaming
}) {
  const [showThinking, setShowThinking] = useState(true);

  const contradictions = verdictData?.contradictions || [];
  const toolAudits = verdictData?.toolAudits || liveToolCalls || [];
  const narrative = verdictData?.narrative || null;
  const slideAudits = verdictData?.slideAudits || [];

  const narrativeBeats = narrative
    ? [
        { key: 'hook', label: 'Hook', data: narrative.hook },
        { key: 'problem', label: 'Problem', data: narrative.problem },
        { key: 'solution', label: 'Solution', data: narrative.solution },
        { key: 'traction', label: 'Traction', data: narrative.traction },
        { key: 'ask', label: 'The Ask', data: narrative.ask }
      ]
    : [];

  return (
    <section
      id="audit-section"
      className="ptw-card p-5 sm:p-6 flex flex-col gap-5"
    >
      {/* 1. Cross-Modal Contradictions */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/ptw/tile-orange.svg"
              alt=""
              className="w-6 h-6 shrink-0"
              aria-hidden="true"
            />
            <h3 className="font-display text-lg font-extrabold uppercase tracking-wide text-white">
              1. Cross-Modal Contradictions (Audio vs. Slides)
            </h3>
          </div>
          <span className="font-display text-xs font-bold uppercase text-[#4E9DE0]">
            {contradictions.length} Discrepancies
          </span>
        </div>

        {contradictions.length === 0 ? (
          <div className="rounded-xl bg-[#08071A] border-2 border-[#283CC8]/70 p-4 font-display text-sm font-semibold text-[#ACACAC]">
            {verdictData
              ? '✓ Zero contradictions detected — spoken claims match slide deck evidence.'
              : 'Waiting for multimodal contradiction audit...'}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contradictions.map((c, idx) => {
              const sevColor =
                c.severity === 'FATAL_BS'
                  ? '#FF3B5C'
                  : c.severity === 'MAJOR'
                  ? '#FF7400'
                  : '#FFC017';
              return (
                <div
                  key={c.contradictionId || idx}
                  className="rounded-xl bg-[#08071A] border-2 p-4"
                  style={{ borderColor: sevColor }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <span
                      className="font-display text-xs font-extrabold px-2.5 py-0.5 rounded-[5px] uppercase tracking-wider"
                      style={{ backgroundColor: sevColor, color: '#131313' }}
                    >
                      ⚡ {c.severity} • {c.category}
                    </span>
                    <span className="font-mono-tech text-xs text-[#4E9DE0]">
                      Slide #{c.slideIndex} @ {c.spokenTimestamp}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-2.5">
                    <div className="rounded-lg bg-[#0F0D30] p-3 border border-[#283CC8]">
                      <div className="font-display text-[11px] font-bold text-[#4E9DE0] uppercase mb-1">
                        🎙️ Spoken Audio Claim
                      </div>
                      <div className="text-white font-semibold leading-snug">
                        &ldquo;{c.spokenClaim}&rdquo;
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#0F0D30] p-3 border border-[#283CC8]">
                      <div className="font-display text-[11px] font-bold text-[#FFC017] uppercase mb-1">
                        📊 Slide #{c.slideIndex} Visual Evidence
                      </div>
                      <div className="text-white font-semibold leading-snug">
                        &ldquo;{c.slideEvidence}&rdquo;
                      </div>
                    </div>
                  </div>

                  <div className="font-display text-xs sm:text-sm font-bold text-[#F9E11B]">
                    🔥 VC Call-Out: {c.vcCallOut}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Deterministic VC Tool Checks ("Bullshit Detector") */}
      <div className="border-t border-[#283CC8]/60 pt-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/ptw/tile-yellow.svg"
              alt=""
              className="w-6 h-6 shrink-0"
              aria-hidden="true"
            />
            <h3 className="font-display text-lg font-extrabold uppercase tracking-wide text-white">
              2. Deterministic VC Tool Checks
            </h3>
          </div>
          <span className="font-display text-xs font-bold uppercase text-[#FFC017]">
            4 Native Ollama Function Calls
          </span>
        </div>

        {toolAudits.length === 0 ? (
          <div className="rounded-xl bg-[#08071A] border-2 border-[#283CC8]/70 p-4 font-display text-sm font-semibold text-[#ACACAC]">
            Waiting for deterministic tool executions (audit_unit_economics, verify_tam_math, check_slide_density, flag_buzzword_overload)...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {toolAudits.map((t, idx) => {
              const color =
                t.status === 'PASS'
                  ? '#61CE70'
                  : t.status === 'WARNING'
                  ? '#FFC017'
                  : '#FF3B5C';
              const icon = t.status === 'PASS' ? '✓' : t.status === 'WARNING' ? '!' : '✗';

              return (
                <div
                  key={t.toolName || idx}
                  className="rounded-xl bg-[#08071A] border-2 border-[#283CC8]/80 p-3.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono-tech text-xs font-bold text-[#4E9DE0]">
                      {t.toolName}
                    </span>
                    <span
                      className="font-display text-xs font-extrabold px-2.5 py-0.5 rounded-[5px]"
                      style={{ backgroundColor: color, color: '#131313' }}
                    >
                      {icon} {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-white leading-relaxed">{t.explanation}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Narrative Arc Scores (0-10) & Slide Vision Token Budgets */}
      {narrativeBeats.length > 0 && (
        <div className="border-t border-[#283CC8]/60 pt-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/ptw/tile-sky.svg"
                alt=""
                className="w-6 h-6 shrink-0"
                aria-hidden="true"
              />
              <h3 className="font-display text-lg font-extrabold uppercase tracking-wide text-white">
                3. Spoken Narrative Arc Scores (0–10)
              </h3>
            </div>
            {narrative?.storyArc && (
              <span className="font-display text-xs font-extrabold uppercase text-[#61CE70]">
                Arc Score: {narrative.storyArc.overallArcScore}/100
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-3">
            {narrativeBeats.map(({ key, label, data }) => {
              const score = data?.score ?? 0;
              const barColor =
                score >= 7 ? '#61CE70' : score >= 5 ? '#FFC017' : '#FF3B5C';
              return (
                <div
                  key={key}
                  className="rounded-xl bg-[#08071A] border-2 border-[#283CC8]/70 p-2.5"
                  title={data?.critique || ''}
                >
                  <div className="flex items-center justify-between font-display text-xs font-bold uppercase mb-1.5">
                    <span className="text-[#4E9DE0]">{label}</span>
                    <span className="font-extrabold" style={{ color: barColor }}>
                      {score}/10
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0F0D30] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, score * 10)}%`,
                        backgroundColor: barColor
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {slideAudits.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {slideAudits.map((s) => (
                <div
                  key={s.slideIndex}
                  className="font-display text-xs font-bold px-3 py-1 rounded-[8px] bg-[#08071A] border border-[#283CC8] text-[#ACACAC]"
                >
                  Slide #{s.slideIndex}:{' '}
                  <span className="text-[#4E9DE0]">
                    {s.visionTokenBudgetUsed} tokens
                  </span>
                  {s.finePrintDetected ? (
                    <span className="text-[#F9E11B]"> • Footnote Read ✓</span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Collapsible Gemma 4 <think> Reasoning Trace Drawer */}
      <div className="border-t border-[#283CC8]/60 pt-4">
        <button
          type="button"
          onClick={() => setShowThinking((v) => !v)}
          className="w-full flex items-center justify-between font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F9E11B] hover:underline cursor-pointer"
        >
          <span>
            {showThinking ? '▾' : '▸'} View Gemma 4 Configurable Thinking Trace (&lt;think&gt;)
          </span>
          <span className="font-mono-tech text-xs text-[#4E9DE0]">
            {isStreaming ? 'Streaming live...' : `${thinkingTrace.length} chars`}
          </span>
        </button>

        {showThinking && (
          <pre className="mt-2.5 rounded-xl bg-[#08071A] border-2 border-[#283CC8]/70 p-3.5 font-mono-tech text-xs text-[#ACACAC] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
            {thinkingTrace || 'Waiting for Gemma 4 <think> stream from Local Ollama...'}
          </pre>
        )}
      </div>
    </section>
  );
}
