import { LEVEL_01_AWAKENING } from './Level01Awakening';
import { LEVEL_02_MONOLITHS } from './Level02Monoliths';
import { LEVEL_03_ASCENSION } from './Level03Ascension';
import type { LevelDefinition } from './LevelTypes';

export const LEVELS: LevelDefinition[] = [
  LEVEL_01_AWAKENING,
  LEVEL_02_MONOLITHS,
  LEVEL_03_ASCENSION,
];

export function getLevelById(id: string): LevelDefinition {
  return LEVELS.find((l) => l.id === id) ?? LEVEL_01_AWAKENING;
}

export function getNextLevelId(currentId: string): string | null {
  const idx = LEVELS.findIndex((l) => l.id === currentId);
  if (idx === -1 || idx + 1 >= LEVELS.length) return null;
  return LEVELS[idx + 1].id;
}
