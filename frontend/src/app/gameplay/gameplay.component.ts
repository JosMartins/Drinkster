import {Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService} from "../socket.service";
import {NgForOf, NgIf} from "@angular/common";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {Player} from "../models/player";
import {EventDialogComponent} from "../event-dialog/event-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {PlayerDto} from "../models/dto/player.dto";

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
  buttonAcked: boolean = false;

  constructor(
    private readonly io: SocketService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) { }

  ngOnInit(): void {

    this.subscriptions.push(
      this.io.getSessionData().subscribe(sesData => {
        if (sesData) {
          this.self = sesData.self;
          this.roomId = sesData.room.roomId;
          this.players = sesData.room.players
          this.penalties = sesData.penalties;

          if (sesData.playerTurn) {
            this.currentChallenge = {
                        text: sesData.playerTurn.challenge.text,
                        difficulty: sesData.playerTurn.challenge.difficulty,
                        type: sesData.playerTurn.challenge.type,
                        affectedPlayers: sesData.playerTurn.affectedPlayers.map((p: Player) => p.id)
                      };

            this.myChallenge = sesData.playerTurn.playerId === this.self?.id;

            if (this.self?.isAdmin) {
              this.adminText = this.currentChallenge.text;
            }

          } else {
            this.currentChallenge = {
              text: "Waiting for the next challenge... DRINK!",
              difficulty: "easy",
              type: "EVERYONE_DRINK",
              affectedPlayers: []
            }
          }

          this.handleRandomEvents();
          this.listenForChallenges();
        }
      }),
    );


  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.self && this.roomId) {
      this.io.leaveRoom(this.roomId, this.self?.id);
    }
    this.io.disconnect();
  }

  private listenForChallenges(): void {

    if (!this.self || !this.roomId) {
      console.log("Self or roomId is undefined");
      return;
    }

    this.subscriptions.push(
      this.io.onWait().subscribe(data => {
        this.currentChallenge = {
          text: data.text,
          difficulty: data.difficulty,
          type: data.type,
          affectedPlayers: []
        }
      }),

      this.io.onChallenge().subscribe((data) => {
        this.buttonAcked = false;
        this.currentChallenge = {
          text: data.challenge.text,
          difficulty: data.challenge.difficulty,
          type: data.challenge.type,
          affectedPlayers: data.affectedPlayers.map((p: PlayerDto) => p.id),
        };
        this.penalties = data.penaltyList;
        this.currentRound = data.round;
        this.adminText = (this.self?.isAdmin) ? data.challenge.text : '';
      }),
    );
  }

  completeChallenge(): void {
    if (!this.currentChallenge) return;
    // @ts-ignore
    this.io.challengeCompleted(this.roomId, this.self.id).subscribe( ack => {
      if ('status' in ack && ack.status) {
        this.changeButtonColors();
      }
    });
  }

  drunkChallenge(): void {
    if (!this.currentChallenge) return;
    // @ts-ignore
    this.io.challengeDrunk(this.roomId, this.self.id).subscribe( ack => {
      if ('status' in ack && ack.status) {
        this.changeButtonColors();
      }
    });
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
      this.io.randomEvent().subscribe((data) => {
        console.log("Random event:", data);

        this.dialog.open(EventDialogComponent, {
          width: '400px',
          panelClass: ['custom-dialog', 'transparent-overlay'],
          data: { message: data.text}
        });
      })
    );
  }

  protected showButton(): boolean {
    if (this.currentChallenge?.text?.includes("Getting challenge ready...")) return false;

    switch (this.currentChallenge?.type) {
      case 'EVERYONE_DRINK': return true
      case "CHOSEN_DRINK": return true
      case "YOU_DRINK": return this.currentChallenge.affectedPlayers.includes(this.self?.id ?? '');
      case "BOTH_DRINK": return this.currentChallenge.affectedPlayers.includes(this.self?.id ?? '');
      default: return false;
    }
  }

  displayChallengeText(): string {
    if (this.currentChallenge?.type == "EVERYONE_DRINK" || this.currentChallenge?.type == "CHOSEN_DRINK" || this.currentChallenge?.affectedPlayers.includes(this.self?.id ?? '')) {
      return this.currentChallenge.text;
    } else {
      //player 1 and player 2 are playing, or drinking X
      const playing = this.players?.filter(p => this.currentChallenge?.affectedPlayers.includes(p.id));
      if (playing?.length === 2) {
        return `${playing[0].name} and ${playing[1].name} are playing or drinking!`;
      } else if (playing?.length === 1) {
        return `${playing[0].name} is playing or drinking!`;
      } else {
        return "No one is playing!";
      }

    }
  }

  // Change buttons color to a color that indicated that the button press was registered/ack by te server.
  changeButtonColors(): void {
    this.buttonAcked = true;
  }
}

