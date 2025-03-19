import { addRoom, findPlayerRoom, roomExists } from "./stores/gameRoomStore";
import { GameRoom , GameRoomConfig } from "./types/gameRoom";
import { Player, PlayerConfig } from "./types/player";

export function createRoom(roomConf: GameRoomConfig, sockId: string): number  {
    console.log("Creating room with config: ", roomConf);

    // Input Validation
    if (!roomConf.roomName) {
        throw new Error('Room name is required');
    }
    if (!roomConf.playerConfig) {
        throw new Error('Player is required');
    }

    if (roomConf.private && !roomConf.password) {
        throw new Error('Password is required for private rooms');
    }

    let roomId: number;

    do {
        roomId = generateRandomRoomId();
    }
    while (roomExists(roomId));

    let owner : Player = {
        id: sockId,
        name: roomConf.playerConfig.name,
        sex: roomConf.playerConfig.sex,
        difficulty_values: roomConf.playerConfig.difficulty_values,
        isAdmin: true,
        isReady: false,
        isPlaying: false,
    }

    let room : GameRoom = {
        id: roomId,
        name: roomConf.roomName,
        private: roomConf.private,
        password: roomConf.private ? roomConf.password : undefined,
        admin: owner,
        players: [ owner ],
        status: 'waiting',
        createdAt: new Date(),
    };

    addRoom(room);

    return room.id;
}


export function joinRoom(roomId: number, player: PlayerConfig, sockId: string): void {
    
    //Validate input
    if (!roomId) {
        throw new Error('Room ID is required');
    }
    if (!player) {
        throw new Error('Player is required');
    }

    if (!sockId) {
        throw new Error('Socket ID is required');
    }

    if (player.name === '' || player.name === undefined) {
        throw new Error('Player name is required');
    }

    if (!player.sex) {
        throw new Error('Player sex is required');
    }


    if (!player.difficulty_values.easy || !player.difficulty_values.medium || !player.difficulty_values.hard) {
        throw new Error('Player difficulty values are required');
    }

    if (!roomExists(roomId)) {
        throw new Error('Room does not exist');
    }

    let newPlayer : Player = {
        id: sockId,
        name: player.name,
        sex: player.sex,
        difficulty_values: player.difficulty_values,
        isAdmin: false,
        isReady: false,
        isPlaying: false,
    }

    console.log('Player',newPlayer.id, 'Joining Room ', roomId);

}


/**
 * Removes a user from all rooms they are part of
 * @param socketId The socket ID of the user to remove
 * @returns Array of room IDs the user was removed from
 */
export function removeUserFromRooms(socketId: string): number[] {
    const affectedRooms: number[] = [];
    
    // Iterate through all rooms to find the user
    let room = findPlayerRoom(socketId);
    
    if (room) {
        // Remove the user from the room
        room.players = room.players.filter(player => player.id !== socketId);
        affectedRooms.push(room.id);
    }
    return affectedRooms;
}


/*****HELPERS*****/

/**
 * Generates a random room ID consisting of 4 digits
 * @returns A string containing a 4-digit room ID
 */
function generateRandomRoomId(): number {
    // Generate a number between 1000 and 9999
    const roomId = Math.floor(1000 + Math.random() * 9000);
    return roomId;
}