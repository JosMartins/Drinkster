import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Game } from '../game';
import { ChallengeService } from '../challenge.service';

@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.css']
})
export class ChallengeComponent {

  challenge: any;
  game!: Game;
  round: number = 0;

  constructor(
    private challengeService: ChallengeService,
    private router: Router
  ) {
    const savedGame = sessionStorage.getItem('game');
    console.log(savedGame);
    if (savedGame) {
      this.game = JSON.parse(savedGame);
    } else {
      this.router.navigate(['/config']);
    }
    this.loadChallenge();
  }


  loadChallenge(): void {
    const difficultyLevel = this.getDifficultyLevel();
    this.challengeService.getChallenge(difficultyLevel).subscribe(
      (data) => {
        this.challenge = data;

        //replace the first occurence of {player} ONLY  with name from game
        let plTurn = Math.floor(this.round % this.game.players.length);
        console.log(plTurn);
        this.challenge.challenge = this.challenge.challenge.replace('{Player}', this.game.players[plTurn].name);
        this.round++;
      },
      (error) => {
        console.error('Error fetching challenge:', error);
      }
    );
  }

  getDifficultyLevel(): string {
    const cumulativeWeights = [];
    let total = 0;

    for (const [difficulty, weight] of Object.entries(this.game.difficultyValues)) {
      total += weight;
      cumulativeWeights.push({ difficulty, cumulative: total });
    }

    const random = Math.random();

    for (const { difficulty, cumulative } of cumulativeWeights) {
      if (random < cumulative) {
        return difficulty;
      }
    }

    return '';
  }

  nextChallenge(): void {
    this.loadChallenge();
  }


  getDifficultyWord(difficulty: number): string {
    switch (difficulty) {
      case 1:
        return 'Easy';
      case 2:
        return 'Medium';
      case 3:
        return 'Hard';
      case 4:
        return 'Extreme';
      default:
        return '';
    }
  }
}
