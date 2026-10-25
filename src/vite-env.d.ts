/// <reference types="vite/client" />

export interface GameDiagnostics {
  frame: number;
  elapsed: number;
  score: number;
  targetScore: number;
  complete: boolean;
  levelId: string;
  levelIndex: number;
  checkpointIndex: number;
  totalCheckpoints: number;
  movementState: string;
  isGrounded: boolean;
  player: {
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    speed: number;
    horizontalSpeed: number;
    yaw: number;
    pitch: number;
  };
  physics: {
    engine: string;
    fixedDt: number;
    colliderCount: number;
    movingPlatformCount: number;
  };
  renderer: {
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
  };
  canvas: {
    clientWidth: number;
    clientHeight: number;
    width: number;
    height: number;
    dpr: number;
  };
}

export interface GameTestHooks {
  seed: (value: number) => void;
  setState: (name: string) => Promise<{ state: string }> | { state: string };
  setPausedForScreenshot: (paused: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  hideDebugUi: (hidden: boolean) => void;
  loadLevel?: (levelId: string) => void;
  teleportToCheckpoint?: (index: number) => void;
}

declare global {
  interface Window {
    __THREE_GAME_DIAGNOSTICS__?: GameDiagnostics;
    __THREE_GAME_TEST_HOOKS__?: GameTestHooks;
  }
}
