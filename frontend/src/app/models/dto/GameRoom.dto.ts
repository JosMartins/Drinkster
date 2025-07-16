import {PlayerDto} from "./player.dto";

export interface GameRoomDto {
  roomId: string;
  roomName: string;
  isPrivate: boolean;
  players: PlayerDto[];
  roomState: string;
  roomMode: string;
  rememberedChallenges: number;
  adminId: string;
}
