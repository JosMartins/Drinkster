import {Player} from "../player";
import {Challenge} from "../challenge";


export interface SessionData {
  self: Player;
  room: GameRoom;
  penalties: Penalty[];
  playerTurn?: Challenge;
}

export interface SessionError {
  code: number;
  message: string;
}
