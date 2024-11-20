import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Game } from '../game';
import { ChallengeService } from '../challenge.service';
import Chance from 'chance';
import { Challenge } from '../challenge';
import { Penalty } from '../Penalty';
@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.css']
})
export class ChallengeComponent {

  game!: Game;
  round: number = 0;
  trueRound: number = 0;
  lastIds: Array<any> = [];
  isLoading: boolean = false;
  requestCooldown: boolean = false;
  writtenChallenge: Challenge | null = null;
  penalties: Array<Penalty> = [];
  penalty: Penalty | null = null;
  chal: Challenge | null = null;
  challengeCount!: { easyChallenges: number, mediumChallenges: number, hardChallenges: number, extremeChallenges: number, totalChallenges: number };
  private readonly chance = new Chance();


  constructor(
    private readonly challengeService: ChallengeService,
    private readonly router: Router
  ) { }

  async ngOnInit() {

    if (!this.getGameData()) {
      this.router.navigate(['/config']);
      return;
    }

    await this.getStats();

    this.loadChallenge();
  }


  async getStats(): Promise<void> {
    this.challengeCount = await this.challengeService.getStats().toPromise();
  }

  getGameData(): boolean {
    const savedGame = sessionStorage.getItem('game');
    if (savedGame) {
      this.game = JSON.parse(savedGame);

      return true;
    }
    return false;
  }

  loadChallenge(): void {
    if (this.requestCooldown || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.requestCooldown = true;

    const difficultyLevel = this.game.probabilitiesMode ? 'none' : this.getDifficultyLevel();
    this.challengeService.getChallenge(difficultyLevel).subscribe(
      (data) => {
        this.chal = {
          _id: data._id,
          challenge: data.challenge,
          difficulty: data.difficulty,
          sexes: data.sexes,
        };

        // Handle challenge based on difficulty and state
        if ((this.chal.difficulty === 4 && !this.game.extremeMode) || this.lastIds.includes(this.chal._id)) {
          this.resetRequestState();
          this.loadChallenge(); // Recursive call to fetch another challenge
        } else {
          this.handleChallenge(this.chal);
        }
      },
      error => {
        console.error('Error fetching challenge:', error);
        this.resetRequestState();
      }
    );
  }

  handleChallenge(chal: Challenge): void {
    this.resetRequestState();
    let penalty_players: Array<string> = [];

    let plTurn = Math.floor(this.round % this.game.players.length);
    if (chal.challenge.includes('{Player}')) {
      if (chal.sexes[0] === 'All' || chal.sexes[0] === this.game.players[plTurn].gender) {
        chal.challenge = chal.challenge.replaceAll('{Player}', this.game.players[plTurn].name);
        penalty_players.push(this.game.players[plTurn].name);

        this.round++;
      } else {
        this.loadChallenge(); // Retry if conditions are not met
        return;
      }


    }
    let player1 = this.game.players[plTurn].name;


    if (chal.challenge.includes('{Player2}')) {
      let otherPlayers = this.game.players.filter(player => player.name !== player1);
      let randomIndex = Math.floor(Math.random() * otherPlayers.length);

      if (chal.sexes[1] === 'All' || chal.sexes[1] === this.game.players[randomIndex].gender) {
        let player2 = otherPlayers[randomIndex].name;
        chal.challenge = chal.challenge.replaceAll('{Player2}', player2);
        penalty_players.push(player2);
      } else {
        this.loadChallenge(); // Retry if conditions are not met
        return;
      }
    }

    if (chal.challenge.includes('rounds')) {
      const match = chal.challenge.match(/(\d+) rounds/);
      if (match) {
        this.penalty = {
          description: '',
          players: penalty_players,
          penalty: parseInt(match[1], 10) + 1,
          persistance: 0
        }
      } else {
        console.error('No match found for rounds');
      }

    }

    //Specific
    if (chal.challenge.includes('From now on') && this.penalty) {
      this.penalty.persistance = this.penalty.penalty;
    }

    if (this.lastIds.length >= this.game.remembered) {
      this.lastIds.pop();
    }
    this.lastIds.unshift(chal._id);

    this.writtenChallenge = chal;
    this.trueRound++;

    this.penalties.forEach(element => {
      if (element.penalty === 0) {
        if (element.persistance > 0) {
          element.penalty = element.persistance;
        } else {
          this.penalties.splice(this.penalties.indexOf(element), 1);
        }
      } else {
        element.penalty -= 1;
      }
    });

  }

  resetRequestState(): void {
    this.isLoading = false;
    this.requestCooldown = false;
  }

  getDifficultyLevel(): string {
    
    const choices = {
      easy: this.game.difficultyValues.easy * (this.challengeCount.easyChallenges / this.challengeCount.totalChallenges),
      medium: this.game.difficultyValues.medium * (this.challengeCount.mediumChallenges / this.challengeCount.totalChallenges),
      hard: this.game.difficultyValues.hard * (this.challengeCount.hardChallenges / this.challengeCount.totalChallenges),
      extreme: this.game.difficultyValues.extreme * (this.challengeCount.extremeChallenges / this.challengeCount.totalChallenges)
    };


    return this.chance.weighted(Object.keys(choices), Object.values(choices));
  }

  didIt(): void {
    if (!this.isLoading && !this.requestCooldown) {
      if (this.penalty && this.penalty.penalty !== 0) {
        this.penalties.push(this.penalty);
      }
      this.penalty = null;
      this.chal = null;
      this.loadChallenge();
      setTimeout(() => {
        this.requestCooldown = false;
      }, 1250); // Cooldown to prevent immediate repeat requests
    }
  }

  drank(): void { //TODO change this so player has a drank counter
    this.loadChallenge();
    this.penalty = null;
    this.chal = null;
  }

  getDifficultyWord(difficulty: number): string {
    switch (difficulty) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      case 4: return 'Extreme';
      default: return '';
    }
  }

  penaltyToString(penalty: Penalty): string {
    if (penalty.players.length === 0) {
      return `${penalty.penalty} rounds (Everyone)`;
    }

    return `${penalty.penalty} rounds (${penalty.players.join(' & ')})`;
  }
}
