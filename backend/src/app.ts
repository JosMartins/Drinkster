import mongoose from 'mongoose';
import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server, Socket } from 'socket.io';


import * as roomFunctions from './roomFunctions';
import initRouter from './routes/init';
import challengeRouter from './routes/challenge';
import { Player, PlayerConfig } from './types/player';
import { GameRoom, GameRoomConfig } from './types/gameRoom';

// TODO: Create interfaces in another file


const app = express();
/*
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
*/
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoDB = process.env.MONGO_URI ?? '';
if (!mongoDB) {
    throw new Error('MONGO_URI is not defined in the environment variables');
}


//Game Rooms
const gameRooms = new Map<string,GameRoom>();


main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
    console.log("Connected to DB!");
}
/*
//Socket IO
io.on('connection', (socket) => {
    console.log('User connected');


    socket.on('create-room', (config: GameRoomConfig) =>{
        console.log('Creating Room', config.roomName);
        const room = roomFunctions.createRoom(config);
    });

});
*/
app.use('/', initRouter);
app.use('/api/challenge', challengeRouter);

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);

    //if (err.status === 502) {
     //   errorMessage = 'Backend service is unavailable';
    //}

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
