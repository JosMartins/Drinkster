export const DEFAULT_DIFFICULTY: Difficulty = { easy: 0.3, medium: 0.35, hard: 0.35, extreme: 0 };
export interface Difficulty {
  easy: number;
  medium: number;
  hard: number;
  extreme: number;
}
