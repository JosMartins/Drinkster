import {Component, OnDestroy, OnInit} from '@angular/core';
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

export class GameplayComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  self?: Player;
  players?: Player[];
  roomId: string = '';
  currentRound: number = 1;
  adminText?: string;
  currentChallenge?: {
    text: string,
    difficulty: string,
    type: string
    affectedPlayers: string[],
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
          this.self = sesData.self;
          this.roomId = sesData.room.roomId;
          this.players = sesData.room.players
          this.penalties = sesData.penalties;
          this.currentChallenge = {
            text: sesData.text,
            difficulty: sesData.difficulty,
            type: sesData.type,
            affectedPlayers: sesData.affectedPlayers.map((p: Player) => p.id),
          };

        }
      }),
    );

    const navigationData = this.router.getCurrentNavigation();

    if (navigationData?.extras.state) {
      this.roomId = navigationData.extras.state['roomId'];
      this.players = navigationData.extras.state['players'];
      this.self = navigationData.extras.state['self'];

    }

    this.handleRandomEvents();
    this.listenForChallenges();
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  private listenForChallenges(): void {

    if (!this.self || !this.roomId) {
      console.log("Self or roomId is undefined");
      return;
    }

    this.subscriptions.push(
      this.io.onChallenge(this.self.id).subscribe((data) => {
        this.currentChallenge = {
          text: data.challenge.text,
          difficulty: data.challenge.difficulty,
          type: data.challenge.type,
          affectedPlayers: data.challenge.affectedPlayers.map((p: Player) => p.id),
        };
        this.currentRound = data.round;
        this.penalties = data.penaltyList;
        this.adminText = (this.self?.isAdmin) ? data.challenge.text : '';
      }),
    );
  }

  completeChallenge(): void {
    if (!this.currentChallenge) return;
    // @ts-ignore
    this.io.challengeCompleted(this.roomId, this.self.id);
  }

  drunkChallenge(): void {
    if (!this.currentChallenge) return;
    // @ts-ignore
    this.io.challengeDrunk(this.roomId, this.self.id);
  }

  forceSkip(): void {
    this.io.forceSkipChallenge(this.roomId);
  }


  private handleRandomEvents(): void {
    if (!this.self || !this.roomId) {
      console.log("Self or roomId is undefined");
      return;
    }
    this.subscriptions.push(
      this.io.randomEvent(this.self.id).subscribe((data) => {
        console.log("Random event:", data);

        this.dialog.open(EventDialogComponent, {
          width: '400px',
          panelClass: ['custom-dialog', 'transparent-overlay'],
          data: { message: (data.message ?? data.text) ?? "A random event has occurred!" }
        });
      })
    );
  }
}
