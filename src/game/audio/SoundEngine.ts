import type { UserSettings } from '../../stores/gameStore';
import type { EventBus } from '../core/EventBus';
import type { SeededRandom } from '../core/SeededRandom';
import type { SurfaceMaterialType } from '../physics/PhysicsWorld';

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Continuous nodes
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private slideFilter: BiquadFilterNode | null = null;
  private slideGain: GainNode | null = null;
  private padOsc1: OscillatorNode | null = null;
  private padOsc2: OscillatorNode | null = null;
  private isSliding = false;
  private unlocked = false;

  private readonly unsubscribers: Array<() => void> = [];

  constructor(
    private readonly events: EventBus,
    private getRng: () => SeededRandom,
    private settings: UserSettings,
  ) {
    this.bindEvents();
  }

  public unlock(): void {
    if (this.unlocked) {
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.ambienceGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.connect(this.ctx.destination);
      this.musicGain.connect(this.masterGain);
      this.ambienceGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);

      this.applySettings(this.settings);
      this.setupContinuousLoops();
      this.unlocked = true;
    } catch {
      // Ignore audio errors in environments without audio hardware
    }
  }

  public applySettings(settings: UserSettings): void {
    this.settings = settings;
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.ambienceGain || !this.sfxGain) {
      return;
    }
    const now = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(settings.masterVolume, now, 0.03);
    this.musicGain.gain.setTargetAtTime(settings.musicVolume, now, 0.03);
    this.ambienceGain.gain.setTargetAtTime(settings.ambienceVolume, now, 0.03);
    this.sfxGain.gain.setTargetAtTime(settings.sfxVolume, now, 0.03);
  }

  public setBiomeChord(biome: 'awakening' | 'monoliths' | 'ascension'): void {
    if (!this.ctx || !this.padOsc1 || !this.padOsc2) return;
    const now = this.ctx.currentTime;
    if (biome === 'awakening') {
      this.padOsc1.frequency.setTargetAtTime(174.61, now, 0.8); // F3
      this.padOsc2.frequency.setTargetAtTime(261.63, now, 0.8); // C4
    } else if (biome === 'monoliths') {
      this.padOsc1.frequency.setTargetAtTime(146.83, now, 0.8); // D3
      this.padOsc2.frequency.setTargetAtTime(220.0, now, 0.8); // A3
    } else {
      this.padOsc1.frequency.setTargetAtTime(116.54, now, 0.8); // Bb2
      this.padOsc2.frequency.setTargetAtTime(174.61, now, 0.8); // F3
    }
  }

  public updateDynamicAudio(speed: number, isPaused: boolean): void {
    if (!this.ctx || !this.windGain || !this.windFilter || !this.slideGain || !this.slideFilter) {
      return;
    }
    const now = this.ctx.currentTime;
    if (isPaused) {
      this.windGain.gain.setTargetAtTime(0.01, now, 0.1);
      this.slideGain.gain.setTargetAtTime(0, now, 0.05);
      return;
    }

    // Wind scales from gentle breeze (0.04) to high-velocity rush (0.45)
    const speedNorm = Math.max(0, Math.min(1, speed / 18.0));
    const targetWindGain = 0.035 + speedNorm * speedNorm * 0.38;
    const targetWindFreq = 260 + speedNorm * 1650;

    this.windGain.gain.setTargetAtTime(targetWindGain, now, 0.08);
    this.windFilter.frequency.setTargetAtTime(targetWindFreq, now, 0.08);

    // Slide friction scrape loop
    if (this.isSliding && speed > 2.0) {
      const slideNorm = Math.max(0, Math.min(1, speed / 16.0));
      this.slideGain.gain.setTargetAtTime(0.08 + slideNorm * 0.22, now, 0.05);
      this.slideFilter.frequency.setTargetAtTime(450 + slideNorm * 1400, now, 0.05);
    } else {
      this.slideGain.gain.setTargetAtTime(0, now, 0.05);
    }
  }

  private setupContinuousLoops(): void {
    if (!this.ctx || !this.ambienceGain || !this.musicGain || !this.sfxGain) return;

    // Create 2-second noise buffer for Wind & Slide
    const sampleRate = this.ctx.sampleRate;
    const bufferLength = sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferLength, sampleRate);
    const data = noiseBuffer.getChannelData(0);
    const rng = this.getRng();
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < bufferLength; i++) {
      const white = rng() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.95 * b2 + white * 0.048;
      data[i] = (b0 + b1 + b2 + white * 0.05) * 0.35;
    }

    // Wind Loop
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 320;
    this.windFilter.Q.value = 1.2;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.04;

    windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.ambienceGain);
    windSource.start();

    // Slide Scrape Loop
    const slideSource = this.ctx.createBufferSource();
    slideSource.buffer = noiseBuffer;
    slideSource.loop = true;

    this.slideFilter = this.ctx.createBiquadFilter();
    this.slideFilter.type = 'bandpass';
    this.slideFilter.frequency.value = 600;
    this.slideFilter.Q.value = 2.4;

    this.slideGain = this.ctx.createGain();
    this.slideGain.gain.value = 0;

    slideSource.connect(this.slideFilter);
    this.slideFilter.connect(this.slideGain);
    this.slideGain.connect(this.sfxGain);
    slideSource.start();

    // Contemplative Ambient Synth Pad
    this.padOsc1 = this.ctx.createOscillator();
    this.padOsc2 = this.ctx.createOscillator();
    this.padOsc1.type = 'sine';
    this.padOsc2.type = 'triangle';
    this.padOsc1.frequency.value = 174.61;
    this.padOsc2.frequency.value = 261.63;

    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 420;

    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.08;

    this.padOsc1.connect(padFilter);
    this.padOsc2.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(this.musicGain);

    this.padOsc1.start();
    this.padOsc2.start();
  }

  private bindEvents(): void {
    this.unsubscribers.push(
      this.events.on('PLAYER_FOOTSTEP', ({ surfaceType, isWallRunning }) => {
        this.playFootstep(surfaceType, isWallRunning);
      }),
      this.events.on('PLAYER_JUMPED', ({ isWallJump }) => {
        this.playJump(isWallJump);
      }),
      this.events.on('PLAYER_LANDED', ({ fallSpeed, surfaceType }) => {
        this.playLanding(fallSpeed, surfaceType);
      }),
      this.events.on('PLAYER_SLIDE_START', () => {
        this.isSliding = true;
      }),
      this.events.on('PLAYER_SLIDE_END', () => {
        this.isSliding = false;
      }),
      this.events.on('CHECKPOINT_ACTIVATED', () => {
        this.playCheckpointChime();
      }),
      this.events.on('LEVEL_COMPLETED', () => {
        this.playLevelCompleteChord();
      }),
      this.events.on('PLAYER_RESPAWNED', () => {
        this.isSliding = false;
        this.playRespawnSweep();
      }),
      this.events.on('PLAYER_STOMP_START', () => {
        this.playStompStartSound();
      }),
      this.events.on('PLAYER_STOMP_LAND', ({ fallSpeed }) => {
        this.playStompLandSound(fallSpeed);
      }),
      this.events.on('PLAYER_LAUNCHED', ({ isStompBoost }) => {
        this.playLaunchPadSound(isStompBoost);
      }),
    );
  }

  private playFootstep(surface: SurfaceMaterialType, isWallRunning: boolean): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const rng = this.getRng();
    const pitchVar = 0.94 + rng() * 0.12;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const baseFreq = surface === 'basalt' ? 135 : surface === 'metal' ? 165 : 105;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq * pitchVar * (isWallRunning ? 1.15 : 1.0), now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.075);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  private playJump(isWallJump: boolean): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isWallJump ? 190 : 145;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.9, now + 0.14);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  private playLanding(fallSpeed: number, surface: SurfaceMaterialType): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const intensity = Math.min(1, Math.max(0.2, fallSpeed / 20.0));

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const startFreq = surface === 'basalt' ? 110 : 88;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.18);

    gain.gain.setValueAtTime(0.28 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  private playStompStartSound(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.16);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  private playStompLandSound(fallSpeed: number): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const intensity = Math.min(1.4, Math.max(0.5, fallSpeed / 18.0));

    // Deep sub-bass drop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(22, now + 0.28);

    subGain.gain.setValueAtTime(0.42 * intensity, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.34);

    // Punchy noise impact burst
    const punchOsc = this.ctx.createOscillator();
    const punchGain = this.ctx.createGain();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(160, now);
    punchOsc.frequency.exponentialRampToValueAtTime(32, now + 0.12);

    punchGain.gain.setValueAtTime(0.3 * intensity, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    punchOsc.connect(punchGain);
    punchGain.connect(this.sfxGain);
    punchOsc.start(now);
    punchOsc.stop(now + 0.15);
  }

  private playLaunchPadSound(isStompBoost = false): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const boostMult = isStompBoost ? 1.5 : 1.0;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isStompBoost ? 110 : 85, now);
    osc.frequency.exponentialRampToValueAtTime(isStompBoost ? 520 : 340, now + 0.22);
    osc.frequency.exponentialRampToValueAtTime(isStompBoost ? 130 : 110, now + (isStompBoost ? 0.45 : 0.35));

    gain.gain.setValueAtTime(0.35 * boostMult, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isStompBoost ? 0.5 : 0.38));

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + (isStompBoost ? 0.52 : 0.4));

    const hiOsc = this.ctx.createOscillator();
    const hiGain = this.ctx.createGain();
    hiOsc.type = 'sine';
    hiOsc.frequency.setValueAtTime(isStompBoost ? 640 : 520, now);
    hiOsc.frequency.exponentialRampToValueAtTime(isStompBoost ? 1680 : 1240, now + (isStompBoost ? 0.3 : 0.22));
    hiGain.gain.setValueAtTime(0.22 * boostMult, now);
    hiGain.gain.exponentialRampToValueAtTime(0.001, now + (isStompBoost ? 0.35 : 0.25));

    hiOsc.connect(hiGain);
    hiGain.connect(this.sfxGain);
    hiOsc.start(now);
    hiOsc.stop(now + (isStompBoost ? 0.36 : 0.26));
  }

  private playCheckpointChime(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 783.99]; // C5, G5
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.14, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.75);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.78);
    });
  }

  private playLevelCompleteChord(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.12, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 1.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 1.45);
    });
  }

  private playRespawnSweep(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.22);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public dispose(): void {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers.length = 0;
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
