/**
 * Class Level Utilities
 * Maps between level numbers and level names
 * Levels: KG 1 (0), KG 2 (1), Basic 1 (2) - Basic 9 (10)
 */

export const LEVEL_NAMES = [
  'KG 1',
  'KG 2',
  'Basic 1',
  'Basic 2',
  'Basic 3',
  'Basic 4',
  'Basic 5',
  'Basic 6',
  'Basic 7',
  'Basic 8',
  'Basic 9',
] as const;

export const LEVEL_MAP: Record<string, number> = {
  'KG 1': 0,
  'KG 2': 1,
  'Basic 1': 2,
  'Basic 2': 3,
  'Basic 3': 4,
  'Basic 4': 5,
  'Basic 5': 6,
  'Basic 6': 7,
  'Basic 7': 8,
  'Basic 8': 9,
  'Basic 9': 10,
};

export const REVERSE_LEVEL_MAP: Record<number, string> = {
  0: 'KG 1',
  1: 'KG 2',
  2: 'Basic 1',
  3: 'Basic 2',
  4: 'Basic 3',
  5: 'Basic 4',
  6: 'Basic 5',
  7: 'Basic 6',
  8: 'Basic 7',
  9: 'Basic 8',
  10: 'Basic 9',
};

export function getLevelName(level: number): string {
  return REVERSE_LEVEL_MAP[level] || 'Unknown';
}

export function getLevelNumber(levelName: string): number {
  return LEVEL_MAP[levelName] ?? 0;
}

export function isHighestLevel(level: number): boolean {
  return level === 10; // Basic 9 is the highest
}

export function getNextLevel(level: number): number | null {
  if (level >= 10) return null; // Basic 9 is the highest
  return level + 1;
}

export function getNextLevelName(level: number): string | null {
  const nextLevel = getNextLevel(level);
  return nextLevel !== null ? getLevelName(nextLevel) : null;
}

/**
 * Maps a class level number to its corresponding level category
 * @param level Class level (0-10)
 * @returns Level category: 'KG', 'Lower Primary', 'Upper Primary', or 'JHS'
 */
export function getLevelCategory(level: number): 'KG' | 'Lower Primary' | 'Upper Primary' | 'JHS' {
  if (level <= 1) return 'KG'; // KG 1 (0), KG 2 (1)
  if (level <= 4) return 'Lower Primary'; // Basic 1 (2), Basic 2 (3), Basic 3 (4)
  if (level <= 7) return 'Upper Primary'; // Basic 4 (5), Basic 5 (6), Basic 6 (7)
  return 'JHS'; // Basic 7 (8), Basic 8 (9), Basic 9 (10)
}
