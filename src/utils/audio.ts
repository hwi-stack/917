/**
 * Web Audio API Sound Generator for Stage Lottery
 * Works 100% offline, zero network dependencies, instantaneous response.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private suspenseInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
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

  // Play button click / tap feedback
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // Start continuous suspense tension roll (accelerating heart-thump + rising electronic tension chime)
  public startSuspense(durationSec: number = 4) {
    if (this.isMuted) return;
    this.stopSuspense();
    const ctx = this.initCtx();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const endTime = startTime + durationSec;

    // Drum/Bass rumble & sweep
    const baseOsc = ctx.createOscillator();
    const baseGain = ctx.createGain();
    baseOsc.type = 'sawtooth';
    baseOsc.frequency.setValueAtTime(80, startTime);
    baseOsc.frequency.exponentialRampToValueAtTime(320, endTime);

    // Lowpass filter to keep it warm and punchy
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, startTime);
    filter.frequency.exponentialRampToValueAtTime(1400, endTime);

    baseGain.gain.setValueAtTime(0.1, startTime);
    baseGain.gain.linearRampToValueAtTime(0.25, endTime - 0.2);
    baseGain.gain.exponentialRampToValueAtTime(0.001, endTime);

    baseOsc.connect(filter);
    filter.connect(baseGain);
    baseGain.connect(ctx.destination);

    baseOsc.start(startTime);
    baseOsc.stop(endTime);

    // Rapid ticking pulses
    let tickCount = 0;
    const initialInterval = 140;
    const finalInterval = 40;

    const runTick = () => {
      if (this.isMuted || !this.ctx) return;
      const progress = Math.min(1, (ctx.currentTime - startTime) / durationSec);
      if (progress >= 1) return;

      this.playTickPulse(progress);

      const currentInterval = initialInterval - (initialInterval - finalInterval) * progress;
      this.suspenseInterval = window.setTimeout(runTick, currentInterval);
      tickCount++;
    };

    runTick();
  }

  private playTickPulse(progress: number) {
    if (!this.ctx || this.isMuted) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const freq = 440 + progress * 880;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.03);

    const vol = 0.08 + progress * 0.15;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  }

  public stopSuspense() {
    if (this.suspenseInterval !== null) {
      clearTimeout(this.suspenseInterval);
      this.suspenseInterval = null;
    }
  }

  // Play subtle mechanical slot / wheel tick sound
  public playSlotTick(progress: number = 0) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const freq = 600 + progress * 400;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    const vol = 0.09 + (1 - progress) * 0.06;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Play crisp dramatic lock sound when each digit (hundreds, tens, units) is revealed in sequence
  public playDigitLock(digitIndex: number, totalDigits: number = 3) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Frequencies scale up with each digit: e.g. 520Hz -> 740Hz -> 1040Hz
    const baseFreqs = [523.25, 783.99, 1046.50, 1318.51];
    const freq = baseFreqs[Math.min(digitIndex, baseFreqs.length - 1)];

    // Punchy click/thump
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140 + digitIndex * 40, now);
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.12);

    // Resonant bell/metallic chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Celebration Fanfare & Victory Chime when numbers are revealed
  public playFanfare() {
    if (this.isMuted) return;
    this.stopSuspense();
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Rich bright celebratory fanfare chord progression: [Do, Mi, Sol, High Do, High Mi]
    const notes = [
      { f: 523.25, time: 0, dur: 0.8 },      // C5
      { f: 659.25, time: 0.1, dur: 0.8 },    // E5
      { f: 783.99, time: 0.2, dur: 0.9 },    // G5
      { f: 1046.50, time: 0.35, dur: 1.4 },  // C6 (High sustained climax)
      { f: 1318.51, time: 0.45, dur: 1.5 },  // E6 (Shimmer)
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.time);

      gain.gain.setValueAtTime(0.001, now + note.time);
      gain.gain.linearRampToValueAtTime(0.2, now + note.time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });

    // Add bright sparkle high notes
    const sparkles = [1567.98, 2093.00, 2637.02, 3135.96];
    sparkles.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const sparkTime = now + 0.4 + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, sparkTime);

      gain.gain.setValueAtTime(0.12, sparkTime);
      gain.gain.exponentialRampToValueAtTime(0.001, sparkTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(sparkTime);
      osc.stop(sparkTime + 0.3);
    });
  }
}

export const audioEngine = new SoundEngine();
