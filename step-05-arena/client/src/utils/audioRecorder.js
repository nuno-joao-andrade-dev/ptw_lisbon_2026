const TARGET_SAMPLE_RATE = 16000;

/**
 * Encodes Float32 mono PCM samples [-1, 1] into a 16,000 Hz 16-bit mono RIFF/WAVE Blob.
 */
export function encodeMonoFloat32ToWavBlob(float32Samples, sampleRate = TARGET_SAMPLE_RATE) {
  const numSamples = float32Samples.length;
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true);  // AudioFormat = 1 (PCM)
  view.setUint16(22, 1, true);  // Mono = 1 channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);  // BlockAlign
  view.setUint16(34, 16, true); // 16-bit
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, float32Samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Computes a 28-bar waveform amplitude summary (values 0.12 to 1.0) from Float32 samples.
 */
export function computeWaveformBars(samples, barCount = 28) {
  if (!samples || samples.length === 0) {
    return Array(barCount).fill(0.15);
  }
  const step = Math.max(1, Math.floor(samples.length / barCount));
  const bars = [];
  let maxVal = 0.01;

  for (let i = 0; i < barCount; i++) {
    const start = i * step;
    const end = Math.min(samples.length, start + step);
    let sumSq = 0;
    for (let j = start; j < end; j++) {
      sumSq += samples[j] * samples[j];
    }
    const rms = Math.sqrt(sumSq / Math.max(1, end - start));
    if (rms > maxVal) maxVal = rms;
    bars.push(rms);
  }

  return bars.map((v) => Number(Math.max(0.15, Math.min(1.0, v / maxVal)).toFixed(2)));
}

/**
 * Decodes any browser-supported audio File/Blob (.wav, .mp3, .webm) and resamples
 * it to a 16,000 Hz 16-bit mono PCM WAV Blob.
 */
export async function decodeAndNormalizeAudioBlob(fileOrBlob, fileName = 'uploaded_pitch.wav') {
  const arrayBuffer = await fileOrBlob.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const tempCtx = new AudioCtx();

  try {
    const decoded = await tempCtx.decodeAudioData(arrayBuffer.slice(0));
    const durationSec = Number(decoded.duration.toFixed(2));
    if (durationSec > 35.0) {
      throw new Error(`Audio duration (${durationSec}s) exceeds the 35-second pitch limit.`);
    }

    const targetLength = Math.max(1, Math.ceil(decoded.duration * TARGET_SAMPLE_RATE));
    const offlineCtx = new OfflineAudioContext(1, targetLength, TARGET_SAMPLE_RATE);
    const source = offlineCtx.createBufferSource();
    source.buffer = decoded;
    source.connect(offlineCtx.destination);
    source.start(0);

    const rendered = await offlineCtx.startRendering();
    const monoSamples = rendered.getChannelData(0);
    const wavBlob = encodeMonoFloat32ToWavBlob(monoSamples, TARGET_SAMPLE_RATE);
    const waveformBars = computeWaveformBars(monoSamples, 28);

    return {
      wavBlob,
      fileName: fileName.endsWith('.wav') ? fileName : `${fileName.replace(/\.[^.]+$/, '')}.wav`,
      durationSec,
      sampleRate: TARGET_SAMPLE_RATE,
      waveformBars
    };
  } finally {
    await tempCtx.close().catch(() => {});
  }
}

/**
 * Live 30-second microphone recorder using Web Audio API that captures raw PCM
 * and encodes directly to a 16,000 Hz 16-bit mono WAV Blob.
 */
export async function startLiveMicRecorder({ onTick, onAutoStop, maxSeconds = 30 }) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true
    }
  });

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  const source = audioCtx.createMediaStreamSource(stream);
  const processor = audioCtx.createScriptProcessor(4096, 1, 1);
  const recordedChunks = [];
  const startTime = Date.now();
  let stopped = false;

  processor.onaudioprocess = (event) => {
    if (stopped) return;
    const input = event.inputBuffer.getChannelData(0);
    recordedChunks.push(new Float32Array(input));

    const elapsedSec = (Date.now() - startTime) / 1000;
    const liveBars = computeWaveformBars(input, 28);
    if (onTick) {
      onTick({
        elapsedSec: Number(elapsedSec.toFixed(1)),
        remainingSec: Math.max(0, Math.ceil(maxSeconds - elapsedSec)),
        liveBars
      });
    }

    if (elapsedSec >= maxSeconds) {
      stop().then((result) => {
        if (onAutoStop) onAutoStop(result);
      });
    }
  };

  source.connect(processor);
  processor.connect(audioCtx.destination);

  async function stop() {
    if (stopped) return null;
    stopped = true;

    processor.disconnect();
    source.disconnect();
    stream.getTracks().forEach((t) => t.stop());

    const inputRate = audioCtx.sampleRate;
    await audioCtx.close().catch(() => {});

    const totalLen = recordedChunks.reduce((acc, c) => acc + c.length, 0);
    const merged = new Float32Array(totalLen);
    let offset = 0;
    for (const chunk of recordedChunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Resample from hardware sampleRate to 16,000 Hz
    const ratio = inputRate / TARGET_SAMPLE_RATE;
    const targetLen = Math.max(1, Math.round(totalLen / ratio));
    const resampled = new Float32Array(targetLen);
    for (let i = 0; i < targetLen; i++) {
      const pos = i * ratio;
      const i0 = Math.floor(pos);
      const i1 = Math.min(totalLen - 1, i0 + 1);
      const frac = pos - i0;
      resampled[i] = merged[i0] * (1 - frac) + merged[i1] * frac;
    }

    const wavBlob = encodeMonoFloat32ToWavBlob(resampled, TARGET_SAMPLE_RATE);
    const durationSec = Number((resampled.length / TARGET_SAMPLE_RATE).toFixed(2));
    const waveformBars = computeWaveformBars(resampled, 28);

    return {
      wavBlob,
      fileName: 'live_recorded_pitch.wav',
      durationSec,
      sampleRate: TARGET_SAMPLE_RATE,
      waveformBars
    };
  }

  return { stop };
}
