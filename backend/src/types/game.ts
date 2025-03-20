import { Server } from 'socket.io';
import { getChallenge, getChallengeStats } from '../controllers/challengeController';
import { IChallenge } from '../models/challenge';
import { GameRoom } from './gameRoom';
import { Player } from './player';

export interface GameStats {
    startTime?: Date;
    endTime?: Date;
    completedChallenges: number;
    drinkedChallenges: number;
    totalDrinked: number;
    totalRounds: number;
}

export interface PlayerTurn {
    playerId: string;
    challenge: IChallenge | null;
}

export class Game {
    //communication
    private static io?: Server;
    // State
    currentTurn: PlayerTurn;
    stats: GameStats;
    currentPlayerIndex: number;

    // Challenge tracking
    private challengeStats: {
        easyChallenges: number;
        mediumChallenges: number;
        hardChallenges: number;
        extremeChallenges: number;
        totalChallenges: number;
    };

    private lastChallengeIds: Array<string>;
    private readonly room: GameRoom;

    constructor(startRoom: GameRoom) {
        this.room = startRoom;
        this.currentPlayerIndex = 0;

        this.stats = {
            startTime: new Date(),
            completedChallenges: 0,
            drinkedChallenges: 0,
            totalDrinked: 0,
            totalRounds: 0
        };

        // Initialize with empty challenge (will be populated in initialize)
        this.currentTurn = {
            playerId: startRoom.players[0].id,
            challenge: null
        };

        // Initialize empty arrays and objects
        this.lastChallengeIds = [];
        this.challengeStats = {
            easyChallenges: 0,
            mediumChallenges: 0,
            hardChallenges: 0,
            extremeChallenges: 0,
            totalChallenges: 0
        };
    }

    // Accessors
    get players() { return this.room.players; }
    get mode() { return this.room.mode; }
    get rememberedChallenges() { return this.room.rememberedChallenges; }

    // Game initialization
    async initialize(socketServer: Server): Promise<void> {
        // Load challenge stats
        try {
            Game.io = socketServer;
            this.challengeStats = await getChallengeStats();
        } catch (error) {
            console.error("Failed to load challenge stats:", error);
            // Use default values if stats can't be loaded
            this.challengeStats = {
                easyChallenges: 1,
                mediumChallenges: 1,
                hardChallenges: 1,
                extremeChallenges: 1,
                totalChallenges: 4
            };
        }

        // Get first challenge
        try {
            this.currentTurn.challenge = await this.getChallenge();
        } catch (error) {
            console.error("Failed to get initial challenge:", error);
            // Use a default challenge if needed
            this.currentTurn.challenge = {
                challenge: 'Drink {sips} to start the game!',
                difficulty: 1,
                sexes: ['All'],
                sips: 1,
                type: 'challenge'
            };
        }
    }

    // Player management
    getCurrentPlayer(): Player | undefined {
        if (this.players.length === 0) return undefined;
        return this.players[this.currentPlayerIndex];
    }

    // Game flow
    async nextTurn(): Promise<void> {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        try {
            const newChallenge = await this.getChallenge();

            this.currentTurn = {
                playerId: this.players[this.currentPlayerIndex].id,
                challenge: newChallenge
            };
        } catch (error) {
            console.error("Failed to get next challenge:", error);

            // Use a default challenge if needed
            this.currentTurn = {
                playerId: this.players[this.currentPlayerIndex].id,
                challenge: {
                    challenge: 'Take a drink, we had trouble finding a challenge!',
                    difficulty: 1,
                    sexes: ['All'],
                    sips: 1,
                    type: 'challenge'
                }
            };
        }
    }

    // Stats tracking
    updateStats(player: Player, completed: boolean) {
        this.stats.totalRounds++;

        if (completed) {
            this.stats.completedChallenges++;
        } else {
            this.stats.drinkedChallenges++;
            this.stats.totalDrinked += 1;
        }
    }

    // Challenge generation
    private async getChallenge(): Promise<IChallenge> {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) {
            throw new Error('No player found');
        }

        const difficulty = this.getDifficultyLevel(currentPlayer);

        // Get challenge from backend
        let challenge = await getChallenge(difficulty, this.lastChallengeIds);

