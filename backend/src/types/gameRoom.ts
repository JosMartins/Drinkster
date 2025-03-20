import { Player , PlayerConfig } from './player';
import { Game } from './game';

export interface GameRoomConfig {
    roomName: string;
    private: boolean;
    password?: string;
    playerConfig: PlayerConfig;
    singleplayer?: boolean ;
    mode: 'normal' | 'random';
    rememberedChallenges: number;
    showChallenges: boolean;
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
    mode: 'normal' | 'random';
    rememberedChallenges: number;
    showChallenges: boolean;
    game?: Game;
}