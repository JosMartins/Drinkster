import { Sex } from './sex';

export const DEFAULT_DIFFICULTY_VALUES: DifficultyValues = { easy: 0.3, medium: 0.35, hard: 0.35, extreme: 0 };
export interface DifficultyValues {
    easy: number;
    medium: number;
    hard: number;
    extreme: number;
}

interface Penalty {
    text: string;
    rounds: number;
}

export interface Player {
    id: string; //persistent id
    socketId: string; //socket id
    name: string;
    sex: Sex;
    difficulty_values: DifficultyValues;
    penalties: Penalty[];
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
