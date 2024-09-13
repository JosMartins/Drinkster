import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Game } from '../game';
import { ChallengeService } from '../challenge.service';
import Chance from 'chance';
import { Challenge } from '../challenge';

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
  lastIds: Array<any> = [];
  isLoading: boolean = false;
  requestCooldown: boolean = false;
  writtenChallenge: Challenge | null = null;
  difficultyCounts: any;
  private chance = new Chance();

  constructor(
    private challengeService: ChallengeService,
    private router: Router
  ) {
    const savedGame = sessionStorage.getItem('game');
    if (savedGame) {
      this.game = JSON.parse(savedGame);
      this.challengeService.getStats().subscribe(
        (data) => {
          this.difficultyCounts = data;
        });
        
      this.loadChallenge(); // Initiate challenge loading
    } else {
      this.router.navigate(['/config']);
    }
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
        if (chal.difficulty === 4 && !this.game.extremeMode) {
          this.resetRequestState();
          this.loadChallenge(); // Recursive call to fetch another challenge
        } else if (this.lastIds.includes(chal._id)) {
          this.resetRequestState();
          this.loadChallenge(); // Recursive call to avoid duplicate challenges
        } else {
          this.handleChallenge(chal);
        }
      },
      (error) => {
        console.error('Error fetching challenge:', error);
        this.resetRequestState();
      }
    );
  }

  handleChallenge(chal: Challenge): void {
    this.resetRequestState();
    if (this.lastIds.length >= this.game.remembered) {
      this.lastIds.pop();
    }
    this.lastIds.unshift(chal._id);

    let plTurn = Math.floor(this.round % this.game.players.length);
    if (chal.challenge.includes('{Player}')) {
      if (chal.sexes[0] === 'All' || chal.sexes[0] === this.game.players[plTurn].gender) {
        chal.challenge = chal.challenge.replaceAll('{Player}', this.game.players[plTurn].name);
        this.round++;
      } else {
        this.loadChallenge(); // Retry if conditions are not met
        return;
      }

      let player1 = this.game.players[plTurn].name;

      if (chal.challenge.includes('{Player2}')) {
        let otherPlayers = this.game.players.filter(player => player.name !== player1);
        let randomIndex = Math.floor(Math.random() * otherPlayers.length);

        if (chal.sexes[1] === 'All' || chal.sexes[1] === this.game.players[randomIndex].gender) {
          let player2 = otherPlayers[randomIndex].name;
          chal.challenge = chal.challenge.replaceAll('{Player2}', player2);
        } else {
          this.loadChallenge(); // Retry if conditions are not met
          return;
        }
      }
    }

    this.writtenChallenge = chal;
    console.log(this.writtenChallenge);
  }

  resetRequestState(): void {
    this.isLoading = false;
    this.requestCooldown = false;
  }

  getDifficultyLevel(): string {
    const choices = {
      easy: this.game.difficultyValues.easy * this.difficultyCounts.easyChallenges,
      medium: this.game.difficultyValues.medium * this.difficultyCounts.mediumChallenges,
      hard: this.game.difficultyValues.hard * this.difficultyCounts.hardChallenges,
      extreme: this.game.difficultyValues.extreme * this.difficultyCounts.extremeChallenges,
    };

    return this.chance.weighted(Object.keys(choices), Object.values(choices));
  }

  nextChallenge(): void {
    if (!this.isLoading && !this.requestCooldown) {
      this.loadChallenge();
      setTimeout(() => {
        this.requestCooldown = false;
      }, 1000); // Cooldown to prevent immediate repeat requests
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
}
