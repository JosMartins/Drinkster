import {ChallengeDto} from "./Challenge.dto";

export interface PlayerDto {
  id: string;
  name: string;
  sex: string;
  isAdmin: boolean;
  isReady: boolean;
  isPlaying?: boolean

}

export interface PlayerTurnDto {
  player: PlayerDto;
  challenge: ChallengeDto
  affectedPlayers: PlayerDto[];
}
