import {PlayerDto, PlayerTurnDto} from "./player.dto";
import {GameRoomDto} from "./GameRoom.dto";
import {PenaltyDto} from "./Penalty.dto";

export interface SessionData {
  self: PlayerDto;
  room: GameRoomDto;
  penalties: PenaltyDto[];
  playerTurn: PlayerTurnDto;
}
