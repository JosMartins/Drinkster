import { Server, Socket } from 'socket.io';
import * as roomFunctions from './roomFunctions';
import * as gameFunctions from './gameFunctions';
import { GameRoomConfig} from './types/gameRoom';
import { PlayerConfig} from './types/player';
import { findPlayerRoom, findPlayerRoomById } from './stores/gameRoomStore';

const disconnectTimeouts = new Map<string, NodeJS.Timeout>();
const creationCooldowns = new Map<string, number>();
const CREATION_COOLDOWN = 5000;

/**
 * Setup socket handlers for the socket.io server
 * 
 * @param io The socket.io server to setup handlers for
 */
export function setupSocketHandlers(io: Server) {
    gameFunctions.initializeGameFunctions(io);

    io.on('connection', (socket: Socket) => {
        console.log('User connected', socket.id);

        handleReconnection(socket);
        setupSessionHandlers(socket, io);
        setupRoomHandlers(socket, io);
        setupGameplayHandlers(socket);
        setupAdminHandlers(socket, io);
        setupDisconnectHandler(socket, io);
    });

}


/**
 * Setup reconnection handler for socket (reconnection)
 * 
 * @param socket The socket to set up handlers for
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
 * @param socket The socket to set up handlers for
 * @param io The socket.io server to broadcast updates to
 */
