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
  lastIds: Array<any> = new Array();

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
        //check if it is in the last questions array
        if (this.lastIds.includes(data._id)) {
          return this.loadChallenge();
        } else {
          if (this.lastIds.length >= this.game.remembered) {
            this.lastIds.pop();  
          }
          this.lastIds.unshift(data._id)
          console.log(this.lastIds);
        }

        
        //replace the first occurence of {player} ONLY  with name from game
        let plTurn = Math.floor(this.round % this.game.players.length);
        console.log(this.challenge.challenge);
        console.log(this.challenge.challenge.includes('{Player}'));
        if (this.challenge.challenge.includes('{Player}')) {
          let player1 = this.game.players[plTurn].name;

          if (this.challenge.challenge.includes('{Player2}')) { 
            let otherPlayers = this.game.players.filter(player => player.name !== player1);
            let randomIndex = Math.floor(Math.random() * otherPlayers.length);
            let player2 = otherPlayers[randomIndex].name;
            this.challenge.challenge = this.challenge.challenge.replaceAll('{Player2}', player2);
          }
          
          this.challenge.challenge = this.challenge.challenge.replaceAll('{Player}', player1);
          this.round++;
        }
        
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
