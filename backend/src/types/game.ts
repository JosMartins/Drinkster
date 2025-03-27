import { Server } from 'socket.io';
import { getChallenge as fetchFromDB, getChallengeStats } from '../controllers/challengeController';
import { IChallenge } from '../models/challenge';
import { GameRoom } from './gameRoom';
import { Player } from './player';

export interface GameStats {
    startTime?: Date;
    endTime?: Date;
    completedChallenges: number;
    totalRounds: number;
}

export interface PlayerTurn {
    playerId: string;
    playerName: string;
    challenge: IChallenge | null;
}

export class Game {
    // Communication
    private static io?: Server;

    // Game state
    currentTurn: PlayerTurn;
    private stats: GameStats;
    private currentPlayerIndex: number;
    currentRound: number;
    private challengeTimeout?: NodeJS.Timeout;
    secondPlayer?: string

    // Challenge tracking
    private lastChallengeIds: string[];
    private readonly room: GameRoom;
    private challengeStats: {
        easyChallenges: number;
        mediumChallenges: number;
        hardChallenges: number;
        extremeChallenges: number;
        totalChallenges: number;
    };

    constructor(startRoom: GameRoom) {
        this.room = startRoom;
        this.currentPlayerIndex = 0;
        this.currentRound = 1;
        this.lastChallengeIds = [];
        this.stats = {
            completedChallenges: 0,
            totalRounds: 0
        };

        // Initialize challenge stats with defaults
        this.challengeStats = { //placeholder
            easyChallenges: 1,
            mediumChallenges: 1,
            hardChallenges: 1,
            extremeChallenges: 1,
            totalChallenges: 4
        }
        this.currentTurn = this.createNewTurn();

    }

    async initialize(socketServer: Server): Promise<void> {
        try {
            Game.io = socketServer;
            await getChallengeStats();
            console.log("stats:", this.challengeStats);
            await this.loadInitialChallenge();
        } catch (error) {
            console.error("Game initialization failed:", error);
            this.handleInitializationError();
        }
    }
    // Accessors
    get players() { return this.room.players; }
    get mode() { return this.room.mode; }
    get rememberedChallenges() { return this.room.rememberedChallenges; }

    // Game initialization
    private async getChallengeNumbers() {
        this.challengeStats = await getChallengeStats();
    }

    private createNewTurn(): PlayerTurn {
        return {
            playerId: this.players[this.currentPlayerIndex].id,
            playerName: this.players[this.currentPlayerIndex].name,
            challenge: null
        };
    }


    private async loadInitialChallenge(): Promise<void> {
        try {
            this.currentTurn.challenge = await this.getChallenge();
        } catch (error) {
            console.error("Initial challenge loading failed:", error);
            this.currentTurn.challenge = this.createFallbackChallenge();
        }
    }

    private handleInitializationError(): void {
        this.currentTurn.challenge = this.createFallbackChallenge();
    }

    private createFallbackChallenge(): IChallenge {
        return {
            challenge: 'Drink {sips} to start the game!',
            difficulty: 1,
            sexes: ['All'],
            sips: 1,
            type: 'challenge'
        };
    }

    // Player management
    getCurrentPlayer(): Player | undefined {
        if (this.players.length === 0) return undefined;
        return this.players[this.currentPlayerIndex];
    }

    // Game flow
    async nextTurn(): Promise<void> {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.stats.totalRounds++;


        try {
            const newChallenge = await this.getChallenge();
            this.currentTurn = {
                playerId: this.players[this.currentPlayerIndex].id,
                playerName: this.players[this.currentPlayerIndex].name,
                challenge: newChallenge
            };
            this.sendCurrentChallenge();
        } catch (error) {
            console.error("Challenge rotation failed:", error);
            this.currentTurn.challenge = this.createFallbackChallenge();
            this.sendCurrentChallenge();
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
        let challenge = await fetchFromDB(difficulty, this.lastChallengeIds);

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
                this.secondPlayer = secondPlayer;
                text = text.replace(/{Player2}/g, secondPlayer);
            }

            if (text.includes('{x}')) {
                text = text.replace(/{x}/g, challenge.sips);
            }
        } else if (text.includes('Everyone')) {
            this.currentPlayerIndex -= 1;
        }

