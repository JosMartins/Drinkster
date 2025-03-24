import { Difficulty } from './difficulty';

export interface Player {
  name: string;
  gender: 'M' | 'F';
  difficulty?: Difficulty;
}
