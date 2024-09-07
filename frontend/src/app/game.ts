import { Player } from './player';
import {Difficulty} from "./difficulty";

export interface Game {
  players: Player[];
  extremeMode: boolean;
  difficultyValues: Difficulty;
  remembered: number;
}
