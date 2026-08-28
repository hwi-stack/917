/**
 * High-Performance Web Audio API Sound Engine for Stage Lottery Ceremonies
 * Features:
 *  - Zero-lag Pre-allocated Noise Buffers (Prevents UI frame drops and audio stutter)
 *  - High-tension Orchestral Timpani Drum Beats & Bass Swell
 *  - Grand Firework Cannon Blast (Deep 'BOOM!' + Aerial Sparkle Crackles)
 *  - Triumphant Brass Fanfare with Shimmering Golden Chimes
 *  - 100% Offline-first, Zero external audio assets, Instant synthesis
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private cachedNoiseBuffer: AudioBuffer | null = null;
  private activeTimers: number[] = [];
  private activeOscillators: OscillatorNode[] = [];
  private isSuspensePlaying: boolean = false;

  private initCtx(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Pre-create noise buffer once to avoid Garbage Collection stutter during animation
    if (this.ctx && !this.cachedNoiseBuffer) {
      try {
        const sampleRate = this.ctx.sampleRate || 44100;
        const bufferSize = sampleRate * 2.0; // 2.0s buffer
        const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        this.cachedNoiseBuffer = buffer;
      } catch (_) {}
    }

    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSuspense();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Instant UI button tap
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (_) {}
  }

  /**
   * Suspense Music with Orchestral Timpani Drum Beats & Tension Swell
   * Perfectly matched with draw duration (e.g. 7.2s for Group, 5.5s for Numbers)
   */
  public startSuspense(durationSec: number = 7.2, isGroup: boolean = false) {
    if (this.isMuted) return;
    this.stopSuspense();

    const ctx = this.initCtx();
    if (!ctx) return;

    this.isSuspensePlaying = true;
    const startTime = ctx.currentTime;
    const endTime = startTime + durationSec;

    try {
      // 1. Deep Sub-Bass Riser Drone (Tension build-up)
      const droneOsc = ctx.createOscillator();
      const droneGain = ctx.createGain();
      droneOsc.type = 'triangle';
      droneOsc.frequency.setValueAtTime(65, startTime);
      droneOsc.frequency.exponentialRampToValueAtTime(260, endTime);

      droneGain.gain.setValueAtTime(0.04, startTime);
      droneGain.gain.linearRampToValueAtTime(0.20, endTime - 0.3);
      droneGain.gain.exponentialRampToValueAtTime(0.001, endTime);

      droneOsc.connect(droneGain);
      droneGain.connect(ctx.destination);
      droneOsc.start(startTime);
      droneOsc.stop(endTime);
      this.activeOscillators.push(droneOsc);

      // 2. High Overtone Shimmer Swell
      const highOsc = ctx.createOscillator();
      const highGain = ctx.createGain();
      highOsc.type = 'sine';
      highOsc.frequency.setValueAtTime(130, startTime);
      highOsc.frequency.linearRampToValueAtTime(390, endTime);

      highGain.gain.setValueAtTime(0.02, startTime);
      highGain.gain.linearRampToValueAtTime(0.14, endTime - 0.2);
      highGain.gain.exponentialRampToValueAtTime(0.001, endTime);

      highOsc.connect(highGain);
      highGain.connect(ctx.destination);
      highOsc.start(startTime);
      highOsc.stop(endTime);
      this.activeOscillators.push(highOsc);

      // 3. Timpani Drum Roll & Accelerating Heartbeat Rhythm
      // Scheduled cleanly across durationSec
      const baseInterval = isGroup ? 340 : 280;
      const minInterval = 45;

      const scheduleBeat = (nextDelay: number) => {
        if (!this.isSuspensePlaying || this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationSec);

        if (progress >= 0.98) return;

        // Play Timpani Hit
        this.playTimpaniHit(progress);

        // Next beat interval accelerates as progress increases
        const factor = Math.pow(progress, 2.2);
        const currentInterval = baseInterval - (baseInterval - minInterval) * factor;
        const nextTimeMs = Math.max(minInterval, Math.round(currentInterval));

        const timer = window.setTimeout(() => scheduleBeat(nextTimeMs), nextTimeMs);
        this.activeTimers.push(timer);
      };

      scheduleBeat(baseInterval);
    } catch (e) {
      console.warn('Suspense audio error:', e);
    }
  }

  // Single Timpani Kick & Snare Snap using pre-cached buffers (Zero GC allocation)
  private playTimpaniHit(progress: number) {
    if (!this.ctx || this.isMuted) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    try {
      // Deep Timpani Body
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      const startFreq = 100 + progress * 50;
      kickOsc.frequency.setValueAtTime(startFreq, now);
      kickOsc.frequency.exponentialRampToValueAtTime(32, now + 0.09);

      const vol = 0.12 + progress * 0.22;
      kickGain.gain.setValueAtTime(vol, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.09);

      // Snare Snap (when tension increases past 40%)
      if (progress > 0.35 && this.cachedNoiseBuffer) {
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = this.cachedNoiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1200, now);

        const noiseGain = ctx.createGain();
        const snareVol = 0.03 + progress * 0.16;
        noiseGain.gain.setValueAtTime(snareVol, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseNode.start(now);
        noiseNode.stop(now + 0.05);
      }
    } catch (_) {}
  }

  public stopSuspense() {
    this.isSuspensePlaying = false;
    this.activeTimers.forEach((t) => clearTimeout(t));
    this.activeTimers = [];

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (_) {}
    });
    this.activeOscillators = [];
  }

  // Dramatic lock sound when each digit/slot is locked
  public playDigitLock(digitIndex: number, totalDigits: number = 3) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const baseFreqs = [523.25, 659.25, 783.99, 1046.5];
      const freq = baseFreqs[Math.min(digitIndex, baseFreqs.length - 1)];

      // Punchy sub-impact
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140 + digitIndex * 30, now);
      subOsc.frequency.exponentialRampToValueAtTime(36, now + 0.12);
      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.12);

      // Resonant chime tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (_) {}
  }

  /**
   * Realistic Firework Cannon Explosion & Aerial Sparkle Crackles
   */
  public playFireworkExplosion() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Deep Cannon Sub-Boom
      const boomOsc = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(140, now);
      boomOsc.frequency.exponentialRampToValueAtTime(28, now + 0.9);

      boomGain.gain.setValueAtTime(0.7, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      boomOsc.connect(boomGain);
      boomGain.connect(ctx.destination);
      boomOsc.start(now);
      boomOsc.stop(now + 0.9);

      // 2. Heavy Noise Body (Cached buffer)
      if (this.cachedNoiseBuffer) {
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = this.cachedNoiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(70, now + 1.1);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noiseNode.start(now);
        noiseNode.stop(now + 1.1);
      }

      // 3. Delayed secondary aerial bursts
      [0.2, 0.42, 0.65].forEach((delay, idx) => {
        const burstTime = now + delay;
        const bOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(100 - idx * 15, burstTime);
        bOsc.frequency.exponentialRampToValueAtTime(30, burstTime + 0.45);

        bGain.gain.setValueAtTime(0.35 - idx * 0.08, burstTime);
        bGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.45);

        bOsc.connect(bGain);
        bGain.connect(ctx.destination);
        bOsc.start(burstTime);
        bOsc.stop(burstTime + 0.45);

        if (this.cachedNoiseBuffer) {
          const sSource = ctx.createBufferSource();
          sSource.buffer = this.cachedNoiseBuffer;
          const sFilter = ctx.createBiquadFilter();
          sFilter.type = 'bandpass';
          sFilter.frequency.setValueAtTime(650 - idx * 100, burstTime);
          const sGain = ctx.createGain();
          sGain.gain.setValueAtTime(0.22 - idx * 0.05, burstTime);
          sGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.5);

          sSource.connect(sFilter);
          sFilter.connect(sGain);
          sGain.connect(ctx.destination);
          sSource.start(burstTime);
          sSource.stop(burstTime + 0.5);
        }
      });
    } catch (_) {}
  }

  /**
   * Grand Victory Fanfare & Fireworks Celebration
   */
  public playFanfare() {
    if (this.isMuted) return;
    this.stopSuspense();
    const ctx = this.initCtx();
    if (!ctx) return;

    // Trigger explosive Firework sound
    this.playFireworkExplosion();

    try {
      const now = ctx.currentTime;

      // Triumphant Brass Fanfare Chords
      const fanfareNotes = [
        { f: 523.25, time: 0.05, dur: 0.6, vol: 0.22 },   // C5
        { f: 659.25, time: 0.18, dur: 0.6, vol: 0.22 },   // E5
        { f: 783.99, time: 0.32, dur: 0.7, vol: 0.25 },   // G5
        { f: 1046.5, time: 0.48, dur: 1.8, vol: 0.35 },   // High C6
        { f: 1318.51, time: 0.60, dur: 1.8, vol: 0.28 },  // High E6
        { f: 1567.98, time: 0.72, dur: 1.8, vol: 0.24 },  // High G6
      ];

      fanfareNotes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.time);

        gain.gain.setValueAtTime(0.001, now + note.time);
        gain.gain.linearRampToValueAtTime(note.vol, now + note.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur);
      });

      // Golden sparkle chimes
      const sparkles = [1760.0, 2093.0, 2637.02, 3135.96, 3520.0];
      sparkles.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const sparkTime = now + 0.55 + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, sparkTime);

        gain.gain.setValueAtTime(0.12, sparkTime);
        gain.gain.exponentialRampToValueAtTime(0.001, sparkTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(sparkTime);
        osc.stop(sparkTime + 0.3);
      });
    } catch (_) {}
  }
}

export const audioEngine = new SoundEngine();
