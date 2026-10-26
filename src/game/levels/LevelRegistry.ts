import { LEVEL_01_AWAKENING } from './Level01Awakening';
import { LEVEL_02_MONOLITHS } from './Level02Monoliths';
import { LEVEL_03_ASCENSION } from './Level03Ascension';
import { LEVEL_04_LAUNCHPAD_CHASM } from './Level04LaunchpadChasm';
import { LEVEL_05_KINETIC_SPIRES } from './Level05KineticSpires';
import { LEVEL_06_SLIDE_AQUEDUCT } from './Level06SlideAqueduct';
import { LEVEL_07_PILLAR_GAUNTLET } from './Level07PillarGauntlet';
import { LEVEL_08_VOID_SANCTUARY } from './Level08VoidSanctuary';
import { LEVEL_09_ETERNAL_COLOSSUS } from './Level09EternalColossus';
import type { LevelDefinition } from './LevelTypes';

export const LEVELS: LevelDefinition[] = [
  LEVEL_01_AWAKENING,
  LEVEL_02_MONOLITHS,
  LEVEL_03_ASCENSION,
  LEVEL_04_LAUNCHPAD_CHASM,
  LEVEL_05_KINETIC_SPIRES,
  LEVEL_06_SLIDE_AQUEDUCT,
  LEVEL_07_PILLAR_GAUNTLET,
  LEVEL_08_VOID_SANCTUARY,
  LEVEL_09_ETERNAL_COLOSSUS,
];

export function getLevelById(id: string): LevelDefinition {
  return LEVELS.find((l) => l.id === id) ?? LEVEL_01_AWAKENING;
}

export function getNextLevelId(currentId: string): string | null {
  const idx = LEVELS.findIndex((l) => l.id === currentId);
  if (idx === -1) return null;
  // If finishing the final gigantic level, repeat it infinitely!
  if (idx === LEVELS.length - 1) {
    return LEVEL_09_ETERNAL_COLOSSUS.id;
  }
  return LEVELS[idx + 1].id;
}
