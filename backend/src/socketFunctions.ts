import { Server, Socket } from 'socket.io';
import * as roomFunctions from './roomFunctions';
import * as gameFunctions from './gameFunctions';
import { GameRoomConfig } from './types/gameRoom';
import { PlayerConfig } from './types/player';
import { findPlayerRoom } from './stores/gameRoomStore';

const disconnectTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Setup socket handlers for the socket.io server
 * 
 * @param io The socket.io server to setup handlers for
 */
export function setupSockethandlers(io: Server) {
    gameFunctions.initializeGameFunctions(io);

    io.on('connection', (socket: Socket) => {
        console.log('User connected', socket.id);

        handleReconnection(socket);
        setupSessionHandlers(socket);
        setupRoomHandlers(socket);
        setupGameplayHandlers(socket);
        setupAdminHandlers(socket);
        setupDisconnectHandler(socket);
    });

}


/**
 * Setup reconnection handler for socket (reconnection)
 * 
 * @param socket The socket to setup handlers for
 */
function handleReconnection(socket: Socket) {
    if (disconnectTimeouts.has(socket.id)) {
        clearTimeout(disconnectTimeouts.get(socket.id));
        disconnectTimeouts.delete(socket.id);
        console.log(`Cleared timeout for reconnected user ${socket.id}`);
    }
}

/**
 * Setup room handlers for socket (create-room, join-room)
 * 
 * @param socket The socket to setup handlers for
 */
