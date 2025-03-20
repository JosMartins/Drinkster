import { Server, Socket } from 'socket.io';
import * as roomFunctions from './roomFunctions';
import * as gameFunctions from './gameFunctions';
import { GameRoomConfig } from './types/gameRoom';
import { PlayerConfig } from './types/player';

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
            socket.emit('room-created', roomId);
            socket.join(roomId.toString());
        } catch (err) {
            socket.emit('error', err);
        }
    });

    socket.on('create-singleplayer', (device: PlayerConfig[]) => {
        debugger;
        console.log('Creating Singleplayer Room ', device[0].name);
        try {
            const roomConf: GameRoomConfig = {
                roomName: `Single_${device[0].name}`,
                private: false,
                playerConfig: device[0],
                singleplayer: true,
                mode: 'normal',
                rememberedChallenges: 35,
                showChallenges: true
            }

            const roomId = roomFunctions.createRoom(roomConf, socket.id);
            socket.emit('room-created', roomId);
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

        //FIXME: when a user reconnects, it will happen under a new socket id, so the old socket id will not be removed from the room, and admin functions for example, will not work
        console.log('User disconnected ', socket.id);
        const timeout = setTimeout(() => {
            console.log(`Removing user ${socket.id} from room after 2 minutes of inactivity`);

            roomFunctions.removeUserFromRooms(socket.id);
            disconnectTimeouts.delete(socket.id);
            
        }, 60 * 60 * 1000); // does nothing for 1 hour will be removed from room

        disconnectTimeouts.set(socket.id, timeout);
    });

}