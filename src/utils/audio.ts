/**
 * Web Audio API Sound Generator for Stage Lottery & Grand Ceremonies
 * Features:
 *  - High-tension Orchestral Drum Roll & Accelerating Timpani Kick Heartbeats
 *  - Realistic Multi-stage Firework Cannon Salvo & Crackle-Pop Sparks
 *  - Grand Brass Victory Fanfare & Sparkle Chimes
 *  - Offline-first, Zero dependencies, instantaneous audio synthesis
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeTimers: number[] = [];
  private activeOscillators: OscillatorNode[] = [];
  private activeNoiseNodes: AudioNode[] = [];

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

  // Create clean white noise buffer for drums/explosions
  private createNoiseBuffer(duration: number = 1.0): AudioBuffer | null {
    const ctx = this.initCtx();
    if (!ctx) return null;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
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

  /**
   * High-tension Orchestral Drum Roll & Accelerating Timpani Kick
   * Creates maximum suspense leading up to the final winner reveal
   */
  public startSuspense(durationSec: number = 7.2, isGroup: boolean = false) {
    if (this.isMuted) return;
    this.stopSuspense();
    const ctx = this.initCtx();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const endTime = startTime + durationSec;

    // 1. Orchestral Sub-Bass & Tension Swell
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(55, startTime);
    subOsc.frequency.exponentialRampToValueAtTime(240, endTime);

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(160, startTime);
    subFilter.frequency.exponentialRampToValueAtTime(1100, endTime);

    subGain.gain.setValueAtTime(0.08, startTime);
    subGain.gain.linearRampToValueAtTime(0.24, endTime - 0.2);
    subGain.gain.exponentialRampToValueAtTime(0.001, endTime);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(startTime);
    subOsc.stop(endTime);
    this.activeOscillators.push(subOsc);

    // 2. Rising Tension Brass Synth Drone (Overtone chord)
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = 'triangle';
    droneOsc.frequency.setValueAtTime(110, startTime);
    droneOsc.frequency.linearRampToValueAtTime(330, endTime);

    droneGain.gain.setValueAtTime(0.03, startTime);
    droneGain.gain.linearRampToValueAtTime(0.18, endTime - 0.3);
    droneGain.gain.exponentialRampToValueAtTime(0.001, endTime);

    droneOsc.connect(droneGain);
    droneGain.connect(ctx.destination);
    droneOsc.start(startTime);
    droneOsc.stop(endTime);
    this.activeOscillators.push(droneOsc);

    // 3. Accelerating Drum Beats & Snare Roll Sequence
    let stepCount = 0;
    const startInterval = isGroup ? 320 : 260; // ms
    const minInterval = 32; // ms (fast snare/timpani roll)

    const scheduleDrumStep = () => {
      if (this.isMuted || !this.ctx) return;
      const elapsed = this.ctx.currentTime - startTime;
      const progress = Math.min(1, elapsed / durationSec);
      if (progress >= 1) return;

      // Play drum hit (Timpani Kick / Snare combo)
      this.playTensionDrumHit(progress);

      // Accelerate: non-linear exponential ramp
      const currentInterval = startInterval - (startInterval - minInterval) * Math.pow(progress, 1.8);
      const timer = window.setTimeout(scheduleDrumStep, Math.max(minInterval, currentInterval));
      this.activeTimers.push(timer);
      stepCount++;
    };

    scheduleDrumStep();
  }

  // Single dynamic drum hit that morphs from deep timpani kick to rapid snare roll
  private playTensionDrumHit(progress: number) {
    if (!this.ctx || this.isMuted) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // A. Low Timpani / Kick Thump
    const kickOsc = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kickOsc.type = 'sine';
    const kickStartFreq = 120 + progress * 60;
    kickOsc.frequency.setValueAtTime(kickStartFreq, now);
    kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.08);

    const kickVol = 0.12 + progress * 0.22;
    kickGain.gain.setValueAtTime(kickVol, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    kickOsc.connect(kickGain);
    kickGain.connect(ctx.destination);
    kickOsc.start(now);
    kickOsc.stop(now + 0.08);

    // B. Snare / Noise Snap (Gets more prominent as tension builds towards reveal)
    if (progress > 0.3) {
      const noiseBuf = this.createNoiseBuffer(0.06);
      if (noiseBuf) {
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuf;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1000, now);

        const noiseGain = ctx.createGain();
        const snareVol = 0.04 + progress * 0.18;
        noiseGain.gain.setValueAtTime(snareVol, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseNode.start(now);
        noiseNode.stop(now + 0.05);
      }
    }
  }

  public stopSuspense() {
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

  // Play subtle mechanical slot / wheel tick sound
  public playSlotTick(progress: number = 0) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const freq = 580 + progress * 350;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);

    const vol = 0.08 + (1 - progress) * 0.06;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Play crisp dramatic lock sound when each digit or group is locked
  public playDigitLock(digitIndex: number, totalDigits: number = 3) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreqs = [523.25, 783.99, 1046.5, 1318.51];
    const freq = baseFreqs[Math.min(digitIndex, baseFreqs.length - 1)];

    // Punchy sub-thump
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(150 + digitIndex * 40, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.14);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.14);

    // Resonant bell/metallic chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Realistic Firework Cannon Explosion & Spark Crackles
   * Produces authentic deep explosive 'BOOM!' + sparkling crackle pops
   */
  public playFireworkExplosion() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Primary Low-End Cannon Blast (Sub-bass boom punch)
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(130, now);
    boomOsc.frequency.exponentialRampToValueAtTime(32, now + 0.8);

    boomGain.gain.setValueAtTime(0.65, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);
    boomOsc.start(now);
    boomOsc.stop(now + 0.8);

    // 2. Heavy Explosion Noise Body (Filtered white noise blast)
    const blastBuffer = this.createNoiseBuffer(1.4);
    if (blastBuffer) {
      const blastSource = ctx.createBufferSource();
      blastSource.buffer = blastBuffer;

      const blastFilter = ctx.createBiquadFilter();
      blastFilter.type = 'lowpass';
      blastFilter.frequency.setValueAtTime(900, now);
      blastFilter.frequency.exponentialRampToValueAtTime(80, now + 1.2);

      const blastGain = ctx.createGain();
      blastGain.gain.setValueAtTime(0.45, now);
      blastGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      blastSource.connect(blastFilter);
      blastFilter.connect(blastGain);
      blastGain.connect(ctx.destination);

      blastSource.start(now);
      blastSource.stop(now + 1.2);
    }

    // 3. Secondary Aerial Fireworks Salvo (2nd & 3rd delayed bursts)
    [0.18, 0.38, 0.58].forEach((delay, idx) => {
      const burstTime = now + delay;
      const bOsc = ctx.createOscillator();
      const bGain = ctx.createGain();
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(95 - idx * 15, burstTime);
      bOsc.frequency.exponentialRampToValueAtTime(30, burstTime + 0.5);

      bGain.gain.setValueAtTime(0.35 - idx * 0.08, burstTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.5);

      bOsc.connect(bGain);
      bGain.connect(ctx.destination);
      bOsc.start(burstTime);
      bOsc.stop(burstTime + 0.5);

      // Noise burst for each salvo
      const salvoNoise = this.createNoiseBuffer(0.6);
      if (salvoNoise) {
        const sSource = ctx.createBufferSource();
        sSource.buffer = salvoNoise;
        const sFilter = ctx.createBiquadFilter();
        sFilter.type = 'bandpass';
        sFilter.frequency.setValueAtTime(700 - idx * 100, burstTime);
        const sGain = ctx.createGain();
        sGain.gain.setValueAtTime(0.22 - idx * 0.05, burstTime);
        sGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.6);

        sSource.connect(sFilter);
        sFilter.connect(sGain);
        sGain.connect(ctx.destination);
        sSource.start(burstTime);
        sSource.stop(burstTime + 0.6);
      }
    });

    // 4. Spark Crackles (Realistic sizzling firework sparkles)
    for (let i = 0; i < 8; i++) {
      const crackleDelay = 0.25 + Math.random() * 0.8;
      const crackleTime = now + crackleDelay;
      const cNoise = this.createNoiseBuffer(0.04);
      if (cNoise) {
        const cSource = ctx.createBufferSource();
        cSource.buffer = cNoise;
        const cFilter = ctx.createBiquadFilter();
        cFilter.type = 'highpass';
        cFilter.frequency.setValueAtTime(2500 + Math.random() * 2000, crackleTime);

        const cGain = ctx.createGain();
        cGain.gain.setValueAtTime(0.1 + Math.random() * 0.08, crackleTime);
        cGain.gain.exponentialRampToValueAtTime(0.001, crackleTime + 0.04);

        cSource.connect(cFilter);
        cFilter.connect(cGain);
        cGain.connect(ctx.destination);
        cSource.start(crackleTime);
        cSource.stop(crackleTime + 0.04);
      }
    }
  }

  /**
   * Grand Victory Fanfare & Fireworks Celebration
   * Plays simultaneous firework cannon blasts + triumphant brass fanfare chords
   */
  public playFanfare() {
    if (this.isMuted) return;
    this.stopSuspense();
    const ctx = this.initCtx();
    if (!ctx) return;

    // Trigger powerful Fireworks Sound
    this.playFireworkExplosion();

    const now = ctx.currentTime;

    // Triumphant Brass Fanfare Chords (Majestic ceremony progression)
    const fanfareNotes = [
      { f: 523.25, time: 0.05, dur: 0.7, vol: 0.22 },   // C5
      { f: 659.25, time: 0.18, dur: 0.7, vol: 0.22 },   // E5
      { f: 783.99, time: 0.32, dur: 0.8, vol: 0.25 },   // G5
      { f: 1046.5, time: 0.48, dur: 1.8, vol: 0.35 },   // High C6 (Grand Climax)
      { f: 1318.51, time: 0.60, dur: 1.8, vol: 0.28 },  // High E6 (Harmony)
      { f: 1567.98, time: 0.72, dur: 1.8, vol: 0.24 },  // High G6 (Crown)
    ];

    fanfareNotes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.time);

      gain.gain.setValueAtTime(0.001, now + note.time);
      gain.gain.linearRampToValueAtTime(note.vol, now + note.time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });

    // Brilliant golden sparkle cascade
    const sparkles = [1760.0, 2093.0, 2637.02, 3135.96, 3520.0];
    sparkles.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const sparkTime = now + 0.55 + idx * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, sparkTime);

      gain.gain.setValueAtTime(0.14, sparkTime);
      gain.gain.exponentialRampToValueAtTime(0.001, sparkTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(sparkTime);
      osc.stop(sparkTime + 0.35);
    });
  }
}

export const audioEngine = new SoundEngine();
