import fs from 'node:fs';
import { CONFIG } from './config.js';

/**
 * Parses a RIFF/WAVE Buffer, downmixes to mono if needed, resamples to 16,000 Hz
 * 16-bit PCM, normalizes peak amplitude, and returns a normalized WAV Buffer + metadata.
 * Pure Node.js implementation with zero native or legacy audio dependencies.
 */
export function parseAndNormalizeWavBuffer(inputBuffer, options = {}) {
  const targetSampleRate = options.targetSampleRate || CONFIG.audioSampleRate || 16000;
  const maxDurationSec = options.maxDurationSec || CONFIG.maxAudioDurationSec || 35.0;

  if (!Buffer.isBuffer(inputBuffer) || inputBuffer.length < 44) {
    throw new Error('Invalid WAV file: buffer is smaller than a 44-byte RIFF header.');
  }

  const riffHeader = inputBuffer.toString('ascii', 0, 4);
  const waveHeader = inputBuffer.toString('ascii', 8, 12);
  if (riffHeader !== 'RIFF' || waveHeader !== 'WAVE') {
    throw new Error(`Invalid WAV header: expected RIFF/WAVE, got "${riffHeader}/${waveHeader}".`);
  }

  let offset = 12;
  let audioFormat = 1;
  let numChannels = 1;
  let sampleRate = 16000;
  let bitsPerSample = 16;
  let dataChunkOffset = -1;
  let dataChunkSize = 0;

  while (offset + 8 <= inputBuffer.length) {
    const chunkId = inputBuffer.toString('ascii', offset, offset + 4);
    const chunkSize = inputBuffer.readUInt32LE(offset + 4);
    const chunkDataStart = offset + 8;

    if (chunkId === 'fmt ' && chunkSize >= 16) {
      audioFormat = inputBuffer.readUInt16LE(chunkDataStart);
      numChannels = inputBuffer.readUInt16LE(chunkDataStart + 2);
      sampleRate = inputBuffer.readUInt32LE(chunkDataStart + 4);
      bitsPerSample = inputBuffer.readUInt16LE(chunkDataStart + 14);
    } else if (chunkId === 'data') {
      dataChunkOffset = chunkDataStart;
      dataChunkSize = Math.min(chunkSize, inputBuffer.length - chunkDataStart);
      break;
    }

    // Chunks are word-aligned (2 bytes)
    offset = chunkDataStart + chunkSize + (chunkSize % 2);
  }

  if (dataChunkOffset < 0 || dataChunkSize <= 0) {
    throw new Error('Invalid WAV file: missing or empty "data" chunk.');
  }

  if (audioFormat !== 1 && audioFormat !== 3) {
    throw new Error(`Unsupported WAV encoding format (${audioFormat}). Please provide PCM (1) or IEEE Float (3) WAV.`);
  }

  const bytesPerSample = Math.max(1, bitsPerSample / 8);
  const frameSize = bytesPerSample * numChannels;
  const totalFrames = Math.floor(dataChunkSize / frameSize);
  const durationSec = Number((totalFrames / sampleRate).toFixed(2));

  if (durationSec > maxDurationSec) {
    throw new Error(`Audio duration (${durationSec}s) exceeds maximum allowed (${maxDurationSec}s).`);
  }

  // Decode into Float32 mono samples in [-1.0, 1.0]
  const monoFloat = new Float32Array(totalFrames);
  let peak = 0;

  for (let i = 0; i < totalFrames; i++) {
    let sum = 0;
    const frameStart = dataChunkOffset + i * frameSize;
    for (let ch = 0; ch < numChannels; ch++) {
      const sampleOffset = frameStart + ch * bytesPerSample;
      let val = 0;
      if (audioFormat === 3 && bitsPerSample === 32) {
        val = inputBuffer.readFloatLE(sampleOffset);
      } else if (bitsPerSample === 16) {
        val = inputBuffer.readInt16LE(sampleOffset) / 32768.0;
      } else if (bitsPerSample === 8) {
        val = (inputBuffer.readUInt8(sampleOffset) - 128) / 128.0;
      } else if (bitsPerSample === 24) {
        const b0 = inputBuffer.readUInt8(sampleOffset);
        const b1 = inputBuffer.readUInt8(sampleOffset + 1);
        const b2 = inputBuffer.readInt8(sampleOffset + 2);
        const int24 = (b2 << 16) | (b1 << 8) | b0;
        val = int24 / 8388608.0;
      } else if (bitsPerSample === 32) {
        val = inputBuffer.readInt32LE(sampleOffset) / 2147483648.0;
      }
      sum += val;
    }
    const monoSample = sum / numChannels;
    monoFloat[i] = monoSample;
    const abs = Math.abs(monoSample);
    if (abs > peak) peak = abs;
  }

  // Resample to targetSampleRate (16,000 Hz) using linear interpolation if needed
  let resampledFloat = monoFloat;
  if (sampleRate !== targetSampleRate) {
    const targetLength = Math.max(1, Math.round((totalFrames * targetSampleRate) / sampleRate));
    resampledFloat = new Float32Array(targetLength);
    const ratio = sampleRate / targetSampleRate;
    for (let i = 0; i < targetLength; i++) {
      const srcPos = i * ratio;
      const idx0 = Math.floor(srcPos);
      const idx1 = Math.min(totalFrames - 1, idx0 + 1);
      const frac = srcPos - idx0;
      resampledFloat[i] = monoFloat[idx0] * (1 - frac) + monoFloat[idx1] * frac;
    }
  }

  // Gentle peak normalization to 0.90 full scale so quiet laptop mics are crisp
  const normGain = peak > 0.01 && peak < 0.85 ? 0.9 / peak : 1.0;

  // Encode 16-bit mono PCM WAV at 16,000 Hz
  const pcmDataBytes = resampledFloat.length * 2;
  const wavOut = Buffer.alloc(44 + pcmDataBytes);

  wavOut.write('RIFF', 0, 4, 'ascii');
  wavOut.writeUInt32LE(36 + pcmDataBytes, 4);
  wavOut.write('WAVE', 8, 4, 'ascii');
  wavOut.write('fmt ', 12, 4, 'ascii');
  wavOut.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavOut.writeUInt16LE(1, 20);  // AudioFormat = 1 (PCM)
  wavOut.writeUInt16LE(1, 22);  // NumChannels = 1 (Mono)
  wavOut.writeUInt32LE(targetSampleRate, 24);
  wavOut.writeUInt32LE(targetSampleRate * 2, 28); // ByteRate = SampleRate * 1 * 2
  wavOut.writeUInt16LE(2, 32);  // BlockAlign = 2
  wavOut.writeUInt16LE(16, 34); // BitsPerSample = 16
  wavOut.write('data', 36, 4, 'ascii');
  wavOut.writeUInt32LE(pcmDataBytes, 40);

  for (let i = 0; i < resampledFloat.length; i++) {
    const clamped = Math.max(-1.0, Math.min(1.0, resampledFloat[i] * normGain));
    const int16 = clamped < 0 ? Math.round(clamped * 32768) : Math.round(clamped * 32767);
    wavOut.writeInt16LE(int16, 44 + i * 2);
  }

  return {
    wavBuffer: wavOut,
    base64Wav: wavOut.toString('base64'),
    originalSampleRate: sampleRate,
    originalChannels: numChannels,
    sampleRate: targetSampleRate,
    channels: 1,
    bitsPerSample: 16,
    durationSec: Number((resampledFloat.length / targetSampleRate).toFixed(2)),
    byteLength: wavOut.length,
    estimatedAudioTokens: Math.ceil((resampledFloat.length / targetSampleRate) * 25)
  };
}

export function loadAndNormalizeWavFile(filePath, options = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found: ${filePath}`);
  }
  const rawBuffer = fs.readFileSync(filePath);
  const result = parseAndNormalizeWavBuffer(rawBuffer, options);
  return {
    ...result,
    filePath
  };
}
