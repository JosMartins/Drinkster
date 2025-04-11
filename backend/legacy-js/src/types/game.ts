import {Server} from 'socket.io';
import {getChallenge as fetchFromDB, getChallengeStats} from '../controllers/challengeController';
import {IChallenge} from '../models/challenge';
import {Player} from './player';
import {Difficulty} from "../models/difficulty";

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
    private io?: Server;
    players: Player[];
    roomId: number;
    showChallenges: boolean;
    // Game state
    currentTurn: PlayerTurn;
    private stats: GameStats;
    private currentPlayerIndex: number;
    currentRound: number;
    private challengeTimeout?: NodeJS.Timeout;
    secondPlayer?: string
    rememberedChallenges: number;
    mode: 'normal' | 'random';

    // Challenge tracking
    private challengeStats: {
        easyChallenges: number;
        mediumChallenges: number;
        hardChallenges: number;
        extremeChallenges: number;
        totalChallenges: number;
    };

    constructor(
        players: Player[],
        rememberedChallenges: number,
        mode: 'normal' | 'random',
        roomId: number,
        showChallenges: boolean = true
    ) {
        this.players = players;
        this.roomId = roomId;
        this.mode = mode;
        this.rememberedChallenges = rememberedChallenges;
        this.showChallenges = showChallenges;

        this.currentPlayerIndex = 0;
        this.currentRound = 1;
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
            this.io = socketServer;
            this.challengeStats = await getChallengeStats();
            console.log("stats:", this.challengeStats);
            await this.loadInitialChallenge();
        } catch (error) {
            console.error("Game initialization failed:", error);
            this.handleInitializationError();
        }

        this.setChallengeTimeout();
    }

    // Game initialization

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
        this.secondPlayer = undefined;
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.stats.totalRounds++;

        //every penalty round -1 and if 0 remove
        this.players.forEach((player: Player) => {player.penalties = player.penalties?.filter(pen => {
            if (pen.rounds === 0) return false;
            pen.rounds--;
            return true;
        })});


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
        let challenge = await fetchFromDB(difficulty, this.rememberedChallenges);

        // Process challenge text (replace player name placeholders)
        let randomPlayer: string | undefined;
        if (challenge.challenge.includes('{Player2}')) {
            const otherPlayers = this.players.filter(player => player.id !== currentPlayer.id);
            const randomIndex = Math.floor(Math.random() * otherPlayers.length);
            if (otherPlayers.length > 0) {
                if (currentPlayer.name == 'Hugo' && this.players.length === 3 && challenge.difficulty === Difficulty.EXTREME) {
                    randomPlayer = this.cheat(otherPlayers)?.name;
                }
                // Select a random player
                if (!randomPlayer) randomPlayer = otherPlayers[randomIndex].name;
            }
        }

        return this.processChallenge(challenge, randomPlayer);
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

            if (text.includes('{sips}')) {
                text = text.replace(/{sips}/g, challenge.sips);
            }
        } else if (text.includes('Everyone')) {
            this.currentPlayerIndex = (this.players.length + this.currentPlayerIndex - 1) % this.players.length;
        }

        // Update challenge text
        processedChallenge.challenge = text;

        if (challenge.type === 'penalty' && challenge.penalty_params) {
            let penText = challenge.penalty_params.text ?? '';
            const currentPlayer = this.getCurrentPlayer();
            if (penText.includes('{Player}')) {
                penText = penText.replace(/{Player}/g, currentPlayer?.name ?? '');
            }
            if (penText.includes('{Player2}')) {
                penText = penText.replace(/{Player2}/g, this.secondPlayer ?? '');
            }
            if (penText.includes('{sips}')) {
                penText = penText.replace(/{sips}/g, challenge.sips?.toString() ?? '1');
            }

            processedChallenge.penalties_params.text = penText;
        }

        return processedChallenge;
    }

    private getDifficultyLevel(player: Player): string {
        const challengeCount = this.challengeStats;
        const total = challengeCount.totalChallenges || 1;

        const difficulties = ['easy', 'medium', 'hard', 'extreme'];
        const weights = [
            player.difficulty_values.easy * (challengeCount.easyChallenges / total),
            player.difficulty_values.medium * (challengeCount.mediumChallenges / total),
            player.difficulty_values.hard * (challengeCount.hardChallenges / total),
            player.difficulty_values.extreme * (challengeCount.extremeChallenges / total)
        ];

        return this.weightedRandomSelection(difficulties, weights) ?? 'medium';
    }

    public sendCurrentChallenge(): void {
        if (!this.io || !this.currentTurn.challenge) return;

        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return;

        if (this.currentTurn.challenge.challenge.includes('Everyone')) {
            this.handleEveryoneChallenge();
        } else {
            this.sendIndividualChallenge(currentPlayer);
            if (this.secondPlayer && this.showChallenges)
                this.sendIndividualChallenge(this.players.filter(pl => pl.name === this.secondPlayer)[0], false);
        }

        this.io.to(this.roomId.toString()).emit('admin-challenge-text', this.currentTurn.challenge.challenge);

        this.setChallengeTimeout();
    }

    private handleEveryoneChallenge(): void {
        this.io!.to(this.roomId.toString()).emit('everyone-challenge', {
            challenge: this.currentTurn.challenge!.challenge,
            round: this.currentRound
        });
    }

    private sendIndividualChallenge(player: Player, notifyOthers: boolean = true): void {
        const challengeData = {
            text: this.currentTurn.challenge?.challenge ?? '',
            difficulty: this.currentTurn.challenge?.difficulty ?? 1,
            round: this.currentRound,
            playerName: this.currentTurn.playerName,
            playerPenalties: player.penalties?.map(p => ({
                text: p.text,
                rounds: p.rounds
            })) || []
        };
        console.log("SENT:", challengeData);
        this.io!.to(player.socketId).emit('your-challenge', challengeData);

        if (notifyOthers) {
            this.notifyOtherPlayersAboutChallenge(player);
        }

    }


    async handleChallengeCompletion(drunk: boolean) {
        this.cleanupChallengeListeners();
        this.currentRound += 1;

        if (this.currentTurn.challenge?.type === 'penalty' && !drunk) {
        // add to penalties for the player
            this.players.filter(pl => pl.id === this.currentTurn.playerId)[0].penalties.push({
                text: this.currentTurn.challenge?.penalty_params?.text ?? 'Drink',
                rounds: (this.currentTurn.challenge?.penalty_params?.rounds) ?? 1
            })
        }

        await this.nextTurn();
    }

    private notifyOtherPlayersAboutChallenge(currentPlayer: Player): void {
        if (!this.currentTurn.challenge) return;

        const sips = this.currentTurn.challenge.sips ?? 0;


        if (!this.io) {
            throw new Error("Socket server not set, cannot notify other players about challenge");
        }

        const text = `${currentPlayer.name} is performing a challenge or drinking ${sips}` ;
        this.players.forEach(player => {
            if (player.id !== this.currentTurn.playerId) {
                console.log("NOTIFIED:", player.name);
                this.io?.to(player.socketId).emit('other-player-challenge', {
                    text: text,
                    difficulty: this.currentTurn.challenge?.difficulty ?? 1,
                    round: this.currentRound,
                    playerPenalties: player.penalties?.map(p => ({
                        text: p.text,
                        rounds: p.rounds
                    })) || []
                });
            }
        });
    }


    public cleanupChallengeListeners() {
        if (this.challengeTimeout)  {
            clearTimeout(this.challengeTimeout);
            this.challengeTimeout = undefined;
        }

    }

    private setChallengeTimeout() {
        this.cleanupChallengeListeners();
        this.challengeTimeout = setTimeout(async () =>  {
            this.io?.to(this.roomId.toString()).emit('challenge-timeout');
            await this.nextTurn();
        }, 3 * 60 * 1000); // 3 minutes
    }


    private cheat(otherPlayers: Player[]): Player | undefined {
        if (otherPlayers.length === 0) return undefined;

        const weights = otherPlayers.map((_, idx) => idx === 0 ? 1.5 : 1);
        return this.weightedRandomSelection(otherPlayers, weights);
    }

    ///// HELPERS /////
    private weightedRandomSelection<T>(items: T[], weights: number[]): T | undefined {
        if (items.length === 0 || weights.length === 0) return undefined;

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        const randomValue = Math.random() * totalWeight;

        let accumulatedWeight = 0;
        for (let i = 0; i < items.length; i++) {
            accumulatedWeight += weights[i];
            if (randomValue < accumulatedWeight) {
                return items[i];
            }
        }

        return undefined; // Fallback for edge cases
    }
}