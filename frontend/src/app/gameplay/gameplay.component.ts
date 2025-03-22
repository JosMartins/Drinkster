import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import Chance from 'chance';
import { SocketService } from '../socket.service';
@Component({
  selector: 'app-gameplay',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './gameplay.component.html',
  styleUrls: ['./gameplay.component.css']
})
export class GameplayComponent {

  round: number = 0;
  writtenChallenge: string = '';

  challengeCount!: { easyChallenges: number, mediumChallenges: number, hardChallenges: number, extremeChallenges: number, totalChallenges: number };
  private readonly chance = new Chance();


  constructor(
    private io: SocketService,
    private readonly router: Router
  ) { }


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
        return 'None';
    }
  }


}
