import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Game } from '../game';
import Chance from 'chance';
import { Challenge } from '../challenge';
import { Penalty } from '../Penalty';
import { SocketService } from '../socket.service';
@Component({
  selector: 'app-gameplay',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './gameplay.component.html',
  styleUrls: ['./gameplay.component.css']
})
export class GameplayComponent {

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


  penaltyToString(penalty: Penalty): string {
    return 'Unimplemented';
  }
  
}
