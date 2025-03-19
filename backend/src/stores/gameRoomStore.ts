import { GameRoom } from "../types/gameRoom";

export const gameRooms = new Map<number, GameRoom>();

export function addRoom(room: GameRoom) {
    gameRooms.set(room.id, room);
}

export function getRoom(id: number) {
    return gameRooms.get(id);
}

export function removeRoom(id: number) {
    gameRooms.delete(id);
}

export function getRooms() {
    return Array.from(gameRooms.values());
}

export function roomExists(id: number) {
    return gameRooms.has(id);
}

export function findPlayerRoom(sockId: string): GameRoom | null {
    for (const room of gameRooms.values()) {
        for (const player of room.players) {
            if (player.id === sockId) {
                return room;
            }
        }
    }
    return null;
}

export function removePlayerFromRoom(room: GameRoom, playerId: string) {
    room.players = room.players.filter(player => player.id !== playerId);
}