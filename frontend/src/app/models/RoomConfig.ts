import {Difficulty} from "./difficulty";

export interface PlayerConfig {
  name: string;
  sex: string;
  difficulty_values: Difficulty;
}


export interface RoomConfig {
  roomName: string;
  private: boolean
  password: string,
  playerConfig: PlayerConfig,
  mode: string,
  rememberedChallenges: number,
  showChallenges: boolean
}
