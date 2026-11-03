import React, { useEffect, useRef, useState } from 'react';
import { PtwHeader } from './components/PtwHeader.jsx';
import { PitchInputCard } from './components/PitchInputCard.jsx';
import { VerdictAndRoastCard } from './components/VerdictAndRoastCard.jsx';
import { AuditBreakdownCard } from './components/AuditBreakdownCard.jsx';
import { WorkshopDisclaimerDialog } from './components/WorkshopDisclaimerDialog.jsx';

export default function App() {
  const [isWorkshopDialogOpen, setIsWorkshopDialogOpen] = useState(true);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [activeFixtureId, setActiveFixtureId] = useState('fixture_02_sprint');

  const [startupName, setStartupName] = useState('CloudMetrics Pro');
  const [founderName, setFounderName] = useState('Alex Rivera (CEO)');
  const [audioState, setAudioState] = useState(null);
  const [slides, setSlides] = useState([]);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStageMessage, setStreamStageMessage] = useState('');
  const [thinkingTrace, setThinkingTrace] = useState('');
  const [liveToolCalls, setLiveToolCalls] = useState([]);
  const [verdictData, setVerdictData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const abortRef = useRef(null);

  // Load Local Ollama status & fixtures on mount
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setOllamaStatus(data))
      .catch(() => setOllamaStatus({ online: false }));

    fetch('/api/fixtures')
      .then((r) => r.json())
      .then((data) => {
        const list = data.fixtures || [];
        setFixtures(list);
        const defaultFix = list.find((f) => f.id === 'fixture_02_sprint') || list[0];
        if (defaultFix) {
          applyFixtureToForm(defaultFix);
        }
      })
      .catch((err) => setErrorMessage(`Failed to load fixtures: ${err.message}`));
  }, []);

  const applyFixtureToForm = (fixture) => {
    setActiveFixtureId(fixture.id);
    setStartupName(fixture.startupName);
    setFounderName(fixture.founderName || '');
    setAudioState({
      fileName: fixture.audioPath.split('/').pop(),
      durationSec: fixture.durationSeconds,
      sampleRate: 16000,
      audioUrl: fixture.audioUrl,
      waveformBars: [
        0.25, 0.48, 0.72, 0.61, 0.85, 0.94, 0.52, 0.38, 0.67, 0.89, 0.76, 0.44, 0.63, 0.91,
        0.82, 0.55, 0.73, 0.95, 0.68, 0.49, 0.77, 0.84, 0.62, 0.51, 0.79, 0.66, 0.42, 0.28
      ],
      isCustom: false
    });
    setSlides(
      (fixture.slides || []).map((s) => ({
        slideIndex: s.slideIndex,
        title: s.title,
        budget: s.defaultBudget || 1120,
        densityScore: s.densityScore || 0.5,
        slideUrl: s.slideUrl,
        file: null
      }))
    );
    setVerdictData(null);
    setThinkingTrace('');
    setLiveToolCalls([]);
    setErrorMessage('');
  };

  const handleSelectFixture = (fixtureId) => {
    const found = fixtures.find((f) => f.id === fixtureId);
    if (found) {
      applyFixtureToForm(found);
    }
  };

  const handleResetSession = async () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
    setActiveFixtureId(null);
    setStartupName('');
    setFounderName('');
    setAudioState(null);
    setSlides([]);
    setVerdictData(null);
    setThinkingTrace('');
    setLiveToolCalls([]);
    setErrorMessage('');
    await fetch('/api/session/reset', { method: 'POST' }).catch(() => {});
  };

  const handleCancelAnalysis = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
    setStreamStageMessage('Analysis cancelled.');
  };

  const handleRunAnalysis = async () => {
    setErrorMessage('');
    setVerdictData(null);
    setThinkingTrace('');
    setLiveToolCalls([]);
    setIsStreaming(true);
    setStreamStageMessage('Submitting pitch audio & slides to Local Ollama (gemma4:e2b)...');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const formData = new FormData();
      formData.append('startupName', startupName || 'Untitled Startup');
      formData.append('founderName', founderName || '');

      if (audioState?.isCustom && audioState?.wavBlob) {
        formData.append('audio', audioState.wavBlob, audioState.fileName || 'pitch.wav');
      } else if (activeFixtureId) {
        formData.append('fixtureId', activeFixtureId);
      }

      const customSlides = slides.filter((s) => s.file instanceof Blob);
      if (customSlides.length > 0) {
        for (const s of customSlides) {
          formData.append('slides', s.file, `${s.title || 'slide'}.png`);
        }
      } else if (!activeFixtureId && slides.length > 0) {
        // Fetch any slideUrl blobs if user modified a fixture without keeping activeFixtureId
        for (const s of slides) {
          if (s.slideUrl) {
            const resp = await fetch(s.slideUrl);
            const blob = await resp.blob();
            formData.append('slides', blob, `slide_${s.slideIndex}.png`);
          }
        }
      }

      formData.append(
        'slideMeta',
        JSON.stringify(
          slides.map((s, idx) => ({
            slideIndex: idx + 1,
            slideTitle: s.title,
            budget: s.budget
          }))
        )
      );

      const response = await fetch('/api/pitch/analyze-stream', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary;
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          let eventName = 'message';
          let dataLine = '';
          for (const line of rawEvent.split('\n')) {
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataLine += line.slice(5).trim();
            }
          }

          if (!dataLine) continue;
          let payload;
          try {
            payload = JSON.parse(dataLine);
          } catch {
            continue;
          }

          if (eventName === 'status') {
            setStreamStageMessage(payload.message || '');
          } else if (eventName === 'thinking') {
            setThinkingTrace(payload.fullThinking || '');
          } else if (eventName === 'tool_call') {
            if (payload.toolResult) {
              setLiveToolCalls((prev) => {
                const filtered = prev.filter(
                  (t) => t.toolName !== payload.toolResult.toolName
                );
                return [...filtered, payload.toolResult];
              });
            }
          } else if (eventName === 'verdict') {
            setVerdictData(payload.verdict);
            setIsStreaming(false);
          } else if (eventName === 'error') {
            setErrorMessage(payload.message || 'Analysis failed.');
            setIsStreaming(false);
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setErrorMessage(err.message || 'Failed to stream pitch analysis.');
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <WorkshopDisclaimerDialog
        isOpen={isWorkshopDialogOpen}
        onClose={() => setIsWorkshopDialogOpen(false)}
      />

      <div>
        <PtwHeader
          ollamaStatus={ollamaStatus}
          onResetSession={handleResetSession}
          onOpenWorkshopDialog={() => setIsWorkshopDialogOpen(true)}
        />

        <main className="max-w-[1360px] mx-auto px-4 sm:px-6 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (42% / 5 cols): Pitch Inputs, Audio Recorder/Uploader & Slide Uploader */}
          <div className="lg:col-span-5">
            <PitchInputCard
              startupName={startupName}
              setStartupName={setStartupName}
              founderName={founderName}
              setFounderName={setFounderName}
              activeFixtureId={activeFixtureId}
              onSelectFixture={handleSelectFixture}
              audioState={audioState}
              setAudioState={setAudioState}
              slides={slides}
              setSlides={setSlides}
              isStreaming={isStreaming}
              onRunAnalysis={handleRunAnalysis}
              onCancelAnalysis={handleCancelAnalysis}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          </div>

          {/* RIGHT COLUMN (58% / 7 cols): Verdict & Live Roast + Contradictions, Tools & Thinking Trace */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <VerdictAndRoastCard
              verdictData={verdictData}
              isStreaming={isStreaming}
              streamStageMessage={streamStageMessage}
              founderName={founderName}
            />

            <AuditBreakdownCard
              verdictData={verdictData}
              liveToolCalls={liveToolCalls}
              thinkingTrace={thinkingTrace}
              isStreaming={isStreaming}
            />
          </div>
        </main>
      </div>

      {/* OFFICIAL PORTUGAL TECH WEEK WHITE COMMUNITY STRIP & 351 ASSOCIATION FOOTER (post-764.css) */}
      <footer className="mt-6">
        <div className="bg-white text-[#131313] py-6 px-4 sm:px-8 border-t-4 border-[#283CC8]">
          <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/ptw/ptw-logo-black.png"
                alt="Portugal Tech Week"
                className="h-8 sm:h-9 w-auto object-contain"
              />
              <div>
                <div className="font-display text-lg sm:text-xl font-extrabold uppercase leading-none text-[#131313]">
                  BE PART OF THE PORTUGAL TECH WEEK COMMUNITY
                </div>
                <div className="font-display text-xs sm:text-sm font-semibold text-[#283CC8]">
                  THE HOUSE OF DECENTRALIZED INNOVATION • 6–15 NOVEMBER 2026
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href="#top"
                className="ptw-btn-primary !text-sm !py-2 !px-4 uppercase"
              >
                ↑ Back to Arena Top
              </a>
            </div>
          </div>
        </div>

        <div className="bg-[#08071A] border-t border-[#283CC8]/50 py-4 px-4 sm:px-8">
          <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#ACACAC]">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold uppercase text-white">
                Organised by
              </span>
              <img
                src="/ptw/351-logo-white.png"
                alt="351 Portuguese Startup Association"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="font-mono-tech text-[11px] text-[#4E9DE0]">
              Powered 100% Locally by Gemma 4 + Ollama (http://127.0.0.1:11434) • Zero Cloud Data Retention
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
