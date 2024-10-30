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
  difficultyCounts: any;
  penalties: Array<Penalty> = [];
  private readonly chance = new Chance();

  constructor(
    private readonly challengeService: ChallengeService,
    private readonly router: Router
  ) {

    if (this.getGameData()) {
      this.loadChallenge(); // Initiate challenge loading
    }
  }

  getGameData(): boolean {
    const savedGame = sessionStorage.getItem('game');
    if (savedGame) {
      this.game = JSON.parse(savedGame);

      return true;
    }

    this.router.navigate(['/config']);
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
        const chal: Challenge = {
          _id: data._id,
          challenge: data.challenge,
          difficulty: data.difficulty,
          sexes: data.sexes,
        };

        // Handle challenge based on difficulty and state
        if ((chal.difficulty === 4 && !this.game.extremeMode) || this.lastIds.includes(chal._id)) {
          this.resetRequestState();
          this.loadChallenge(); // Recursive call to fetch another challenge
        } else {
          this.handleChallenge(chal);
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

    let penalty: { description: string; players: string[]; penalty: number; persistance: number; } = {
      description: '',//Unused for now but could be used to display the penalty
      players: [],
      penalty: 1,
      persistance: 0
    };

    let plTurn = Math.floor(this.round % this.game.players.length);
    if (chal.challenge.includes('{Player}')) {
      if (chal.sexes[0] === 'All' || chal.sexes[0] === this.game.players[plTurn].gender) {
        chal.challenge = chal.challenge.replaceAll('{Player}', this.game.players[plTurn].name);
        penalty.players.push(this.game.players[plTurn].name);

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
        penalty.players.push(player2);
      } else {
        this.loadChallenge(); // Retry if conditions are not met
        return;
      }
    }

    if (chal.challenge.includes('rounds')) {
      const match = chal.challenge.match(/(\d+) rounds/);
      if (match) {
        penalty.penalty = parseInt(match[1], 10) + 1;
      } else {
        console.error('No match found for rounds');
      }

      this.penalties.push(penalty);

      //Specific
      if (chal.challenge.includes('From now on')) {
        penalty.persistance = penalty.penalty;
      }
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
      easy: this.game.difficultyValues.easy,
      medium: this.game.difficultyValues.medium,
      hard: this.game.difficultyValues.hard,
      extreme: this.game.difficultyValues.extreme
    };

    return this.chance.weighted(Object.keys(choices), Object.values(choices));
  }

  nextChallenge(): void {
    if (!this.isLoading && !this.requestCooldown) {
      this.loadChallenge();
      setTimeout(() => {
        this.requestCooldown = false;
      }, 1250); // Cooldown to prevent immediate repeat requests
    }
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

