export interface RoomListDto {
  rooms: RoomListItemDto[];
}

interface RoomListItemDto {
  id: string;
  name: string;
  isPrivate: boolean;
  players: number;
  state: string;
}