function setupRoomHandlers(socket: Socket) {
    socket.on('create-room', (config: GameRoomConfig) => {
        debugger;
        console.log('Creating Room', config.roomName);

        try {
            const roomId = roomFunctions.createRoom(config, socket.id);
            const playerRoom = findPlayerRoom(socket.id);

            if (playerRoom?.players) {
                const player = playerRoom.players.find(p => p.socketId === socket.id);
                if (player) {
                    const playerId = player.id;
                    socket.emit('room-created', roomId, playerId);
                    socket.join(roomId.toString());
                } else {
                    socket.emit('error', 'Player not found in room');
                }
            } else {
                socket.emit('error', 'Player room not found');
            }

        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('create-singleplayer', (device: PlayerConfig[], mod, remember) => {
        debugger;
        console.log('Creating Singleplayer Room ', device[0].name);
        try {
            const roomConf: GameRoomConfig = {
                roomName: `Single_${device[0].name}`,
                private: false,
                playerConfig: device[0],
                singleplayer: true,
                mode: mod,
                rememberedChallenges: remember,
                showChallenges: true
            }

            const roomId = roomFunctions.createRoom(roomConf, socket.id);

            const playerRoom = findPlayerRoom(socket.id);
            const playerId = playerRoom?.players.find(p => p.socketId === socket.id)?.id;
    
            socket.emit('room-created', roomId, playerId);
            socket.join(roomId.toString());
            //Auto Start
            socket.emit('game-started');
            gameFunctions.startGame(roomId, socket.id);

        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('join-room', (roomId: number, player: PlayerConfig) => {
        debugger;
        console.log('Joining Room', roomId);
        try {
            roomFunctions.joinRoom(roomId, player, socket.id);
            const playerRoom = findPlayerRoom(socket.id);
            const presistId = playerRoom?.players.find(p => p.socketId === socket.id)?.id;
            socket.emit('room-joined', presistId);
            socket.join(roomId.toString());
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('player-ready', () => {
        debugger;
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Player is either not in a room or in multiple rooms');
            return;
        }

        const roomId = parseInt(rooms[0]);

        console.log('Player Ready', socket.id);
        try {
            roomFunctions.playerReady(roomId, socket.id);
        } catch (err) {
            socket.emit('error', err);
        }
    }
    );
}

/**
 * Setup gameplay handlers for socket (challenge-completed, challenge-skipped)
 * 
 * @param socket The socket to setup gameplay handlers for
 */
function setupGameplayHandlers(socket: Socket) {

    // Game start handler
    socket.on('game-start', () => {
        debugger;
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) return;

        const roomId = parseInt(rooms[0]);

        try {
            gameFunctions.startGame(roomId, socket.id);
            socket.to(roomId.toString()).emit('game-started');
        }
        catch (err) {
            socket.emit('error', err);
        }
    });

    // Challenge completion handlers
    socket.on('challenge-completed', async () => {
        debugger;
        // Get the room this socket is in
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Player is not in exactly one room');
            return;
        }

        const roomId = parseInt(rooms[0]);

        try {
            // Handle when player completes a challenge
            gameFunctions.completedChallenge(roomId, socket.id, false);
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('challenge-drinked', async () => {
        debugger;
        // Get the room this socket is in
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Player is not in exactly one room');
            return;
        }

        const roomId = parseInt(rooms[0]);

        try {
            // Handle when player completes a challenge
            gameFunctions.completedChallenge(roomId, socket.id, true);
        } catch (err) {
            socket.emit('error', err);
        }
    });
}

/**
 * Setup Admin handlers for socket (admin-remove, admin-update, admin-skip)
 * 
 * @param socket The socket to setup admin handlers for
 */
function setupAdminHandlers(socket: Socket) {
    socket.on('admin-remove-player', (playerId: string) => {
        debugger;
        // Get the room this socket is in
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Admin is not in exactly one room');
            return;
        }

        const roomId = parseInt(rooms[0]);

        try {
            roomFunctions.removePlayerFromRoom(roomId, playerId, socket.id);
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('admin-update-difficulty', (playerId: string, difficultyValues: any) => {
        debugger;
        // Get the room this socket is in
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Admin is not in exactly one room');
            return;
        }

        const roomId = parseInt(rooms[0]);

        try {
            gameFunctions.updatePlayerDifficulty(roomId, playerId, difficultyValues);
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('admin-force-skip', async () => {
        debugger;
        // Get the room this socket is in
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Admin is not in exactly one room');
            return;
        }

        const roomId = parseInt(rooms[0]);

        try {
            await gameFunctions.forcedSkipChallenge(roomId, socket.id);
        } catch (err) {
            socket.emit('error', err);
        }
    });
}

/**
 * Setup disconnect handler for socket (disconnect)
 * 
 * @param socket The socket to setup disconnect handler for
 */
function setupDisconnectHandler(socket: Socket) {
    socket.on('disconnect', () => {
        // Store the player's persistent ID before removal
        const playerRoom = findPlayerRoom(socket.id);
        const playerId = playerRoom?.players.find(p => p.socketId === socket.id)?.id;
        
        console.log('User disconnected ', socket.id);
        const timeout = setTimeout(() => {
            console.log(`Removing user ${socket.id} from room after inactivity`);
            roomFunctions.removeUserFromRooms(socket.id);
            disconnectTimeouts.delete(socket.id);
        }, 60 * 60 * 1000);
        
        // Use player ID as key if available, otherwise socket ID
        disconnectTimeouts.set(playerId ?? socket.id, timeout);
    });
}

function setupSessionHandlers(socket: Socket) {
    socket.on('restore-session', (sessionId: string) => {
        debugger;
        console.log('Restoring session', sessionId);

        if (disconnectTimeouts.has(sessionId)) {
            clearTimeout(disconnectTimeouts.get(sessionId));
            disconnectTimeouts.delete(sessionId);
        }
        
        const playerRoom = findPlayerRoom(sessionId);

        if (playerRoom) {
            const player = playerRoom.players.find(p => p.id === sessionId);
            if (player) {
                player.socketId = socket.id;


                socket.join(playerRoom.id.toString());
                socket.emit('session-restored', {
                    roomId: playerRoom.id,
                    players: playerRoom.players,
                    isAdmin: player.isAdmin,
                    status: playerRoom.status
                });

                console.log(`Session restored for player ${sessionId} in room ${playerRoom.id}`);
                return;
            }

        } else {
            socket.emit('session-not-found');
        }
    });
}