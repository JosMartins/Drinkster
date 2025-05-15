import {Difficulty} from "./difficulty";

export interface PlayerConfig {
  name: string;
  sex: string;
  difficulty_values: Difficulty;
}


export interface RoomConfig {
  name: string;
  isPrivate: boolean
  password: string,
  player: PlayerConfig,
  mode: string,
  rememberCount: number,
  showChallenges: boolean
}
