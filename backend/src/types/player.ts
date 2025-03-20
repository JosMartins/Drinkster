import { Sex } from '../types/sex';

export interface DifficultyValues {
    easy: number;
    medium: number;
    hard: number;
    extreme: number;
}

export interface Player {
    id: string; //persistent id
    socketId: string; //socket id
    name: string;
    sex: Sex;
    difficulty_values: DifficultyValues;
    isAdmin: boolean;
    isReady: boolean;
    isPlaying: boolean;
}

export interface PlayerConfig {
    name: string;
    sex: Sex;
    difficulty_values: DifficultyValues;
}

export interface PlayerStats {
    completedChallenges: number;
    drinkedChallenges: number;
    totalDrinked: number;
    totalRounds: 0;
}
