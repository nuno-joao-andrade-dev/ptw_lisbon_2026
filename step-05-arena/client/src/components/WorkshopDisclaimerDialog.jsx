import React, { useEffect } from 'react';

export function WorkshopDisclaimerDialog({ isOpen, onClose }) {
  // Allow closing via Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="dialog-workshop-disclaimer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workshop-dialog-title"
      aria-describedby="workshop-dialog-description"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="ptw-card max-w-xl w-full overflow-hidden border-2 border-[#FEFF00] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Portugal Tech Week Azulejo Top Strip */}
        <div
          className="h-3 w-full bg-repeat-x bg-top"
          style={{
            backgroundImage: "url('/ptw/hero-frame.png')",
            backgroundSize: 'cover'
          }}
        />

        {/* White Header Strip with Official PTW Black Logo */}
        <div className="bg-white px-6 py-4 flex items-center justify-between gap-3 border-b-2 border-[#283CC8]">
          <img
            src="/ptw/ptw-logo-black.png"
            alt="Portugal Tech Week"
            className="h-8 w-auto object-contain"
          />
          <span className="font-display text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded bg-[#283CC8] text-[#F9E11B]">
            WORKSHOP DISCLAIMER
          </span>
        </div>

        {/* Dialog Body */}
        <div className="p-6 sm:p-7 flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <img
              src="/ptw/tile-yellow.svg"
              alt=""
              className="w-10 h-10 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h2
                id="workshop-dialog-title"
                className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white leading-tight"
              >
                Workshop Guide Only — Not a Real Result
              </h2>
              <p className="font-display text-sm font-bold uppercase tracking-wider text-[#F9E11B] mt-0.5">
                Interactive AI Coaching Tool • Gemma 4 + Local Ollama
              </p>
            </div>
          </div>

          <div
            id="workshop-dialog-description"
            className="rounded-xl bg-[#08071A] border-2 border-[#283CC8] p-4 text-sm sm:text-base text-white leading-relaxed space-y-2.5"
          >
            <p>
              <strong>Please note:</strong> This application is part of a hands-on{' '}
              <span className="text-[#F9E11B] font-bold">Portugal Tech Week workshop</span> and is{' '}
              <span className="text-[#4E9DE0] font-bold">
                just a practical guide to help you better pitch your project
              </span>
              .
            </p>
            <p className="text-[#FFC017] font-semibold">
              ⚠️ This isn&apos;t a real Investment Committee result or an official pitch competition evaluation.
            </p>
            <p className="text-xs sm:text-sm text-[#ACACAC]">
              All scores, VC roasts, contradiction checks, and deterministic tool audits are generated 100% locally on this machine via Ollama (<code>gemma4:e2b</code>) for educational and pitch-practice purposes only.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="font-mono-tech text-xs text-[#4E9DE0]">
              100% Local Privacy • Zero Cloud Data Retention
            </span>

            <button
              id="btn-close-workshop-dialog"
              type="button"
              onClick={onClose}
              className="ptw-btn-primary !text-base !py-2.5 !px-6 uppercase cursor-pointer"
            >
              ✓ I Understand — Continue to Pitch Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
