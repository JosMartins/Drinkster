import { Player , PlayerConfig } from './player';

export interface GameRoomConfig {
    roomName: string;
    private: boolean;
    password?: string;
    playerConfig: PlayerConfig;
}

export interface GameRoom {
    id: number;
    name: string;
    private: boolean;
    password?: string;
    admin: Player;
    players: Array<Player>;
    status: 'waiting' | 'playing' | 'finished';
    createdAt: Date;
}