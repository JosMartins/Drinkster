import mongoose from 'mongoose';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import { setupSockethandlers } from './socketFunctions';


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


main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
    console.log("Connected to DB!");
}

setupSockethandlers(io);

/*
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);

    res.status(500);
    res.json({ error: err });
});

*/

server.listen(3432, () => {
    console.log("Server is up and running on port 3432");
});

export default app;
