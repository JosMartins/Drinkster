import {PlayerDto} from "./player.dto";
import {ChallengeDto} from "./Challenge.dto";
import {PenaltyDto} from "./Penalty.dto";

export interface ChallengeResponseDto {
  challenge: ChallengeDto
  affectedPlayers: PlayerDto[];
  round: number;
  penaltyList: PenaltyDto[];
}
