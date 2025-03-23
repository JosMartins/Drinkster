export const DEFAULT_DIFFICULTY: Difficulty = { easy: 0.3, medium: 0.35, hard: 0.35, extreme: 0 };

export interface Difficulty {
  easy: number;
  medium: number;
  hard: number;
  extreme: number;
}


export function getDifficultyWord(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return 'Easy';
    case 2:
      return 'Medium';
    case 3:
      return 'Hard';
    case 4:
      return 'Extreme';
    default:
      return 'None';
  }
}
