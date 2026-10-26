import type { SurfaceMaterialType } from '../physics/PhysicsWorld';

export interface PlatformSpec {
  id: string;
  /** Center X, exact TOP walkable surface Y, and center Z */
  topPosition: [number, number, number];
  /** [width X, thickness Y, depth Z] */
  size: [number, number, number];
  surfaceType?: SurfaceMaterialType;
  hasGuideInlay?: boolean;
  hasSubstructurePillar?: boolean;
  isWallRunnable?: boolean;
}

export interface RampSpec {
  id: string;
  /** World center [x, y, z] of the ramp box */
  center: [number, number, number];
  /** [width X, thickness Y, length Z] */
  size: [number, number, number];
  /** Rotation around X axis in degrees (+ tilts -Z edge downward for downhill slide) */
  pitchDeg: number;
  yawDeg?: number;
  isSlideChute?: boolean;
}

export interface WallRunPanelSpec {
  id: string;
  /** World center [x, y, z] */
  center: [number, number, number];
  /** [thickness X, height Y, length Z] */
  size: [number, number, number];
  yawDeg?: number;
}

export interface ArchGateSpec {
  id: string;
  /** Ground base center [x, y, z] */
  basePosition: [number, number, number];
  openingWidth: number;
  /** Clearance height under lintel (e.g. 1.35m for slide gate, 14m for monumental arch) */
  openingHeight: number;
  pillarWidth: number;
  lintelHeight: number;
  depth: number;
}

export interface MovingPlatformSpec {
  id: string;
  startTopPos: [number, number, number];
  endTopPos: [number, number, number];
  size: [number, number, number];
  speed: number;
  phaseOffset?: number;
}

export interface DistantMonolithSpec {
  position: [number, number, number];
  size: [number, number, number];
  rotationYDeg?: number;
}

export interface CheckpointSpec {
  id: string;
  name: string;
  /** Foot position [x, y, z] on the platform */
  position: [number, number, number];
  spawnYawDeg?: number;
  radius?: number;
}

export interface LaunchPadSpec {
  id: string;
  /** Center X, top surface Y, center Z */
  position: [number, number, number];
  /** [width X, thickness Y, depth Z] */
  size?: [number, number, number];
  /** Velocity impulse vector [vx, vy, vz] imparted to the player */
  impulse: [number, number, number];
}

export interface TutorialTriggerSpec {
  id: string;
  triggerZ: number;
  triggerRadius?: number;
  desktopTitle: string;
  desktopHint: string;
  desktopKey: string;
  mobileTitle: string;
  mobileHint: string;
  actionType: 'sprint' | 'jump' | 'slide' | 'wallrun';
}

export interface FinishPortalSpec {
  position: [number, number, number];
  radius: number;
}

export interface LevelDefinition {
  id: string;
  index: number;
  name: string;
  subtitle: string;
  biome: 'awakening' | 'monoliths' | 'ascension';
  parTimeSeconds: number;
  voidKillY: number;
  spawnPoint: [number, number, number];
  spawnYawDeg: number;
  platforms: PlatformSpec[];
  ramps: RampSpec[];
  wallPanels: WallRunPanelSpec[];
  arches: ArchGateSpec[];
  movingPlatforms: MovingPlatformSpec[];
  launchPads?: LaunchPadSpec[];
  tutorialTriggers?: TutorialTriggerSpec[];
  distantMonoliths: DistantMonolithSpec[];
  checkpoints: CheckpointSpec[];
  finishPortal: FinishPortalSpec;
}
