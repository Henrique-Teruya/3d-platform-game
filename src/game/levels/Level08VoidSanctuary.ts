import type { LevelDefinition } from './LevelTypes';

export const LEVEL_08_VOID_SANCTUARY: LevelDefinition = {
  id: 'level-08',
  index: 8,
  name: 'LEVEL 08 — THE VOID SANCTUARY',
  subtitle: 'Violet Ecliptic Dusk · Zenith Chambers Before the Citadel',
  biome: 'ascension',
  parTimeSeconds: 48,
  voidKillY: -50,
  spawnPoint: [0, 0, 6],
  spawnYawDeg: 0,
  platforms: [
    {
      id: 'l8-p1-start',
      topPosition: [0, 0, 0],
      size: [10, 2.5, 18],
      surfaceType: 'basalt',
      hasGuideInlay: true,
    },
    {
      id: 'l8-p2-altar',
      topPosition: [0, 6.0, -48],
      size: [8.5, 2.5, 12],
      surfaceType: 'concrete',
      hasGuideInlay: true,
    },
    {
      id: 'l8-p3-high-steps',
      topPosition: [0, 12.0, -92],
      size: [9.0, 2.5, 14],
      surfaceType: 'basalt',
      hasGuideInlay: true,
    },
    {
      id: 'l8-p4-citadel-threshold',
      topPosition: [0, 18.0, -132],
      size: [14, 3.5, 24],
      surfaceType: 'concrete',
      hasGuideInlay: true,
    },
  ],
  ramps: [],
  wallPanels: [
    {
      id: 'l8-wall-left',
      center: [-4.2, 8.5, -68],
      size: [0.8, 12.0, 20],
    },
    {
      id: 'l8-wall-right',
      center: [4.2, 8.5, -68],
      size: [0.8, 12.0, 20],
    },
  ],
  arches: [
    {
      id: 'l8-arch-citadel-gate',
      basePosition: [0, 18.0, -126],
      openingWidth: 9.0,
      openingHeight: 16.0,
      pillarWidth: 2.4,
      lintelHeight: 3.5,
      depth: 3.0,
    },
  ],
  movingPlatforms: [
    {
      id: 'l8-mp1-elevator',
      startTopPos: [0, 12.0, -104],
      endTopPos: [0, 16.5, -118],
      size: [6.0, 1.8, 6.0],
      speed: 3.8,
      phaseOffset: 0,
    },
  ],
  launchPads: [
    {
      id: 'l8-pad-1',
      position: [0, 0.05, -8],
      size: [3.8, 0.45, 3.8],
      impulse: [0, 22.5, -38.0],
    },
    {
      id: 'l8-pad-2',
      position: [0, 6.05, -52],
      size: [3.8, 0.45, 3.8],
      impulse: [0, 22.0, -38.5],
    },
  ],
  distantMonoliths: [
    { position: [-55, 50, -45], size: [18, 220, 18], rotationYDeg: 14 },
    { position: [60, 60, -60], size: [20, 240, 20], rotationYDeg: -12 },
    { position: [-70, 35, -120], size: [24, 270, 24], rotationYDeg: 8 },
    { position: [65, 40, -135], size: [22, 260, 22], rotationYDeg: -10 },
    { position: [0, 95, -200], size: [36, 320, 32], rotationYDeg: 0 },
  ],
  checkpoints: [
    {
      id: 'l8-cp-0',
      name: 'Sanctuary Approach',
      position: [0, 0, -2],
      spawnYawDeg: 0,
      radius: 3.8,
    },
    {
      id: 'l8-cp-1',
      name: 'Floating Altar',
      position: [0, 6.0, -44],
      spawnYawDeg: 0,
      radius: 3.8,
    },
    {
      id: 'l8-cp-2',
      name: 'Citadel Gate',
      position: [0, 18.0, -124],
      spawnYawDeg: 0,
      radius: 3.8,
    },
  ],
  finishPortal: {
    position: [0, 18.0, -138],
    radius: 3.5,
  },
};
