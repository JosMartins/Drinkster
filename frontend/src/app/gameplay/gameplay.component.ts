// gameplay.component.ts
import { Component, OnInit } from '@angular/core';
import { SocketService} from "../socket.service";
import {NgForOf, NgIf} from "@angular/common";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";

interface Penalty {
  text: string;
  rounds: number;
}

@Component({
  selector: 'app-gameplay',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './gameplay.component.html',
  styleUrls: ['./gameplay.component.css']
})
export class GameplayComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  players: string[] = [];
  roomId: number = 0;
  currentRound: number = 1;
  isAdmin: boolean = false;
  self?: string;

  currentChallenge?: {
    text: string,
    type: 'challenge' | 'penalty',
    round: number,
    playerName: string,
    penalty_opts?: {
      rounds: number,
      text: string
    }
  };
  penalties: Penalty[] = [];
  myChallenge: boolean = false;

  constructor(
    private io: SocketService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const navigationData = this.router.getCurrentNavigation();

    if (navigationData?.extras.state) {
      this.roomId = navigationData.extras.state['roomId'] || 0;
      this.players = navigationData.extras.state['players'] || [];
    }

    this.listenForChallenges();

    this.io.on('session-restored').subscribe((data: any) => {
      if (data.status === 'playing') {
        this.self = data.playerName;
        this.isAdmin = data.isAdmin;
        this.penalties = data.penalties;
        this.currentChallenge = data.currentChallenge || {
          text: 'Loading challenge...',
          type: 'challenge',
          round: this.currentRound,
          playerName: ''
        };
        this.myChallenge = data.currentChallenge?.player === this.self;
      }
    });
  }

  private listenForChallenges(): void {
    this.subscriptions.push(
      this.io.gotChallenge().subscribe((data) => {
        console.log("MINE:", data);
        this.myChallenge = true;
        this.currentChallenge = {
          text: data.text,
          type: 'challenge',
          round: data.round,
          playerName: data.playerName
        };
        this.currentRound = data.round;
        this.penalties = data.playerPenalties;
      }),

      this.io.otherPlayerChallenge().subscribe((data) => {
        console.log("OTHER:", data);
        this.myChallenge = false;
        this.currentChallenge = {
          text: data.text,
          type: 'challenge',
          round: data.round,
          playerName: data.playerName
        };
        this.currentRound = data.round;
        this.penalties = data.playerPenalties;
      })
    );
  }

  completeChallenge(): void {
    if (!this.currentChallenge) return;
    this.io.challengeCompleted(this.roomId);
  }

  drunkChallenge(): void {
    this.io.challengeDrunk(this.roomId);
  }

  forceSkip(): void {
    this.io.forceSkipChallenge(this.roomId);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
