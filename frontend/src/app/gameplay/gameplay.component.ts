// gameplay.component.ts
import { Component, OnInit } from '@angular/core';
import { SocketService} from "../socket.service";
import {NgForOf, NgIf} from "@angular/common";
import {merge, Subscription} from "rxjs";
import {Router} from "@angular/router";

interface Penalty {
  rounds: number;
  text: string;
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

  currentChallenge?: {
    text: string,
    type: 'challenge' | 'penalty',
    round: number
    playerName: string,
    penalty_opts?: {
      rounds: number,
      text: string
    }
  }
  penalties: Penalty[] = [];

  constructor(private io: SocketService,
              private router: Router,) { }

  ngOnInit(): void {
    const navigationData = this.router.getCurrentNavigation();

    if (navigationData?.extras.state) {
      this.roomId = navigationData.extras.state['roomId'] || 0;
      this.players = navigationData.extras.state['players'] || [];
    }

    this.listenForChallenges();
  }

  private listenForChallenges(): void {
    //subscribe to the challenge event

    merge(
      this.io.gotChallenge(),
      this.io.gotChallenge()).subscribe((ch) => {
      this.currentChallenge = ch;

    });

  }

  completeChallenge(): void {
    if (!this.currentChallenge) {
      return;
    }

    if (this.currentChallenge.type === 'penalty' && this.currentChallenge.penalty_opts) {
      this.penalties.push({
        rounds: this.currentChallenge.penalty_opts.rounds + 1,
        text: this.currentChallenge.penalty_opts.text
      });
    }
    this.io.challengeCompleted(this.roomId)

    this.penalties.forEach((pn) => {
      if (pn.rounds === 0) { // remove penalty
        this.penalties = this.penalties.filter(p => p !== pn);
      } else {
        pn.rounds = pn.rounds - 1;
      }
    });
  }

  drunkChallenge(): void {
    this.io.challengeDrunk(this.roomId);

    this.penalties.forEach((pn) => {
      if (pn.rounds === 0) { // remove penalty
        this.penalties = this.penalties.filter(p => p !== pn);
      } else {
        pn.rounds = pn.rounds - 1;
      }
    });
  }
}