function setupRoomHandlers(socket: Socket, io: Server) {
    socket.on('create-room', (config: GameRoomConfig) => {
        console.log('Creating Room', config.roomName);

        // Check existing cooldown
        if (creationCooldowns.has(socket.id)) {
            const lastCreation = creationCooldowns.get(socket.id)!;
            if (Date.now() - lastCreation < CREATION_COOLDOWN) {
                socket.emit('error', 'Wait before creating another room');
                return;
            }
        }

        // Check if already in a room
        if (findPlayerRoom(socket.id)) {
            socket.emit('error', 'Already in a room');
            return;
        }

        // Proceed with room creation
        try {
            creationCooldowns.set(socket.id, Date.now());
            const roomId = roomFunctions.createRoom(config, socket.id);
            const playerRoom = findPlayerRoom(socket.id);

            if (playerRoom?.players) {
                const player = playerRoom.players.find(p => p.socketId === socket.id);
                if (player) {
                    const playerId = player.id;
                    socket.emit('room-created', { roomId, playerId });
                    socket.join(roomId.toString());

                    sendRoomUpdate(io);
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
        console.log('Creating Singleplayer Room ', device[0].name);
        try {
            const roomConf: GameRoomConfig = {
                roomName: `Single_${device[0].name}`,
                private: false,
                playerConfig: device[0],
                singlePlayer: true,
                mode: mod,
                rememberedChallenges: remember,
                showChallenges: true
            }

            const roomId = roomFunctions.createRoom(roomConf, socket.id);

            const playerRoom = findPlayerRoom(socket.id);
            const playerId = playerRoom?.players.find(p => p.socketId === socket.id)?.id;

            socket.emit('room-created', { roomId, playerId });
            socket.join(roomId.toString());
            //Auto Start
            socket.emit('game-started');
            gameFunctions.startGame(roomId, socket.id).then(_ =>
                socket.emit('game-started'));

        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('join-room', (payload) => {
        const { roomId, playerConfig } = payload;
        console.log('Joining Room', roomId);

        const currentRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (currentRooms.length > 0) {
            socket.emit('error', 'Leave current room first');
            return;
        }


        try {
            roomFunctions.joinRoom(roomId, playerConfig, socket.id);
            const playerRoom = findPlayerRoom(socket.id);
            const presistId = playerRoom?.players.find(p => p.socketId === socket.id)?.id;
            socket.emit('room-joined', { roomId, presistId });
            socket.join(roomId.toString());

            // Notify other players in the room that a new player has joined
            socket.to(roomId.toString()).emit('room-update', playerRoom);
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('player-unready', () => {
        debugger;
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Player is either not in a room or in multiple rooms');
            return;
        }

        const roomId = parseInt(rooms[0]);

        console.log('Player Unready', socket.id);
        try {
            roomFunctions.playerUnready(roomId, socket.id);
        } catch (err) {
            socket.emit('error', err);
        }
        sendRoomUpdate(io);
    })

    socket.on('player-unready', () => {
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Player is either not in a room or in multiple rooms');
            return;
        }

        const roomId = parseInt(rooms[0]);

        console.log('Player Unready', socket.id);
        try {
            roomFunctions.playerUnready(roomId, socket.id);
        } catch (err) {
            socket.emit('error', err);
        }
        sendRoomUpdate(io);
    })

    socket.on('player-ready', () => {
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Player is either not in a room or in multiple rooms');
            return;
        }

        const roomId = parseInt(rooms[0]);


        try {
            roomFunctions.playerReady(roomId, socket.id);
            console.log('Player Ready', socket.id);

            // Notify other players in the room that a player has readied
            socket.to(roomId.toString()).emit('room-update', findPlayerRoom(socket.id));
        } catch (err) {
            socket.emit('error', err);
        }
        sendRoomUpdate(io);
    });

    socket.on('player-unready', () => {
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Player is either not in a room or in multiple rooms');
            return;
        }

        const roomId = parseInt(rooms[0]);


        try {
            roomFunctions.playerUnready(roomId, socket.id);
            console.log('Player Ready', socket.id);

            // Notify other players in the room that a player has unready
            socket.to(roomId.toString()).emit('room-update', findPlayerRoom(socket.id));
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('leave-room', () => {
        debugger;
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Player is not in exactly one room');
            return;
        }

        const roomId = parseInt(rooms[0]);

        console.log('Leaving Room', roomId);
        try {
            roomFunctions.leaveRoom(roomId, socket.id);
            sendRoomUpdate(io);
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('get-rooms', () => {
        console.log('Getting room list');
        try {
            const rooms = roomFunctions.listRooms();

            // Map rooms to only include necessary information
            const roomList = rooms
                .filter(room => room.status !== 'finished') // Optionally filter out finished rooms
                .map(room => ({
                    id: room.id,
                    name: room.name,
                    playerCount: room.players.length,
                    status: room.status,
                    isPrivate: room.private
                }));

            socket.emit('room-list', roomList);
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('get-room', (roomId: number) => {
        console.log('Getting room info', roomId);
        try {
            const room = roomFunctions.getRoomById(roomId, socket.id);

            // Map room to only include necessary information
            const roomInfo = {
                id: room.id,
                name: room.name,
                players: room.players,
                mode: room.mode,
                rememberedChallenges: room.rememberedChallenges,
                showChallenges: room.showChallenges,
                status: room.status,
            };

            socket.emit('room-info', roomInfo);

        } catch (err) {
            socket.emit('error', err);
        }
    });
}

/**
 * Setup gameplay handlers for socket (challenge-completed, challenge-skipped)
 * 
 * @param socket The socket to set up gameplay handlers for
 */
function setupGameplayHandlers(socket: Socket) {

    // Game start handler
    socket.on('game-start', () => {
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) return;

        const roomId = parseInt(rooms[0]);

        try {
            gameFunctions.startGame(roomId, socket.id).then(_ =>
                socket.to(roomId.toString()).emit('game-started'));
        }
        catch (err) {
            socket.emit('error', err);
        }
    });

    // Challenge completion handlers
    socket.on('challenge-completed', async () => {
        // Get the room this socket is in
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Player is not in exactly one room');
            return;
        }

        const roomId = parseInt(rooms[0]);

        try {
            // Handle when player completes a challenge
            await gameFunctions.completedChallenge(roomId, socket.id, false);
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('challenge-drunk', async () => {
        // Get the room this socket is in
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Player is not in exactly one room');
            return;
        }

        const roomId = parseInt(rooms[0]);

        try {
            // Handle when player completes a challenge
            await gameFunctions.completedChallenge(roomId, socket.id, true);
        } catch (err) {
            socket.emit('error', err);
        }
    });
}

/**
 * Setup Admin handlers for socket (admin-remove, admin-update, admin-skip)
 * 
 * @param socket The socket to set up admin handlers for
 * @param io The socket.io server to broadcast updates to
 */
function setupAdminHandlers(socket: Socket, io: Server) {
    socket.on('admin-remove-player', (playerId: string) => {
        // Get the room this socket is in
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Admin is not in exactly one room');
            return;
        }

        const roomId = parseInt(rooms[0]);

        try {
            roomFunctions.removePlayerFromRoom(roomId, playerId, socket.id);

            sendRoomUpdate(io);
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('admin-update-difficulty', (roomId: number,playerId: string, difficultyValues: any) => {
        debugger;
        // Get the room this socket is in

        try {
            gameFunctions.updatePlayerDifficulty(roomId, playerId, difficultyValues);
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('admin-force-skip', async () => {
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

    socket.on('admin-end-game', async () => {
        debugger;
        // Get the room this socket is in
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (rooms.length !== 1) {
            socket.emit('error', 'Admin is not in exactly one room');
            return;
        }

        const roomId = parseInt(rooms[0]);

        try {
            gameFunctions.endGame(roomId, socket.id);
        } catch (err) {
            socket.emit('error', err);
        }
    })
}

/**
 * Setup disconnect handler for socket (disconnect)
 * 
 * @param socket The socket to set up disconnect handler for
 * @param io The socket.io server to broadcast updates to
 */
function setupDisconnectHandler(socket: Socket, io: Server) {
    socket.on('disconnect', () => {
        
        // Store the player's persistent ID before removal
        const playerRoom = findPlayerRoom(socket.id);
        const playerId = playerRoom?.players.find(p => p.socketId === socket.id)?.id;

        
        const timeout = setTimeout(() => {
            console.log(`Removing user ${socket.id} from room after inactivity`);
            roomFunctions.removeUserFromRooms(socket.id);
            
            if (playerRoom?.players.length === 0) {
                // Destroy room if last player disconnects
                roomFunctions.deleteRoom(playerRoom.id);
            }
            disconnectTimeouts.delete(socket.id);
            sendRoomUpdate(io);
        }, 5 * 60 * 1000);

        // Use player ID as key if available, otherwise socket ID
        disconnectTimeouts.set(playerId ?? socket.id, timeout);
    });
}

/**
 * Setup session handlers for socket (restore-session)
 *
 * @param socket The socket to set up session handlers for
 * @param io The socket.io server to broadcast updates to
 */
function setupSessionHandlers(socket: Socket, io: Server) {
    socket.on('restore-session', (sessionId: string) => {

        console.log('Restoring session', sessionId);

        if (disconnectTimeouts.has(sessionId)) {
            clearTimeout(disconnectTimeouts.get(sessionId));
            disconnectTimeouts.delete(sessionId);
        }

        const playerRoom = findPlayerRoomById(sessionId);

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

            sendRoomUpdate(io)

        } else {
            socket.emit('session-not-found');
        }
    });
}

/// HELPERS ///

function sendRoomUpdate(io: Server) {
    // Get updated room list
    const rooms = roomFunctions.listRooms();

    // Map rooms to only include necessary information for clients
    const roomList = rooms
        .filter(room => room.status !== 'finished')
        .map(room => ({
            id: room.id,
            name: room.name,
            playerCount: room.players.length,
            status: room.status,
            isPrivate: room.private
        }));

    // Broadcast the updated room list to all clients
    io.emit('room-update', roomList);
}
