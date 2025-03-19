import mongoose from 'mongoose';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';


import * as roomFunctions from './roomFunctions';
import initRouter from './routes/init';
import challengeRouter from './routes/challenge';
import { GameRoom, GameRoomConfig } from './types/gameRoom';
import { PlayerConfig } from './types/player';


const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoDB = process.env.MONGO_URI ?? '';
if (!mongoDB) {
    throw new Error('MONGO_URI is not defined in the environment variables');
}

const disconnectTimeouts = new Map<string, NodeJS.Timeout>();


main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
    console.log("Connected to DB!");
}


//Socket IO
io.on('connection', (socket) => {
    console.log('User connected');

    if (disconnectTimeouts.has(socket.id)) {
        clearTimeout(disconnectTimeouts.get(socket.id));
        disconnectTimeouts.delete(socket.id);
        console.log(`Cleared timeout for reconnected user ${socket.id}`);
    }

    socket.on('create-room', (config: GameRoomConfig) =>{
        console.log('Creating Room', config.roomName);
        const roomId = roomFunctions.createRoom(config, socket.id);
        socket.emit('room-created', roomId);
    });


    socket.on('join-room', (roomId: number, player: PlayerConfig) => {
        console.log('Joining Room', roomId);
        socket.join(roomId.toString());
    });

    socket.on('disconnect', () => {
        console.log('User disconnected ', socket.id);
        const timeout = setTimeout(() => {
            console.log(`Removing user ${socket.id} from room after 2 minutes of inactivity`);
            
            roomFunctions.removeUserFromRooms(socket.id);
            disconnectTimeouts.set(socket.id, timeout);
        }, 2 * 60 * 1000);

    });

});

app.use('/', initRouter);
app.use('/api/challenge', challengeRouter);

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);

    res.status(500);
    res.json({ error: err });
});

app.listen(3432, () => {
    console.log("Server is up and running on port 3432");
});

export default app;


/**
 * From frontend:
 * config = {
 *   roomName: 'roomName',
 *   private: true/false,
 *   password: 'password', // only if private is true
 *   player: {
 *     name: 'playerName',
 *     gender: 'playerGender',
 *     difficulty_values: { 
 *       easy: 0 ~ 1, 
 *       medium: 0 ~ 1, 
 *       hard: 0 ~ 1, 
 *       extreme: 0 ~ 1 
 *     } // sum = 1
 *   }
 * }
 * 
 * Stored in gameRooms Map:
 * {
 *   id: 'unique-room-id', // generate with uuid or similar
 *   name: config.roomName,
 *   private: config.private,
 *   password: config.password, // store hashed if security is a concern
 *   players: [
 *     {
 *       id: socket.id,
 *       name: config.player.name,
 *       gender: config.player.gender,
 *       difficulty_values: config.player.difficulty_values,
 *       isAdmin: true, // first player is admin
 *       isReady: false // for game start readiness
 *     }
 *   ],
 *   status: 'waiting', // can be 'waiting', 'playing', 'finished'
 *   createdAt: Date.now()
 * }
 */
