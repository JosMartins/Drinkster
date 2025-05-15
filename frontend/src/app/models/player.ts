import { Difficulty } from './difficulty';

export interface Player {
  id: string;
  name: string;
  sex: 'M' | 'F';
  difficulty_values?: Difficulty;
}
