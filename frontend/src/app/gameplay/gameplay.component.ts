// gameplay.component.ts
import { Component, OnInit } from '@angular/core';
import { SocketService} from "../socket.service";
import {NgForOf} from "@angular/common";

interface Penalty {
  rounds: number;
  text: string;
}


@Component({
  selector: 'app-gameplay',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './gameplay.component.html',
  styleUrls: ['./gameplay.component.css']
})
export class GameplayComponent implements OnInit {
  roomId: number = 0;
  currentChallenge: string = 'Loading challenge...';
  penalties: Penalty[] = [];

  constructor(private io: SocketService ) { }

  ngOnInit(): void {
    this.listenForChallenges();
  }

  private listenForChallenges(): void {
    //subscribe to the challenge event
    this.io.gotChallenge().subscribe((challenge: string) => {
      this.currentChallenge = challenge;
    });

  }

  completeChallenge(): void {
    this.io.challengeCompletedted(this.roomId)
  }

  drunkChallenge(): void {
    this.io.challengeDrunk(this.roomId);
  }
}
