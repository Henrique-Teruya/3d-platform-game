import type { LevelDefinition } from './LevelTypes';

export const LEVEL_07_PILLAR_GAUNTLET: LevelDefinition = {
  id: 'level-07',
  index: 7,
  name: 'LEVEL 07 — THE PILLAR GAUNTLET',
  subtitle: 'Basalt Meridian · Synchronized Moving Slabs & Alternating Boosters',
  biome: 'monoliths',
  parTimeSeconds: 45,
  voidKillY: -45,
  spawnPoint: [0, 0, 6],
  spawnYawDeg: 0,
  platforms: [
    {
      id: 'l7-p1-start',
      topPosition: [0, 0, 0],
      size: [10, 2.5, 18],
      surfaceType: 'basalt',
      hasGuideInlay: true,
    },
    {
      id: 'l7-p2-pillar-left',
      topPosition: [-4.0, 4.0, -42],
      size: [7.0, 8.0, 8.0],
      surfaceType: 'concrete',
      hasGuideInlay: true,
    },
    {
      id: 'l7-p3-pillar-right',
      topPosition: [4.0, 7.5, -78],
      size: [7.0, 12.0, 8.0],
      surfaceType: 'concrete',
      hasGuideInlay: true,
    },
    {
      id: 'l7-p4-citadel-steps',
      topPosition: [0, 11.0, -114],
      size: [14, 3.0, 22],
      surfaceType: 'basalt',
      hasGuideInlay: true,
    },
  ],
  ramps: [],
  wallPanels: [
    {
      id: 'l7-wall-mid',
      center: [0, 8.0, -60],
      size: [0.9, 10.0, 16],
    },
  ],
  arches: [
    {
      id: 'l7-arch-sanctum',
      basePosition: [0, 11.0, -108],
      openingWidth: 8.5,
      openingHeight: 14.0,
      pillarWidth: 2.2,
      lintelHeight: 3.2,
      depth: 2.8,
    },
  ],
  movingPlatforms: [
    {
      id: 'l7-mp1-shuttle',
      startTopPos: [4.0, 7.5, -88],
      endTopPos: [0, 9.5, -100],
      size: [5.5, 1.8, 5.5],
      speed: 3.5,
      phaseOffset: 0,
    },
  ],
  launchPads: [
    {
      id: 'l7-pad-left',
      position: [0, 0.05, -8],
      size: [3.6, 0.45, 3.6],
      impulse: [-3.8, 20.0, -32.5],
    },
    {
      id: 'l7-pad-right',
      position: [-4.0, 4.05, -44],
      size: [3.6, 0.45, 3.6],
      impulse: [6.8, 20.5, -34.0],
    },
  ],
  distantMonoliths: [
    { position: [-48, 35, -35], size: [16, 190, 16], rotationYDeg: 12 },
    { position: [54, 45, -50], size: [18, 210, 18], rotationYDeg: -14 },
    { position: [-62, 25, -105], size: [22, 230, 22], rotationYDeg: 6 },
    { position: [58, 30, -120], size: [20, 220, 20], rotationYDeg: -8 },
    { position: [0, 75, -185], size: [32, 280, 28], rotationYDeg: 0 },
  ],
  checkpoints: [
    {
      id: 'l7-cp-0',
      name: 'Gauntlet Entry',
      position: [0, 0, -2],
      spawnYawDeg: 0,
      radius: 3.8,
    },
    {
      id: 'l7-cp-1',
      name: 'Pillar Crest',
      position: [-4.0, 4.0, -40],
      spawnYawDeg: 0,
      radius: 3.8,
    },
    {
      id: 'l7-cp-2',
      name: 'Ascending Sanctum',
      position: [0, 11.0, -106],
      spawnYawDeg: 0,
      radius: 3.8,
    },
  ],
  finishPortal: {
    position: [0, 11.0, -120],
    radius: 3.5,
  },
};