        // Process challenge text (replace player name placeholders)
        let randomPlayer: string | undefined;
        if (challenge.challenge.includes('{Player2}')) {
            const otherPlayers = this.players.filter(player => player.id !== currentPlayer.id);
            if (otherPlayers.length > 0) {
                // Select a random player
                const randomIndex = Math.floor(Math.random() * otherPlayers.length);
                randomPlayer = otherPlayers[randomIndex].name;
            }
        }

        challenge = this.processChallenge(challenge, randomPlayer);

        if (challenge?._id) {
            const stringId = challenge._id.toString();

            // Update the last challenge IDs
            if (this.lastChallengeIds.length >= this.rememberedChallenges) {
                this.lastChallengeIds.shift();
            }
            this.lastChallengeIds.push(stringId);
        }
        return challenge;
    }

    // Process challenge text (replace player placeholders)
    private processChallenge(challenge: IChallenge, secondPlayer? : string): IChallenge {
        // Create a copy to avoid modifying the original
        const processedChallenge = JSON.parse(JSON.stringify(challenge));
        let text = processedChallenge.challenge;

        // Replace {Player} with current player's name
        if (text.includes('{Player}')) {
            const currentPlayer = this.getCurrentPlayer();
            if (currentPlayer) {
                text = text.replace(/{Player}/g, currentPlayer.name);
            }


            // Replace {Player2} with another player's name
            if (secondPlayer) {
                text = text.replace(/{Player2}/g, secondPlayer);
            }
        } else if (text.includes('Everyone')) {
            this.currentPlayerIndex -= 1;
        }

        // Update challenge text
        processedChallenge.challenge = text;

        return processedChallenge;
    }

    // Difficulty selection
    private getDifficultyLevel(player: Player): string {
        const challengeCount = this.challengeStats;

        // Weighted selection based on player's difficulty preferences and available challenges
        const choices = {
            easy: player.difficulty_values.easy * (challengeCount.easyChallenges / challengeCount.totalChallenges),
            medium: player.difficulty_values.medium * (challengeCount.mediumChallenges / challengeCount.totalChallenges),
            hard: player.difficulty_values.hard * (challengeCount.hardChallenges / challengeCount.totalChallenges),
            extreme: player.difficulty_values.extreme * (challengeCount.extremeChallenges / challengeCount.totalChallenges)
        };

        // Find the highest weighted option
        const entries = Object.entries(choices);
        const maxEntry = entries.reduce((max, entry) =>
            entry[1] > max[1] ? entry : max, entries[0]);

        return maxEntry[0];
    }

    public static setSocketServer(socketServer: Server): void {
        Game.io = socketServer;
    }

    /**
     * Send the current challenge to the current player and notify others
     */
    public sendCurrentChallenge(): void {
        if (!Game.io) {
            console.warn("Socket server not set, cannot send challenge notifications");
            return;
        }

        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || !this.currentTurn.challenge) return;

        // Send challenge to current player
        if (this.currentTurn.challenge.challenge.includes('Everyone')) {
            //TODO - after sending make sure that any player can complete the challenge
            
            // Special case for "Everyone" challenges
            Game.io.to(this.room.id.toString()).emit('everyone-challenge', {
                challenge: this.currentTurn.challenge.challenge,
                round: this.stats.totalRounds + 1
            });

        } else {
            this.sendChallengeToPlayer(currentPlayer);

            // Notify other players
            this.notifyOtherPlayersAboutChallenge(currentPlayer);
        }

    }

    /**
     * Send challenge details to the player whose turn it is
     */
    private sendChallengeToPlayer(player: Player): void {

        if (!Game.io) {
            throw new Error("Socket server not set, cannot send challenge to player");
        }

        Game.io.to(player.id).emit('your-challenge', this.currentTurn.challenge);
    }


    private notifyOtherPlayersAboutChallenge(currentPlayer: Player, secondPlayerName?: string): void {
        if (!this.currentTurn.challenge) return;

        const challenge = this.currentTurn.challenge;
        const roomId = this.room.id.toString();


        if (!Game.io) {
            throw new Error("Socket server not set, cannot notify other players about challenge");
        }

        const text = (secondPlayerName) 
        ? `${currentPlayer.name} and ${secondPlayerName} are performing a challenge or drinking ${challenge.sips}`
        :  `${currentPlayer.name} is performing a challenge or drinking ${challenge.sips}` ;
        Game.io.to(roomId)
            .except(currentPlayer.id)
            .emit('other-player-challenge', text);
    }

}