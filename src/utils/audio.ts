/**
 * Realistic Acoustic Drum Roll ("두구두구두구") & Grand Fireworks Sound Engine
 * Features:
 *  - 100% Acoustic Drum Tone (Alternating Left/Right drumstick hits: "두-구-두-구")
 *  - Accelerating Tempo (From steady anticipation to rapid climax drumroll)
 *  - Multi-stage Grand Fireworks Explosions & Long Crackles on Climax
 *  - Triumphant Brass Fanfare & Sparkle Bells
 *  - Zero-GC caching for stutter-free audio synthesis
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeTimers: number[] = [];
  private activeOscillators: OscillatorNode[] = [];
  private cachedSkinNoise: AudioBuffer | null = null;
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

    // Pre-create skin impact noise buffer once (No Garbage Collection stutter)
    if (this.ctx && !this.cachedSkinNoise) {
      try {
        const sampleRate = this.ctx.sampleRate || 44100;
        const length = Math.floor(sampleRate * 2.0); // 2.0s buffer for long firework crackles
        const buffer = this.ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        this.cachedSkinNoise = buffer;
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

  // Soft button click feedback
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch (_) {}
  }

  /**
   * Pure Acoustic Drum Roll ("두구두구두구")
   * Alternates Left/Right drum strikes with accelerating rhythm
   */
  public startSuspense(durationSec: number = 7.2, isGroup: boolean = false) {
    if (this.isMuted) return;
    this.stopSuspense();

    const ctx = this.initCtx();
    if (!ctx) return;

    this.isSuspensePlaying = true;
    const startTime = ctx.currentTime;

    let hitIndex = 0;
    const startInterval = isGroup ? 160 : 140; // ms between hits initially (두... 구... 두... 구...)
    const endInterval = 36; // ms at peak climax roll (두구두구두구두구!)

    const scheduleNextDrumHit = (currentDelayMs: number) => {
      if (!this.isSuspensePlaying || this.isMuted || !this.ctx) return;

      const elapsed = this.ctx.currentTime - startTime;
      const progress = Math.min(1, elapsed / durationSec);

      if (progress >= 0.99) return;

      // Alternate between Left hand ("두") and Right hand ("구")
      const isLeftHand = hitIndex % 2 === 0;
      this.playAcousticDrumHit(isLeftHand, progress);
      hitIndex++;

      // Smooth acceleration curve: gradual build up, rapid climax
      const accelFactor = Math.pow(progress, 2.0);
      const nextDelay = Math.max(
        endInterval,
        Math.round(startInterval - (startInterval - endInterval) * accelFactor)
      );

      const timer = window.setTimeout(() => scheduleNextDrumHit(nextDelay), currentDelayMs);
      this.activeTimers.push(timer);
    };

    scheduleNextDrumHit(startInterval);
  }

  /**
   * Single Acoustic Drum Strike
   * @param isLeftHand True for Low Tom ("두"), False for Mid-Low Tom ("구")
   * @param progress 0.0 to 1.0 (draw progress)
   */
  private playAcousticDrumHit(isLeftHand: boolean, progress: number) {
    if (!this.ctx || this.isMuted) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    try {
      // 1. Resonant Drum Head Membrane (Natural drum tone)
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();

      // Left hand ("두") is slightly deeper than Right hand ("구")
      const basePitch = isLeftHand ? 80 : 105;
      const endPitch = isLeftHand ? 36 : 48;
      // Slight pitch rise as excitement builds
      const dynamicPitch = basePitch + progress * 20;

      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(dynamicPitch, now);
      drumOsc.frequency.exponentialRampToValueAtTime(endPitch, now + 0.065);

      // Volume increases slightly as roll accelerates
      const vol = 0.18 + progress * 0.22 + (isLeftHand ? 0.04 : 0.0);
      drumGain.gain.setValueAtTime(vol, now);
      drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      drumOsc.connect(drumGain);
      drumGain.connect(ctx.destination);

      drumOsc.start(now);
      drumOsc.stop(now + 0.065);

      // 2. Drumstick impact click on leather skin (Organic acoustic texture)
      if (this.cachedSkinNoise) {
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = this.cachedSkinNoise;

        const bandFilter = ctx.createBiquadFilter();
        bandFilter.type = 'bandpass';
        bandFilter.frequency.setValueAtTime(isLeftHand ? 550 : 750, now);
        bandFilter.Q.setValueAtTime(2.5, now);

        const noiseGain = ctx.createGain();
        const noiseVol = 0.05 + progress * 0.09;
        noiseGain.gain.setValueAtTime(noiseVol, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        noiseNode.connect(bandFilter);
        bandFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseNode.start(now);
        noiseNode.stop(now + 0.025);
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

  // Clear dramatic chime / impact when each digit is revealed
  public playDigitLock(digitIndex: number, totalDigits: number = 3) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const pitches = [523.25, 659.25, 783.99, 1046.5];
      const pitch = pitches[Math.min(digitIndex, pitches.length - 1)];

      // Crisp drum thump
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(140, now);
      kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
      kickGain.gain.setValueAtTime(0.32, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.12);

      // Harmonious chime
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'triangle';
      chimeOsc.frequency.setValueAtTime(pitch, now);

      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.linearRampToValueAtTime(0.25, now + 0.015);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);

      chimeOsc.start(now);
      chimeOsc.stop(now + 0.4);
    } catch (_) {}
  }

  /**
   * Pleasant Celebratory Brass Fanfare with Soft Chimes
   * Clean, crisp, musical celebration sound
   */
  public playFanfare() {
    if (this.isMuted) return;
    this.stopSuspense();
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Soft impact thump
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(120, now);
      kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
      kickGain.gain.setValueAtTime(0.3, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.35);

      // 2. Harmonious Brass Fanfare ("빰-빠-바-밤-빰-빠밤!")
      const notes = [
        { f: 523.25, time: 0.05, dur: 0.18, vol: 0.22 }, // C5
        { f: 659.25, time: 0.16, dur: 0.18, vol: 0.22 }, // E5
        { f: 783.99, time: 0.27, dur: 0.22, vol: 0.25 }, // G5
        { f: 1046.5, time: 0.42, dur: 0.85, vol: 0.28 }, // High C6 (Sustain)
        { f: 1318.51, time: 0.52, dur: 0.85, vol: 0.22 }, // High E6
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.time);

        gain.gain.setValueAtTime(0.001, now + note.time);
        gain.gain.linearRampToValueAtTime(note.vol, now + note.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur);
      });

      // 3. Gentle Sparkle Bells
      const chimes = [1567.98, 2093.0, 2637.02, 3135.96];
      chimes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const chimeTime = now + 0.4 + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, chimeTime);

        gain.gain.setValueAtTime(0.08, chimeTime);
        gain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chimeTime);
        osc.stop(chimeTime + 0.35);
      });
    } catch (_) {}
  }
}

export const audioEngine = new SoundEngine();
