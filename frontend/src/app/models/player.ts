import { Difficulty } from './difficulty';

export interface Player {
  id: string;
  name: string;
  gender: 'M' | 'F';
  difficulty?: Difficulty;
}
