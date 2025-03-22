import { getRoom } from "./stores/gameRoomStore";
import { DifficultyValues } from "./types/player";
import { Game } from "./types/game";
import { Server } from "socket.io";


let game: Game;
let io: Server; //send game updates to all players

export function initializeGameFunctions(socketServer: Server) {
    io = socketServer;
}

/**
 * Starts the game in the given room.
 * 
 * @param roomId the ID of the room to start the game in
 * @param adminSocketId the ID of the socket of the player starting the game
 * 
 * @throws Error if the room is not found
 * @throws Error if not all players are ready
 * @throws Error if the game is already playing
 * @throws Error if the adminId is not the admin of the room
 * 
 */
export async function startGame(roomId: number, adminSocketId: string) {

    //check if all players are ready
    const room = getRoom(roomId);

    if (!room) {
        throw new Error('Room not found');
    }

    if (room.admin.socketId !== adminSocketId) {
        throw new Error('Only the admin can start the game');
    }

    if (room.status === 'playing') {
        throw new Error('Game is already playing');
    }

    for (const player of room.players) {
        if (!player.isReady) {
            throw new Error('Not all players are ready');
        }
    }

    //create and start game
    game = new Game(room);
    await game.initialize(io);
    room.game = game;
    room.status = 'playing';

    return {
        currentPlayerId: game.currentTurn.playerId,
        challenge: game.currentTurn.challenge
    };
}

/**
 * Ends the game in the given room.
 * 
 * @param roomId the ID of the room to end the game in
 * 
 * @throws Error if the room is not found
 * @throws Error if the game is not currently playing
 * 
 */
export function endGame(roomId: number) {
    
    const room = getRoom(roomId);

    if (!room) {
        throw new Error('Room not found');
    }

    if (room.status !== 'playing') {
        throw new Error('Game is not currently playing');
    }

    room.status = 'finished';
    room.game = undefined;
}

/**
 * Updates the difficulty values for a player in a room.
 * 
 * @param roomId the ID of the room the player is in
 * @param playerId the ID of the player to update the difficulty values for
 * @param difficultyValues the new difficulty values for the player
 * 
 * @throws Error if the room is not found
 * @throws Error if the player is not found
 * @throws Error if the difficulty values are not valid
 */
export function updatePlayerDifficulty(roomId: number, playerId: string, difficultyValues: DifficultyValues) {

    const room = getRoom(roomId);

    if (!room) {
        throw new Error('Room not found');
    }

    const player = room.players.find(player => player.id === playerId);

    if (!player) {
        throw new Error('Player not found');
    }

    if (difficultyValues.easy + difficultyValues.medium + difficultyValues.hard !== 100 || 
        difficultyValues.easy + difficultyValues.medium + difficultyValues.hard !== 100 + difficultyValues.extreme
    ) {
        throw new Error('Difficulty values must sum to 100');

    }


    player.difficulty_values = difficultyValues;

}

/**
 * Forces the game to skip the current challenge in the given room.
 * 
 * @param roomId the ID of the room to skip the challenge in
 * @param adminSocketId the ID of the player forcing the skip (must be the admin)
 * 
 * @throws Error if the room is not found
 * @throws Error if the adminId is not the admin of the room
 */
export async function forcedSkipChallenge(roomId: number, adminSocketId: string) {
    //Admin can force skip a challenge

    const room = getRoom(roomId);

    if (!room) {
        throw new Error('Room not found');
    }

    if (room.admin.socketId !== adminSocketId) {
        throw new Error('Only the admin can force skip a challenge');
    }

    //Skip here
    await game.nextTurn();
}


/**
 * Moves the game to the next challenge in the given room.
 * 
 * @param roomId the ID of the room to skip the challenge in
 * @param sockId the ID of the player causing the skip (must be the current player)
 * @param drinked whether the player drinked or not
 * 
 * @throws Error if the room is not found
 * @throws Error if the player is not found
 * @throws Error if the player is not the current player
 */
export async function completedChallenge(roomId: number, sockId: string, drinked: boolean) {

    const room = getRoom(roomId);

    if (!room) {
        throw new Error('Room not found');
    }

    const player = room.players.find(player => player.socketId === sockId);

    if (!player) {
        throw new Error('Player not found');
    }

    if (!room.game) {
        throw new Error('Game not found');
    }

    if (room.game.getCurrentPlayer() !== player) {
        throw new Error('Player is not the current player');
    }

    if (drinked) {
        room.game.stats.drinkedChallenges++;
        room.game.stats.totalDrinked++;
    } else {
        room.game.stats.completedChallenges++;
    }

    room.game.stats.totalRounds++;

    await room.game.nextTurn();

    return {
        nextPlayerId: room.game.currentTurn.playerId,
        challenge: room.game.currentTurn.challenge,
    }
    
}


