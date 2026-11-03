import React, { useRef, useState } from 'react';
import {
  decodeAndNormalizeAudioBlob,
  startLiveMicRecorder
} from '../utils/audioRecorder.js';

export function PitchInputCard({
  startupName,
  setStartupName,
  founderName,
  setFounderName,
  activeFixtureId,
  onSelectFixture,
  audioState,
  setAudioState,
  slides,
  setSlides,
  isStreaming,
  onRunAnalysis,
  onCancelAnalysis,
  errorMessage,
  setErrorMessage
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSecondsLeft, setRecordingSecondsLeft] = useState(30);
  const [liveWaveform, setLiveWaveform] = useState(Array(28).fill(0.18));
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const recorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const audioInputRef = useRef(null);
  const slidesInputRef = useRef(null);
  const replaceInputRefs = useRef({});

  // Start or Stop Live 30s Microphone Recording
  const handleToggleRecord = async () => {
    setErrorMessage('');
    if (isRecording && recorderRef.current) {
      const recorded = await recorderRef.current.stop();
      recorderRef.current = null;
      setIsRecording(false);
      if (recorded) {
        setAudioState({
          ...recorded,
          objectUrl: URL.createObjectURL(recorded.wavBlob),
          isCustom: true
        });
      }
      return;
    }

    try {
      setRecordingSecondsLeft(30);
      const recorder = await startLiveMicRecorder({
        maxSeconds: 30,
        onTick: ({ remainingSec, liveBars }) => {
          setRecordingSecondsLeft(remainingSec);
          setLiveWaveform(liveBars);
        },
        onAutoStop: (recorded) => {
          recorderRef.current = null;
          setIsRecording(false);
          if (recorded) {
            setAudioState({
              ...recorded,
              objectUrl: URL.createObjectURL(recorded.wavBlob),
              isCustom: true
            });
          }
        }
      });
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      setErrorMessage(
        `Microphone access unavailable (${err.message}). You can upload a .wav file or load a test fixture.`
      );
    }
  };

  // Handle Audio File Upload (.wav / .mp3 / .webm -> normalized 16kHz mono .wav)
  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage('');

    try {
      const normalized = await decodeAndNormalizeAudioBlob(file, file.name);
      setAudioState({
        ...normalized,
        objectUrl: URL.createObjectURL(normalized.wavBlob),
        isCustom: true
      });
    } catch (err) {
      setErrorMessage(`Audio upload error: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };

  // Play / Pause Audio Preview
  const handleTogglePlayAudio = () => {
    const player = audioPlayerRef.current;
    if (!player) return;
    if (player.paused) {
      player.play();
      setIsPlayingAudio(true);
    } else {
      player.pause();
      setIsPlayingAudio(false);
    }
  };

  // Inspect & Add Uploaded Slide Images (Up to 3 Slides)
  const handleSlidesUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage('');

    const remainingSlots = Math.max(0, 3 - slides.length);
    if (remainingSlots === 0) {
      setErrorMessage('Maximum of 3 slides loaded. Remove or replace a slide first.');
      return;
    }

    const filesToAdd = Array.from(fileList).slice(0, remainingSlots);
    const addedSlides = [];

    for (let i = 0; i < filesToAdd.length; i++) {
      const file = filesToAdd[i];
      const slideIdx = slides.length + i + 1;
      let densityScore = 0.45;
      let recommendedBudget = 1120;

      try {
        const fd = new FormData();
        fd.append('slide', file);
        const res = await fetch('/api/slides/inspect', { method: 'POST', body: fd });
        if (res.ok) {
          const data = await res.json();
          densityScore = data.densityScore;
          recommendedBudget = data.recommendedBudget;
        }
      } catch {
        // Fallback if offline
      }

      addedSlides.push({
        slideIndex: slideIdx,
        title: file.name.replace(/\.[^.]+$/, ''),
        budget: recommendedBudget,
        densityScore,
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }

    setSlides((prev) =>
      [...prev, ...addedSlides].map((s, idx) => ({ ...s, slideIndex: idx + 1 }))
    );
  };

  // Replace a Single Slide Image
  const handleReplaceSlide = async (index, file) => {
    if (!file) return;
    setErrorMessage('');

    let densityScore = 0.45;
    let recommendedBudget = 1120;
    try {
      const fd = new FormData();
      fd.append('slide', file);
      const res = await fetch('/api/slides/inspect', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        densityScore = data.densityScore;
        recommendedBudget = data.recommendedBudget;
      }
    } catch {
      // Ignore
    }

    setSlides((prev) =>
      prev.map((s, idx) =>
        idx === index
          ? {
              ...s,
              title: file.name.replace(/\.[^.]+$/, ''),
              budget: recommendedBudget,
              densityScore,
              file,
              previewUrl: URL.createObjectURL(file)
            }
          : s
      )
    );
  };

  // Remove a Slide and Re-index
  const handleRemoveSlide = (index) => {
    setSlides((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((s, idx) => ({ ...s, slideIndex: idx + 1 }))
    );
  };

  const barsToDisplay = isRecording
    ? liveWaveform
    : audioState?.waveformBars || Array(28).fill(0.15);

  const canAnalyze = Boolean(audioState) && slides.length >= 1 && !isRecording;

  return (
    <section
      id="pitch-input-section"
      className="ptw-card p-5 sm:p-6 flex flex-col gap-5"
    >
      {/* SECTION 0: Startup Metadata & PTW Palace Filter Pills for Quick-Load Test Fixtures */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/ptw/tile-yellow.svg"
              alt=""
              className="w-6 h-6 shrink-0"
              aria-hidden="true"
            />
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wide text-white">
              Startup Info &amp; PTW Demo Presets
            </h2>
          </div>
          <span className="font-display text-xs font-bold uppercase tracking-wider text-[#FFC017]">
            1-Click Test Material
          </span>
        </div>

        {/* Official PTW Agenda Filter Buttons (.ptw-agenda-btn: #000000 bg, #FF7400 text, #FEFF00 active) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3.5">
          <button
            id="btn-load-fixture-1"
            type="button"
            onClick={() => onSelectFixture('fixture_01_roast')}
            className={`ptw-agenda-btn text-left ${
              activeFixtureId === 'fixture_01_roast' ? 'is-active' : ''
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider opacity-80">
              Test 1 • Hard Pass
            </div>
            <div className="truncate">🔥 QuantumSynergy</div>
          </button>

          <button
            id="btn-load-fixture-2"
            type="button"
            onClick={() => onSelectFixture('fixture_02_sprint')}
            className={`ptw-agenda-btn text-left ${
              activeFixtureId === 'fixture_02_sprint' ? 'is-active' : ''
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider opacity-80">
              Test 2 • Dig Deeper
            </div>
            <div className="truncate">🧪 CloudMetrics Pro</div>
          </button>

          <button
            id="btn-load-fixture-3"
            type="button"
            onClick={() => onSelectFixture('fixture_03_clean')}
            className={`ptw-agenda-btn text-left ${
              activeFixtureId === 'fixture_03_clean' ? 'is-active' : ''
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider opacity-80">
              Test 3 • Invest Ready
            </div>
            <div className="truncate">✅ VeraGrid Energy</div>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="input-startup-name"
              className="block font-display text-xs font-bold uppercase tracking-wider text-[#4E9DE0] mb-1"
            >
              Startup Name
            </label>
            <input
              id="input-startup-name"
              type="text"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              placeholder="e.g., CloudMetrics Pro"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#08071A] border-2 border-[#283CC8]/70 font-display text-sm font-semibold text-white focus:outline-none focus:border-[#FEFF00]"
            />
          </div>
          <div>
            <label
              htmlFor="input-founder-name"
              className="block font-display text-xs font-bold uppercase tracking-wider text-[#4E9DE0] mb-1"
            >
              Founder / Presenter
            </label>
            <input
              id="input-founder-name"
              type="text"
              value={founderName}
              onChange={(e) => setFounderName(e.target.value)}
              placeholder="e.g., Alex Rivera (CEO)"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#08071A] border-2 border-[#283CC8]/70 font-display text-sm font-semibold text-white focus:outline-none focus:border-[#FEFF00]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: Spoken Elevator Pitch (Record Live Mic AND/OR Upload .WAV) */}
      <div className="border-t border-[#283CC8]/60 pt-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/ptw/tile-sky.svg"
              alt=""
              className="w-6 h-6 shrink-0"
              aria-hidden="true"
            />
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wide text-white">
              Spoken Pitch Audio (Record or Upload)
            </h2>
          </div>
          <span className="font-display text-xs font-bold uppercase text-[#4E9DE0]">
            16kHz Mono WAV
          </span>
        </div>

        {/* Record & Upload Action Buttons (PTW Primary & Secondary Button Styles) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          <button
            id="btn-audio-record"
            type="button"
            onClick={handleToggleRecord}
            className={`font-display text-base font-bold py-2.5 px-4 rounded-[5px] flex items-center justify-center gap-2 transition cursor-pointer ${
              isRecording
                ? 'bg-[#FF3B5C] text-white animate-pulse'
                : 'bg-[#283CC8] text-white hover:bg-[#F9E11B] hover:text-[#131313]'
            }`}
          >
            {isRecording
              ? `■ Stop Recording (00:${String(recordingSecondsLeft).padStart(2, '0')})`
              : '● Record 30s Pitch (Mic)'}
          </button>

          <label
            htmlFor="input-audio-upload"
            className="ptw-btn-outline !py-2.5 !px-4 !text-base flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>↑ Upload Audio (.wav)</span>
            <input
              id="input-audio-upload"
              ref={audioInputRef}
              type="file"
              accept=".wav,audio/wav,audio/x-wav,audio/webm,audio/mp3,audio/*"
              onChange={handleAudioFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Audio Waveform & Playback Bar */}
        <div className="rounded-xl bg-[#08071A] border-2 border-[#283CC8]/70 p-3.5">
          <div className="flex items-end justify-between gap-1 h-11 mb-2.5 px-1">
            {barsToDisplay.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all duration-100"
                style={{
                  height: `${Math.max(15, Math.round(val * 100))}%`,
                  backgroundColor: isRecording
                    ? '#F9E11B'
                    : audioState
                    ? '#4E9DE0'
                    : '#283CC8'
                }}
              />
            ))}
          </div>

          {audioState ? (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#283CC8]/50">
              <div className="flex items-center gap-2.5">
                <button
                  id="btn-audio-play-pause"
                  type="button"
                  onClick={handleTogglePlayAudio}
                  className="font-display text-xs font-bold uppercase px-3 py-1.5 rounded-[5px] bg-[#283CC8] text-white hover:bg-[#F9E11B] hover:text-[#131313] transition cursor-pointer"
                >
                  {isPlayingAudio ? '⏸ Pause' : '▶ Play'}
                </button>
                <span
                  id="badge-audio-telemetry"
                  className="font-mono-tech text-xs text-white truncate max-w-[220px]"
                >
                  {audioState.fileName} • {audioState.durationSec}s • 16kHz Mono
                </span>
              </div>

              <button
                id="btn-audio-clear"
                type="button"
                onClick={() => {
                  setIsPlayingAudio(false);
                  setAudioState(null);
                }}
                className="font-display text-xs font-bold uppercase text-[#FF3B5C] hover:underline cursor-pointer"
              >
                ✕ Remove Audio
              </button>

              <audio
                ref={audioPlayerRef}
                src={audioState.objectUrl || audioState.audioUrl}
                onEnded={() => setIsPlayingAudio(false)}
                onPause={() => setIsPlayingAudio(false)}
                onPlay={() => setIsPlayingAudio(true)}
                className="hidden"
              />
            </div>
          ) : (
            <p className="font-display text-xs text-[#ACACAC] text-center">
              No pitch audio loaded — click &ldquo;Record 30s Pitch&rdquo; or &ldquo;Upload Audio (.wav)&rdquo; above.
            </p>
          )}
        </div>
      </div>

      {/* SECTION 2: Slide Deck Upload & Per-Slide Vision Token Budget Controls */}
      <div className="border-t border-[#283CC8]/60 pt-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/ptw/tile-orange.svg"
              alt=""
              className="w-6 h-6 shrink-0"
              aria-hidden="true"
            />
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wide text-white">
              Slide Deck Visuals ({slides.length}/3 Slides)
            </h2>
          </div>
          <span className="font-display text-xs font-bold uppercase text-[#FFC017]">
            280 vs 1,120 Vision Tokens
          </span>
        </div>

        {/* Upload Slides Dashed Dropzone (.ptw-dashed-zone from STYLE 5) */}
        <label
          htmlFor="input-slides-upload"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleSlidesUpload(e.dataTransfer.files);
          }}
          className={`mb-3.5 p-3.5 flex items-center justify-center gap-2 text-sm ${
            slides.length >= 3
              ? 'rounded-[10px] border-2 border-dashed border-[#283CC8]/40 bg-[#08071A]/50 text-[#ACACAC]/60 cursor-not-allowed font-display font-semibold'
              : 'ptw-dashed-zone cursor-pointer'
          }`}
        >
          <span>
            {slides.length >= 3
              ? '✓ 3/3 Slides Loaded (Remove or Replace a slide below)'
              : '+ Upload Slides (.png, .jpg, .webp — Drag & Drop or Click, Max 3)'}
          </span>
          <input
            id="input-slides-upload"
            ref={slidesInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            disabled={slides.length >= 3}
            onChange={(e) => {
              handleSlidesUpload(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />
        </label>

        {/* Per-Slide Cards */}
        <div className="flex flex-col gap-3">
          {slides.map((slide, idx) => {
            const i = idx + 1;
            return (
              <div
                key={i}
                className="rounded-xl bg-[#08071A] border-2 border-[#283CC8]/70 p-3 flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={slide.previewUrl || slide.slideUrl}
                    alt={slide.title}
                    className="w-24 h-14 object-cover rounded-lg border border-[#283CC8] shrink-0 bg-[#0F0D30]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-sm font-extrabold text-[#FFC017]">
                        SLIDE #{i}
                      </span>
                      <input
                        id={`input-slide-title-${i}`}
                        type="text"
                        value={slide.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSlides((prev) =>
                            prev.map((s, sIdx) => (sIdx === idx ? { ...s, title: val } : s))
                          );
                        }}
                        placeholder={`Slide ${i} Title`}
                        className="w-full px-2.5 py-1 rounded bg-[#0F0D30] border border-[#283CC8] font-display text-xs font-semibold text-white focus:outline-none focus:border-[#FEFF00]"
                      />
                    </div>
                    <div className="font-mono-tech text-[11px] text-[#4E9DE0]">
                      Visual Density Score: <span className="text-white font-semibold">{slide.densityScore}</span>
                    </div>
                  </div>
                </div>

                {/* Official PTW Track Pills (.ptw-agenda-track-btn) for Vision Token Budgets */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#283CC8]/40">
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-slide-budget-280-${i}`}
                      type="button"
                      onClick={() =>
                        setSlides((prev) =>
                          prev.map((s, sIdx) => (sIdx === idx ? { ...s, budget: 280 } : s))
                        )
                      }
                      className={`ptw-agenda-track-btn !text-xs !py-1 !px-2.5 ${
                        slide.budget === 280 ? 'is-active' : ''
                      }`}
                    >
                      280 Tokens • Layout
                    </button>

                    <button
                      id={`btn-slide-budget-1120-${i}`}
                      type="button"
                      onClick={() =>
                        setSlides((prev) =>
                          prev.map((s, sIdx) => (sIdx === idx ? { ...s, budget: 1120 } : s))
                        )
                      }
                      className={`ptw-agenda-track-btn !text-xs !py-1 !px-2.5 ${
                        slide.budget === 1120 ? 'is-active' : ''
                      }`}
                    >
                      1120 Tokens • Dense
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <label
                      htmlFor={`input-slide-replace-${i}`}
                      className="font-display text-xs font-bold uppercase text-[#4E9DE0] hover:text-[#F9E11B] cursor-pointer"
                    >
                      ↺ Replace
                      <input
                        id={`input-slide-replace-${i}`}
                        ref={(el) => (replaceInputRefs.current[i] = el)}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          handleReplaceSlide(idx, e.target.files?.[0]);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>

                    <button
                      id={`btn-slide-remove-${i}`}
                      type="button"
                      onClick={() => handleRemoveSlide(idx)}
                      className="font-display text-xs font-bold uppercase text-[#FF3B5C] hover:underline cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline Error Banner */}
      {errorMessage && (
        <div className="rounded-lg border-2 border-[#FF3B5C] bg-[#FF3B5C]/15 px-3.5 py-2.5 text-xs text-[#FF3B5C] font-mono-tech">
          ⚠ {errorMessage}
        </div>
      )}

      {/* Official PTW Primary CTA Submission Button (.btn-stay-updated / 3c8bb666) */}
      <div className="pt-1">
        {isStreaming ? (
          <button
            id="btn-cancel-analysis"
            type="button"
            onClick={onCancelAnalysis}
            className="w-full py-3.5 px-6 rounded-[5px] bg-[#FF3B5C] text-white font-display text-lg font-extrabold tracking-wide uppercase hover:opacity-90 transition cursor-pointer"
          >
            ■ Cancel Analysis
          </button>
        ) : (
          <button
            id="btn-analyze-pitch"
            type="button"
            disabled={!canAnalyze}
            onClick={onRunAnalysis}
            className="ptw-btn-primary w-full uppercase tracking-wide cursor-pointer"
          >
            ⚡ Analyze Pitch with Gemma 4
          </button>
        )}
      </div>
    </section>
  );
}
