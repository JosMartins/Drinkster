// gameplay.component.ts
import { Component, OnInit } from '@angular/core';
import { SocketService} from "../socket.service";
import {NgForOf, NgIf} from "@angular/common";

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
  self? : string;
  isAdmin: boolean = false;
  roomId: number = 0;
  currentChallenge: string = 'Loading challenge...';
  currentRound: number = 0;
  penalties: Penalty[] = [];
  myChallenge: boolean = false;

  constructor(private io: SocketService ) { }

  ngOnInit(): void {
    this.listenForChallenges();

    this.io.on('session-restored').subscribe((data: any) => {
      if (data.status === 'playing') {
        this.self = data.playerName;
        this.isAdmin = data.isAdmin;
        this.penalties = data.penalties;
        this.currentChallenge = data.currentChallenge?.challenge || 'Loading challenge...';
        this.myChallenge = data.currentChallenge?.player === this;
      }
    });
  }

  private listenForChallenges(): void {
    //subscribe to the challenge event
    this.io.gotChallenge().subscribe((data) => {
      console.log("MINE:",data);
      this.myChallenge = true;
      this.currentChallenge = data.text;
      this.currentRound = data.round;
      this.penalties = data.playerPenalties;
    });

    this.io.otherPlayerChallenge().subscribe((data) => {
      console.log("OTHER:",data);
      this.myChallenge = false;
      this.currentChallenge = data.text;
      this.currentRound = data.round;
      this.penalties = data.playerPenalties;
    });
  }

  completeChallenge(): void {
    this.io.challengeCompleted(this.roomId)
  }

  drunkChallenge(): void {
    this.io.challengeDrunk(this.roomId);
  }

  forceSkip(): void {
    this.io.forceSkipChallenge(this.roomId);
  }
}
