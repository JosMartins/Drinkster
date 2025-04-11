import { getRoom } from "./stores/gameRoomStore";
import { DifficultyValues } from "./types/player";
import { Game } from "./types/game";
import { Server } from "socket.io";


let activeGames = new Map<number, Game>();
let io: Server; //send game updates to all players

export function initializeGameFunctions(socketServer: Server) {
    io = socketServer;
    activeGames = new Map<number, Game>();
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
    let game = new Game(
        room.players,
        room.rememberedChallenges,
        room.mode,
        room.id,
        room.showChallenges
    );
    await game.initialize(io);
    room.game = game;
    room.status = 'playing';

    room.game = game as Omit<Game, 'players'|'roomId'>;

    activeGames.set(room.id, game);

    return {
        currentPlayerId: game.currentTurn.playerId,
        challenge: game.currentTurn.challenge
    };
}

/**
 * Ends the game in the given room.
 * 
 * @param roomId the ID of the room to end the game in
 * @param sockId the ID of the socket of the player ending the game
 *
 * @throws Error if the room is not found
 * @throws Error if the game is not currently playing
 * 
 */
export function endGame(roomId: number, sockId: string) {
    
    const room = getRoom(roomId);

    if (!room) {
        throw new Error('Room not found');
    }

    if (room.status !== 'playing') {
        throw new Error('Game is not currently playing');
    }

    if (room.admin.socketId !== sockId) {
        throw new Error('Only the admin can end the game');
    }

    if (!room.game) {
        throw new Error('Game not found');
    }

    room.status = 'finished';
    room.game = undefined;
    activeGames.delete(room.id);
}

export function getGame(roomId: number) {
    const room = getRoom(roomId);

    if (!room) {
        throw new Error('Room not found');
    }

    if (!room.game) {
        throw new Error('Game not found');
    }

    return room.game;
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

    const sum = difficultyValues.easy + difficultyValues.medium + difficultyValues.hard + difficultyValues.extreme;
    const epsilon = 0.00001;

    if (Math.abs(sum - 1) > epsilon) {
        throw new Error('Difficulty values must sum to 100%');
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

    let game = activeGames.get(room.id);
    if (!game) {
        throw new Error('Game not found');
    }

    //Skip here
    await game.nextTurn();
}


/**
 * Moves the game to the next challenge in the given room.
 * 
 * @param roomId the ID of the room to skip the challenge in
 * @param sockId the ID of the player causing the skip (must be the current player)
 * 
 * @throws Error if the room is not found
 * @throws Error if the player is not found
 * @throws Error if the player is not the current player
 */
export async function completedChallenge(roomId: number, sockId: string) {

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

    await room.game.handleChallengeCompletion(true);

    return {
        nextPlayerId: room.game.currentTurn.playerId,
        challenge: room.game.currentTurn.challenge,
    }
    
}


