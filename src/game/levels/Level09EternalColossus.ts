import type { LevelDefinition } from './LevelTypes';

export const LEVEL_09_ETERNAL_COLOSSUS: LevelDefinition = {
  id: 'level-09',
  index: 9,
  name: 'LEVEL 09 — THE ETERNAL COLOSSUS',
  subtitle: 'Cosmic Zenith · The Infinite Citadel of Kinetic Traversal',
  biome: 'ascension',
  parTimeSeconds: 90,
  voidKillY: -55,
  spawnPoint: [0, 0, 6],
  spawnYawDeg: 0,
  platforms: [
    // Sector 1: Acceleration Courtyard
    {
      id: 'l9-p1-start-plaza',
      topPosition: [0, 0, 0],
      size: [12, 2.5, 22],
      surfaceType: 'concrete',
      hasGuideInlay: true,
    },
    {
      id: 'l9-p2-slide-hall',
      topPosition: [0, 0.5, -28],
      size: [10, 2.5, 20],
      surfaceType: 'basalt',
      hasGuideInlay: true,
    },
    // Sector 2: Catapult Terrace
    {
      id: 'l9-p3-first-catapult',
      topPosition: [0, 0.5, -46],
      size: [9.0, 2.5, 12],
      surfaceType: 'concrete',
      hasGuideInlay: true,
    },
    // Sector 3: Canyon Entry Terrace
    {
      id: 'l9-p4-canyon-approach',
      topPosition: [0, 6.0, -90],
      size: [12, 2.5, 18],
      surfaceType: 'basalt',
      hasGuideInlay: true,
    },
    // Sector 3: Canyon Altar
    {
      id: 'l9-p5-canyon-altar',
      topPosition: [0, 9.0, -136],
      size: [11, 2.5, 16],
      surfaceType: 'concrete',
      hasGuideInlay: true,
    },
    // Sector 4: Chute Platform & Super Catapult
    {
      id: 'l9-p6-chute-catch',
      topPosition: [0, 2.5, -162],
      size: [9.5, 2.5, 14],
      surfaceType: 'concrete',
      hasGuideInlay: true,
    },
    // Sector 5: The Citadel Apex
    {
      id: 'l9-p7-citadel-apex',
      topPosition: [0, 16.0, -212],
      size: [16, 4.0, 30],
      surfaceType: 'basalt',
      hasGuideInlay: true,
    },
  ],
  ramps: [
    {
      id: 'l9-ramp-abyss-chute',
      center: [0, 5.8, -150],
      size: [8.5, 1.4, 20],
      pitchDeg: 22,
      isSlideChute: true,
    },
  ],
  wallPanels: [
    {
      id: 'l9-wall-canyon-left',
      center: [-4.8, 8.5, -114],
      size: [0.9, 12.0, 30],
    },
    {
      id: 'l9-wall-canyon-right',
      center: [4.8, 8.5, -114],
      size: [0.9, 12.0, 30],
    },
  ],
  arches: [
    {
      id: 'l9-arch-monumental-start',
      basePosition: [0, 0, -10],
      openingWidth: 8.5,
      openingHeight: 14.0,
      pillarWidth: 2.2,
      lintelHeight: 3.5,
      depth: 2.8,
    },
    {
      id: 'l9-slide-gate-1',
      basePosition: [0, 0.5, -28],
      openingWidth: 5.5,
      openingHeight: 1.34,
      pillarWidth: 1.4,
      lintelHeight: 4.2,
      depth: 2.2,
    },
    {
      id: 'l9-arch-apex-citadel',
      basePosition: [0, 16.0, -204],
      openingWidth: 10.5,
      openingHeight: 16.0,
      pillarWidth: 2.6,
      lintelHeight: 4.0,
      depth: 3.2,
    },
  ],
  movingPlatforms: [
    {
      id: 'l9-mp1-canyon-transit',
      startTopPos: [0, 7.5, -106],
      endTopPos: [0, 8.5, -124],
      size: [5.5, 1.8, 5.5],
      speed: 3.6,
      phaseOffset: 0,
    },
  ],
  launchPads: [
    {
      id: 'l9-pad-void-jump',
      position: [0, 0.55, -50],
      size: [4.0, 0.45, 4.0],
      impulse: [0, 24.0, -41.5],
    },
    {
      id: 'l9-pad-apex-catapult',
      position: [0, 2.55, -166],
      size: [4.2, 0.45, 4.2],
      impulse: [0, 26.5, -46.5],
    },
  ],
  distantMonoliths: [
    { position: [-60, 50, -45], size: [20, 240, 20], rotationYDeg: 12 },
    { position: [65, 60, -60], size: [22, 260, 22], rotationYDeg: -15 },
    { position: [-75, 40, -120], size: [26, 290, 26], rotationYDeg: 8 },
    { position: [70, 45, -135], size: [24, 280, 24], rotationYDeg: -10 },
    { position: [-85, 60, -180], size: [30, 320, 30], rotationYDeg: 14 },
    { position: [80, 65, -195], size: [28, 310, 28], rotationYDeg: -12 },
    { position: [0, 110, -260], size: [42, 380, 36], rotationYDeg: 0 },
  ],
  checkpoints: [
    {
      id: 'l9-cp-0',
      name: 'Colossus Gateway',
      position: [0, 0, -2],
      spawnYawDeg: 0,
      radius: 3.8,
    },
    {
      id: 'l9-cp-1',
      name: 'Void Terrace',
      position: [0, 6.0, -86],
      spawnYawDeg: 0,
      radius: 3.8,
    },
    {
      id: 'l9-cp-2',
      name: 'Canyon Altar',
      position: [0, 9.0, -132],
      spawnYawDeg: 0,
      radius: 3.8,
    },
    {
      id: 'l9-cp-3',
      name: 'The Citadel Apex',
      position: [0, 16.0, -208],
      spawnYawDeg: 0,
      radius: 4.0,
    },
  ],
  finishPortal: {
    position: [0, 16.0, -222],
    radius: 3.8,
  },
};
