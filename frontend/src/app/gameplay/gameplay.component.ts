// gameplay.component.ts
import { Component, OnInit } from '@angular/core';
import { SocketService} from "../socket.service";
import {NgForOf, NgIf} from "@angular/common";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {Player} from "../models/player";
import {EventDialogComponent} from "../event-dialog/event-dialog.component";
import {MatDialog} from "@angular/material/dialog";

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
  private readonly subscriptions: Subscription[] = [];
  self?: Player;
  players: string[] = [];
  roomId: string = '';
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
    private readonly io: SocketService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) { }

  ngOnInit(): void {

    this.subscriptions.push(
      this.io.getSessionData().subscribe(sesData => {
        console.log("Session data:", sesData);
        if (sesData && sesData.status === 'playing') {
          this.self = sesData.me;
          this.roomId = sesData.roomId;
          this.players = sesData.players.map((p: { name: any; }) => p.name);
          this.isAdmin = sesData.isAdmin;
          this.penalties = sesData.penalties;
          this.currentChallenge = {
            text: sesData.text,
            difficulty: sesData.difficulty,
            type: sesData.type,
            round: sesData.round,
            playerName: sesData.playerName
          };

          if (this.isAdmin) {
            this.subscriptions.push(
              this.io.on('admin-challenge-text').subscribe(data => {
                console.log("Admin text:", data);
                this.adminText = data;
              })
            );
          }
        }
      }),
    );

    const navigationData = this.router.getCurrentNavigation();

    if (navigationData?.extras.state) {
      this.roomId = navigationData.extras.state['roomId'];
      this.players = navigationData.extras.state['players'] || [];
      this.self = navigationData.extras.state['self'];
    }

    if (this.isAdmin) {
      this.subscriptions.push(
        this.io.on('admin-challenge-text').subscribe(data => {
          console.log("Admin text:", data);
          this.adminText = data;
        })
      )}

    this.handleRandomEvents();
    this.listenForChallenges();

  }

  private listenForChallenges(): void {
    this.subscriptions.push(
      this.io.gotChallenge().subscribe((data) => {
        console.log("MINE:", data);
        this.currentChallenge = {
          text: data.text,
          difficulty: data.difficulty,
          type: data.type,
          round: data.round,
          playerName: data.playerName
        };
        this.currentRound = data.round;
        this.penalties = data.playerPenalties;
        console.log(this.self?.name, ";;;", data.playerName);
        this.myChallenge = this.self?.name === data.playerName;
      }),

      this.io.otherPlayerChallenge().subscribe((data) => {
        console.log("OTHER:", data);
        this.myChallenge = false;
        this.currentChallenge = {
          text: data.text,
          difficulty: data.difficulty,
          type: data.type,
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
    if (!this.currentChallenge) return;
    this.io.challengeDrunk(this.roomId);
  }

  forceSkip(): void {
    this.io.forceSkipChallenge(this.roomId);
  }


  private handleRandomEvents(): void {
    this.subscriptions.push(
      this.io.randomEvent().subscribe((data) => {
        console.log("Random event:", data);

        this.dialog.open(EventDialogComponent, {
          width: '400px',
          panelClass: ['custom-dialog', 'transparent-overlay'],
          data: { message: data.message || data.text || "A random event has occurred!" }
        });
      })
    );
  }
}
