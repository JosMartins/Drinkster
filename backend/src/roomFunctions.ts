import { addRoom, findPlayerRoom, roomExists, getRoom } from "./stores/gameRoomStore";
import { GameRoom, GameRoomConfig } from "./types/gameRoom";
import { Player, PlayerConfig } from "./types/player";


/**
 * Creates a new room with the given configuration and given player as the owner & admin.
 * 
 * @param roomConf the room configuration
 * @param sockId the socket ID of the player creating the room
 * 
 * @returns the room ID of the created room
 * @throws Error if room configuration is invalid
 * @throws Error if player configuration is invalid
 */
export function createRoom(roomConf: GameRoomConfig, sockId: string): number {
    console.log("Creating room with config: ", roomConf);

    // Input Validation
    verifyRoomInput(roomConf);

    let roomId: number;

    do {
        roomId = generateRandomRoomId();
    }
    while (roomExists(roomId));

    let owner: Player = {
        id: sockId,
        name: roomConf.playerConfig.name,
        sex: roomConf.playerConfig.sex,
        difficulty_values: roomConf.playerConfig.difficulty_values,
        isAdmin: true,
        isReady: false,
        isPlaying: false,
    }

    let room: GameRoom = {
        id: roomId,
        name: roomConf.roomName,
        private: roomConf.private,
        password: roomConf.private ? roomConf.password : undefined,
        admin: owner,
        players: [owner],
        status: 'waiting',
        createdAt: new Date(),
        mode: roomConf.mode,
        rememberedChallenges: roomConf.rememberedChallenges,
        showChallenges: roomConf.showChallenges
    };

    addRoom(room);

    return room.id;
}


/**
 * Joins a player to a room with the given room ID.
 * 
 * @param roomId the room ID to join 
 * @param player the player to join the room
 * @param sockId the socket ID of the player 
 * 
 * @throws Error if room does not exist
 * @throws Error if player input is invalid
 */
export function joinRoom(roomId: number, player: PlayerConfig, sockId: string): void {

    //Validate input
    verifyPlayerInput(player);

    let room = getRoom(roomId);

    if (!room || room.status !== 'waiting') {
        throw new Error('Game has already started.');

    }
    let newPlayer: Player = {
        id: sockId,
        name: player.name,
        sex: player.sex,
        difficulty_values: player.difficulty_values,
        isAdmin: false,
        isReady: false,
        isPlaying: false,
    }

    room.players.push(newPlayer);
    console.log('Player', newPlayer.id, 'Joining Room ', roomId);
    
}

/**
 * Removes a player from a room
 * 
 * @param roomId the room ID to remove the player from
 * @param playerId the player ID to remove from the room
 * @param adminId the admin ID of the room
 * 
 * @throws Error if room is not found
 * @throws Error if player is not found in room
 * @throws Error if admin is not the one removing the player
 * @throws Error if admin tries to remove themselves
 */
export function removePlayerFromRoom(roomId: number, playerId: string, adminId: string) {
    let room = getRoom(roomId);
    if (!room) {
        throw new Error('Room not found');
    }

    if (room.admin.id !== adminId) {
        throw new Error('Only the admin can remove players');
    }

    if (room.admin.id === playerId) {
        throw new Error('Admin cannot remove themselves');
    }

    if (room.players.filter(player => player.id === playerId).length === 0) {
        throw new Error('Player not found in room');
    }

    room.players = room.players.filter(player => player.id !== playerId);
}


/**
 * Removes a user from all rooms they are part of
 * 
 * @param socketId The socket ID of the user to remove
 * 
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

/**
 * Marks a player as ready in a room
 * 
 * @param roomId the room where the player is to be marked as ready
 * @param playerId the player to be marked as ready
 * 
 * @throws Error if player is not found in room
 * @throws Error if room is not found
 */
export function playerReady(roomId: number, playerId: string) {
    let room = getRoom(roomId);
    if (!room) {
        throw new Error('Room not found');
    }

    let player = room.players.find(player => player.id === playerId);

    if (!player) {
        throw new Error('Player not found in room');
    }
    player.isReady = true;

}

/*****HELPERS*****/


/**
 * Generates a random room ID consisting of 4 digits
 * 
 * @returns A string containing a 4-digit room ID
 */
function generateRandomRoomId(): number {
    // Generate a number between 1000 and 9999
    const roomId = Math.floor(1000 + Math.random() * 9000);
    return roomId;
}


/**
 * Verifies that the room input is valid.
 * 
 * @param roomConf the room to verify
 * 
 * @throws Error if room name is not provided
 * @throws Error if player is not provided
 * @throws Error if password is not provided for private rooms
 * @throws Error if mode is not provided
 * @throws Error if remembered challenges is not provided or is invalid
 * @throws Error if player name is not provided
 */
function verifyRoomInput(roomConf: GameRoomConfig) {

    if (!roomConf.roomName) {
        throw new Error('Room name is required');
    }
    if (!roomConf.playerConfig) {
        throw new Error('Player is required');
    }

    if (roomConf.private && !roomConf.password) {
        throw new Error('Password is required for private rooms');
    }

    if (!roomConf.mode) {
        throw new Error('Mode is required');
    }

    if (!roomConf.rememberedChallenges || roomConf.rememberedChallenges < 0 || roomConf.rememberedChallenges > 500) {
        throw new Error('Invalid number of remembered challenges. Must be between 0 and 500.');
    }

    verifyPlayerInput(roomConf.playerConfig);

}


/**
 * Verifies that the player input is valid
 * 
 * @param player the player to verify
 * 
 * @throws Error if player name is not provided
 * @throws Error if player sex is not provided
 * @throws Error if player difficulty values are not provided
 */
function verifyPlayerInput(player: PlayerConfig) {

    if (!player.name) {
        throw new Error('Player name is required');
    }

    if (!player.sex) {
        throw new Error('Player sex is required');
    }

    if (!player.difficulty_values.easy || !player.difficulty_values.medium || !player.difficulty_values.hard) {
        throw new Error('Player difficulty values are required');
    }

}