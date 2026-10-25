import { create } from 'zustand';
import type { GraphicsQuality } from '../config/graphicsConfig';

export type ScreenState = 'menu' | 'playing' | 'paused' | 'level_complete';

export interface UserSettings {
  // Graphics
  graphicsQuality: GraphicsQuality;
  fov: number;
  // Camera & Accessibility
  mouseSensitivity: number;
  invertY: boolean;
  dynamicFov: boolean;
  cameraTilt: boolean;
  headBob: boolean;
  cameraShake: number; // 0 to 1
  reticleOpacity: number; // 0 to 1
  reticleColor: string;
  showSpeedometer: boolean;
  showTimer: boolean;
  showControlHints: boolean;
  // Audio
  masterVolume: number;
  musicVolume: number;
  ambienceVolume: number;
  sfxVolume: number;
}

export interface LevelProgress {
  unlockedLevels: string[];
  completedLevels: string[];
  bestTimes: Record<string, number>;
  lastPlayedLevel: string;
}

export interface TelemetryData {
  speed: number;
  horizontalSpeed: number;
  movementState: string;
  isGrounded: boolean;
  wallRunSide: 'none' | 'left' | 'right';
  elapsedTime: number;
  checkpointIndex: number;
  totalCheckpoints: number;
  fps: number;
}

export interface GameStoreState {
  screen: ScreenState;
  activeModal: 'none' | 'level_select' | 'settings' | 'credits';
  currentLevelId: string;
  pointerLocked: boolean;
  respawnFadeOpacity: number;
  bannerMessage: { title: string; subtitle?: string; id: number } | null;
  checkpointToast: { label: string; id: number } | null;
  lastCompletion: {
    levelId: string;
    levelName: string;
    elapsedSeconds: number;
    bestSeconds: number;
    isNewBest: boolean;
    nextLevelId: string | null;
  } | null;

  settings: UserSettings;
  progress: LevelProgress;
  telemetry: TelemetryData;

  // Actions
  setScreen: (screen: ScreenState) => void;
  setActiveModal: (modal: 'none' | 'level_select' | 'settings' | 'credits') => void;
  setCurrentLevelId: (levelId: string) => void;
  setPointerLocked: (locked: boolean) => void;
  setRespawnFadeOpacity: (opacity: number) => void;
  showBanner: (title: string, subtitle?: string) => void;
  showCheckpointToast: (label: string) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
  recordLevelCompletion: (
    levelId: string,
    levelName: string,
    elapsedSeconds: number,
    nextLevelId: string | null,
  ) => boolean;
  updateTelemetry: (partial: Partial<TelemetryData>) => void;
}

const STORAGE_KEY_SETTINGS = 'float_parkour_settings_v1';
const STORAGE_KEY_PROGRESS = 'float_parkour_progress_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  graphicsQuality: 'high',
  fov: 85,
  mouseSensitivity: 1.0,
  invertY: false,
  dynamicFov: true,
  cameraTilt: true,
  headBob: false,
  cameraShake: 0.4,
  reticleOpacity: 0.55,
  reticleColor: '#F4F3EE',
  showSpeedometer: true,
  showTimer: true,
  showControlHints: true,
  masterVolume: 0.8,
  musicVolume: 0.55,
  ambienceVolume: 0.7,
  sfxVolume: 0.85,
};

const DEFAULT_PROGRESS: LevelProgress = {
  unlockedLevels: ['level-01', 'level-02', 'level-03'],
  completedLevels: [],
  bestTimes: {},
  lastPlayedLevel: 'level-01',
};

function loadStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

function loadStoredProgress(): LevelProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    const unlocked = Array.from(
      new Set([...DEFAULT_PROGRESS.unlockedLevels, ...(parsed.unlockedLevels || [])]),
    );
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      unlockedLevels: unlocked,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function saveStoredProgress(progress: LevelProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

let bannerCounter = 1;
let toastCounter = 1;

export const useGameStore = create<GameStoreState>((set, get) => ({
  screen: 'menu',
  activeModal: 'none',
  currentLevelId: loadStoredProgress().lastPlayedLevel || 'level-01',
  pointerLocked: false,
  respawnFadeOpacity: 0,
  bannerMessage: null,
  checkpointToast: null,
  lastCompletion: null,

  settings: loadStoredSettings(),
  progress: loadStoredProgress(),
  telemetry: {
    speed: 0,
    horizontalSpeed: 0,
    movementState: 'IDLE',
    isGrounded: true,
    wallRunSide: 'none',
    elapsedTime: 0,
    checkpointIndex: 0,
    totalCheckpoints: 3,
    fps: 60,
  },

  setScreen: (screen) => set({ screen }),
  setActiveModal: (activeModal) => set({ activeModal }),
  setCurrentLevelId: (currentLevelId) => {
    const nextProgress = { ...get().progress, lastPlayedLevel: currentLevelId };
    saveStoredProgress(nextProgress);
    set({ currentLevelId, progress: nextProgress });
  },
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  setRespawnFadeOpacity: (respawnFadeOpacity) => set({ respawnFadeOpacity }),

  showBanner: (title, subtitle) => {
    bannerCounter += 1;
    set({ bannerMessage: { title, subtitle, id: bannerCounter } });
  },

  showCheckpointToast: (label) => {
    toastCounter += 1;
    set({ checkpointToast: { label, id: toastCounter } });
  },

  updateSettings: (partial) => {
    const next = { ...get().settings, ...partial };
    saveStoredSettings(next);
    set({ settings: next });
  },

  resetSettings: () => {
    saveStoredSettings(DEFAULT_SETTINGS);
    set({ settings: DEFAULT_SETTINGS });
  },

  recordLevelCompletion: (levelId, levelName, elapsedSeconds, nextLevelId) => {
    const currentProgress = get().progress;
    const prevBest = currentProgress.bestTimes[levelId];
    const isNewBest = prevBest === undefined || elapsedSeconds < prevBest;
    const bestSeconds = isNewBest ? elapsedSeconds : prevBest;

    const completedSet = new Set(currentProgress.completedLevels);
    completedSet.add(levelId);

    const unlockedSet = new Set(currentProgress.unlockedLevels);
    unlockedSet.add(levelId);
    if (nextLevelId) unlockedSet.add(nextLevelId);

    const nextProgress: LevelProgress = {
      ...currentProgress,
      completedLevels: Array.from(completedSet),
      unlockedLevels: Array.from(unlockedSet),
      bestTimes: {
        ...currentProgress.bestTimes,
        [levelId]: bestSeconds,
      },
    };
    saveStoredProgress(nextProgress);

    set({
      progress: nextProgress,
      screen: 'level_complete',
      lastCompletion: {
        levelId,
        levelName,
        elapsedSeconds,
        bestSeconds,
        isNewBest,
        nextLevelId,
      },
    });

    return isNewBest;
  },

  updateTelemetry: (partial) =>
    set((state) => ({
      telemetry: { ...state.telemetry, ...partial },
    })),
}));
