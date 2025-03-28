// gameplay.component.ts
import { Component, OnInit } from '@angular/core';
import { SocketService} from "../socket.service";
import {NgForOf, NgIf} from "@angular/common";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {Player} from "../models/player";

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
  self?: Player;
  players: string[] = [];
  roomId: number = 0;
  currentRound: number = 1;
  isAdmin: boolean = false;
  adminText?: string;
  currentChallenge?: {
    text: string,
    difficulty: string,
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

    this.subscriptions.push(
      this.io.getSessionData().subscribe(sesData => {
        console.log("Session data:", sesData);
        if (sesData && sesData.status === 'playing') {
          this.self = sesData.me;
          this.roomId = sesData.roomId;
          this.players = sesData.players.map((p: { name: any; }) => {p.name});
          this.isAdmin = sesData.isAdmin;
          this.penalties = sesData.penalties;
          this.currentChallenge = {
            text: sesData.text,
            difficulty: sesData.difficulty,
            type: sesData.type,
            round: sesData.round,
            playerName: sesData.playerName
          };
          this.myChallenge = true;
        }
      })
    )

    const navigationData = this.router.getCurrentNavigation();

    if (navigationData?.extras.state) {
      this.roomId = navigationData.extras.state['roomId'] || 0;
      this.players = navigationData.extras.state['players'] || [];
      this.self = navigationData.extras.state['self'];
    }
    this.isAdmin = this.self?.name === this.players[0];
    this.listenForChallenges();

    if (this.isAdmin) {
      this.subscriptions.push(
        this.io.on('admin-challenge-text').subscribe(data => {
          console.log("Admin text:", data);
          this.adminText = data;
        })
      )
    }
  }

  private listenForChallenges(): void {
    this.subscriptions.push(
      this.io.gotChallenge().subscribe((data) => {
        this.myChallenge = true;
        this.currentChallenge = {
          text: data.text,
          difficulty: data.difficulty,
          type: data.type,
          round: data.round,
          playerName: data.playerName
        };
        console.log(this.currentChallenge.playerName, ";;;;;", this.self?.name);
        this.currentRound = data.round;
        this.penalties = data.playerPenalties;
        this.myChallenge = this.self?.name === data.playerName;
      }),

      this.io.otherPlayerChallenge().subscribe((data) => {
        this.myChallenge = false;
        this.currentChallenge = {
          text: data.text,
          difficulty: data.difficulty,
          type: data.type,
          round: data.round,
          playerName: data.playerName
        };
        console.log(this.currentChallenge.playerName, ";;;;;", this.self?.name);
        this.currentRound = data.round;
        this.penalties = data.playerPenalties;
      })
    );
  }

  completeChallenge(): void {
    if (!this.currentChallenge || !this.myChallenge) return;
    this.myChallenge = false;
    this.io.challengeCompleted(this.roomId);
  }

  drunkChallenge(): void {
    if (!this.currentChallenge || !this.myChallenge) return;
    this.myChallenge = false;
    this.io.challengeDrunk(this.roomId);
  }

  forceSkip(): void {
    this.io.forceSkipChallenge(this.roomId);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