        //if penalty add to penalties
        if (challenge.type === 'penalty' && challenge.penalty_params) {
            this.room.players[this.currentPlayerIndex].penalties?.push({
                text: challenge.penalty_params.text!,
                rounds: challenge.penalty_params.rounds!
            });
        }
        // Update challenge text
        processedChallenge.challenge = text;

        return processedChallenge;
    }

    private getDifficultyLevel(player: Player): string {
        const challengeCount = this.challengeStats;
        const total = challengeCount.totalChallenges || 1; // Prevent division by zero

        const choices = {
            easy: player.difficulty_values.easy * (challengeCount.easyChallenges / total),
            medium: player.difficulty_values.medium * (challengeCount.mediumChallenges / total),
            hard: player.difficulty_values.hard * (challengeCount.hardChallenges / total),
            extreme: player.difficulty_values.extreme * (challengeCount.extremeChallenges / total)
        };

        return Object.entries(choices).reduce((max, entry) =>
            entry[1] > max[1] ? entry : max, Object.entries(choices)[0])[0];
    }

    public sendCurrentChallenge(): void {
        if (!Game.io || !this.currentTurn.challenge) return;

        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return;

        if (this.currentTurn.challenge.challenge.includes('Everyone')) {
            this.handleEveryoneChallenge();
        } else {
            this.sendIndividualChallenge(currentPlayer);
            if (this.secondPlayer)
                this.sendIndividualChallenge(this.players.filter(pl => pl.name === this.secondPlayer)[0]);
        }

        this.setChallengeCompletionHandler();
    }

    private handleEveryoneChallenge(): void {
        Game.io!.to(this.room.id.toString()).emit('everyone-challenge', {
            challenge: this.currentTurn.challenge!.challenge,
            round: this.currentRound
        });
    }

    private sendIndividualChallenge(player: Player): void {
        debugger
        const challengeData = {
            text: this.currentTurn.challenge?.challenge ?? '',
            round: this.currentRound,
            playerName: player.name,
            // Enviar apenas dados necessários das penalidades
            playerPenalties: player.penalties?.map(p => ({
                text: p.text,
                rounds: p.rounds
            })) || []
        };

        Game.io!.to(player.socketId).emit('your-challenge', challengeData);
        this.notifyOtherPlayersAboutChallenge(player);
    }

    private setChallengeCompletionHandler(): void {
        if (!Game.io) return;

        const cleanup = () => {
            Game.io!.off('challenge-completed', handleComplete);
            Game.io!.off('challenge-drunk', handleDrunk);
            if (this.challengeTimeout) clearTimeout(this.challengeTimeout);
        };

        const handleComplete = (roomId: number) => {
            if (roomId === this.room.id) {
                cleanup();
                this.handleChallengeCompletion(true);
            }
        };

        const handleDrunk = (roomId: number) => {
            if (roomId === this.room.id) {
                cleanup();
                this.handleChallengeCompletion(false);
            }
        };

        Game.io.on('challenge-completed', handleComplete);
        Game.io.on('challenge-drunk', handleDrunk);

        // Add timeout for challenge completion
        this.challengeTimeout = setTimeout(() => {
            cleanup();
            this.handleChallengeTimeout();
        }, 120000); // 2-minute timeout
    }

    private handleChallengeCompletion(success: boolean): void {
        if (success) {
            this.stats.completedChallenges++;
        }
        this.players.forEach((player: Player) => {player.penalties = player.penalties?.filter(pen => {
            if (pen.rounds === 0) return false;
            pen.rounds--;
            return true;
        })});

        this.nextTurn();
    }

    private handleChallengeTimeout(): void {
        console.log(`Challenge timeout in room ${this.room.id}`);
        Game.io!.to(this.room.id.toString()).emit('challenge-timeout');
        this.nextTurn();
    }

    private notifyOtherPlayersAboutChallenge(currentPlayer: Player): void {
        if (!this.currentTurn.challenge) return;

        const sips = this.currentTurn.challenge.sips ?? 0;


        if (!Game.io) {
            throw new Error("Socket server not set, cannot notify other players about challenge");
        }

        const text = `${currentPlayer.name} is performing a challenge or drinking ${sips}` ;
        this.room.players.forEach(player => {
            if (player.id !== this.currentTurn.playerId) {
                Game.io?.to(player.socketId).emit('other-player-challenge', {
                    text: text,
                    round: this.currentRound,
                    playerPenalties: player.penalties?.map(p => ({
                        text: p.text,
                        rounds: p.rounds
                    })) || []
                });
            }
        });
    }
}