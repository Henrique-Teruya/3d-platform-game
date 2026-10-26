import type { LevelDefinition } from './LevelTypes';

export const LEVEL_05_KINETIC_SPIRES: LevelDefinition = {
  id: 'level-05',
  index: 5,
  name: 'LEVEL 05 — THE KINETIC SPIRES',
  subtitle: 'Violet Ecliptic Dusk · Aerial Launch into Vertical Wall Traversal',
  biome: 'ascension',
  parTimeSeconds: 42,
  voidKillY: -48,
  spawnPoint: [0, 0, 6],
  spawnYawDeg: 0,
  platforms: [
    {
      id: 'l5-p1-start',
      topPosition: [0, 0, 0],
      size: [10, 2.5, 18],
      surfaceType: 'basalt',
      hasGuideInlay: true,
    },
    {
      id: 'l5-p2-mid-haven',
      topPosition: [-1.5, 5.5, -52],
      size: [8.0, 2.5, 10],
      surfaceType: 'concrete',
      hasGuideInlay: true,
    },
    {
      id: 'l5-p2b-step',
      topPosition: [0, 8.5, -92],
      size: [7.5, 2.5, 8],
      surfaceType: 'concrete',
      hasGuideInlay: true,
    },
    {
      id: 'l5-p3-spire-landing',
      topPosition: [0, 12.0, -114],
      size: [12, 3.0, 20],
      surfaceType: 'basalt',
      hasGuideInlay: true,
    },
  ],
  ramps: [],
  wallPanels: [
    {
      id: 'l5-wall-aerial-right',
      center: [3.8, 5.0, -32],
      size: [0.9, 8.0, 24],
    },
    {
      id: 'l5-wall-tower-left',
      center: [-4.2, 9.0, -96],
      size: [0.9, 10.0, 20],
    },
  ],
  arches: [
    {
      id: 'l5-arch-spire',
      basePosition: [0, 12.0, -108],
      openingWidth: 8.0,
      openingHeight: 14.0,
      pillarWidth: 2.2,
      lintelHeight: 3.2,
      depth: 2.8,
    },
  ],
  movingPlatforms: [
    {
      id: 'l5-mp1-transit',
      startTopPos: [-1.5, 5.5, -64],
      endTopPos: [1.5, 8.5, -78],
      size: [6.0, 1.8, 6.0],
      speed: 3.2,
      phaseOffset: 0,
    },
  ],
  launchPads: [
    {
      id: 'l5-pad-1',
      position: [0, 0.05, -8],
      size: [3.6, 0.45, 3.6],
      impulse: [1.5, 19.5, -28.0],
    },
    {
      id: 'l5-pad-2',
      position: [1.5, 8.55, -84],
      size: [3.6, 0.45, 3.6],
      impulse: [-0.8, 22.5, -30.0],
    },
  ],
  distantMonoliths: [
    { position: [-50, 45, -40], size: [16, 210, 16], rotationYDeg: 14 },
    { position: [55, 55, -55], size: [18, 230, 18], rotationYDeg: -10 },
    { position: [-65, 30, -110], size: [22, 250, 22], rotationYDeg: 6 },
    { position: [60, 35, -125], size: [20, 240, 20], rotationYDeg: -12 },
    { position: [0, 85, -190], size: [34, 300, 30], rotationYDeg: 0 },
  ],
  checkpoints: [
    {
      id: 'l5-cp-0',
      name: 'Lower Spire Gate',
      position: [0, 0, -2],
      spawnYawDeg: 0,
      radius: 3.8,
    },
    {
      id: 'l5-cp-1',
      name: 'Mid-Air Haven',
      position: [-1.5, 5.5, -50],
      spawnYawDeg: 0,
      radius: 3.8,
    },
    {
      id: 'l5-cp-2',
      name: 'Zenith Shrine',
      position: [0, 12.0, -108],
      spawnYawDeg: 0,
      radius: 3.8,
    },
  ],
  finishPortal: {
    position: [0, 12.0, -120],
    radius: 3.5,
  },
};
