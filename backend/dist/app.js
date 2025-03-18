"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const init_1 = __importDefault(require("./routes/init"));
const challenge_1 = __importDefault(require("./routes/challenge"));
// TODO: Create interfaces in another file
const app = (0, express_1.default)();
/*
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
*/
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
const mongoDB = (_a = process.env.MONGO_URI) !== null && _a !== void 0 ? _a : '';
if (!mongoDB) {
    throw new Error('MONGO_URI is not defined in the environment variables');
}
//Game Rooms
const gameRooms = new Map();
main().catch((err) => console.log(err));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(mongoDB);
        console.log("Connected to DB!");
    });
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
app.use('/', init_1.default);
app.use('/api/challenge', challenge_1.default);
app.use(function (err, req, res, next) {
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
exports.default = app;
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
