import { Player , PlayerConfig } from './player';

export interface RoomConfig {
    roomName: string;
    private: boolean;
    password?: string;
    playerConfig: PlayerConfig;
}

export interface GameRoom {
    id: string;
    name: string;
    private: boolean;
    password?: string;
    players: Array<Player>;
    status: 'waiting' | 'playing' | 'finished';
    createdAt: date;
}