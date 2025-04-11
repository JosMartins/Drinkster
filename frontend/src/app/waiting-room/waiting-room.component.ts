import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {SocketService} from '../socket.service';
import {firstValueFrom, Subscription, merge} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {DifficultyDialogComponent} from "../difficulty-dialog/difficulty-dialog.component";

interface Player {
  id?: string;
  name: string;
  sex?: string;
  difficulty?: {
    easy: number,
    medium: number,
    hard: number,
    extreme: number
  };
  isReady: boolean;
  isAdmin?: boolean;
}

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule,
    FormsModule],
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.css'
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  roomName: string = '';
  roomId: string = '';
  players: Player[] = [];
  currentPlayer: { name: string, id: string} = {name: '', id: ''};
  isAdmin: boolean = false;
  gameMode: string = 'normal';
  showChallenges: boolean = true;
  rememberedChallenges: number = 0;
  isReady: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private io: SocketService,
    private router: Router,
    private dialog: MatDialog
  ) {
  }

  async ngOnInit() {
    const storedId = localStorage.getItem("roomId") || '';

    if (!storedId) {
      console.log("No room ID found, redirecting to multiplayer");
      await this.router.navigate(['/multiplayer']).then(_ => null);
    }

    this.roomId = storedId;

    this.currentPlayer.id = localStorage.getItem('sessionId') || '';
    this.currentPlayer.name = localStorage.getItem('playerName') || '';

    //Player Status Update
    this.subscriptions.push(
      this.io.playerStatusUpdate().subscribe(({playerName, isReady}) => {
        const player = this.players.find(p => p.name === playerName);
        if (player) player.isReady = isReady;
      }),

      merge(
        this.io.playerJoined()
      ).subscribe((newPlayer) => {
        // Use unique ID for admins, fallback to name for non-admins
        const uniqueKey = newPlayer.id || newPlayer.name;

        if (!this.players.some(p => (p.id || p.name) === uniqueKey)) {
          this.players.push({
            id: this.isAdmin ? newPlayer.id : undefined,
            name: newPlayer.name,
            isReady: newPlayer.isReady,
            isAdmin: newPlayer.isAdmin,
            difficulty: newPlayer.difficulty,
          });
        }
      }),

      this.io.playerLeft().subscribe((leftPlayer) => {
        this.players = this.players.filter(p => p.name !== leftPlayer.name);
      }),

      this.io.gameStarted().subscribe(() => {
      this.router.navigate(['/game'], {
        state: {
          //string list of names
          self: this.players.filter(p => p.name === this.currentPlayer.name),
          players: this.players.map(p => p.name),
          roomId: this.roomId
        }
      });
    })
    );

    this.io.getRoom(this.roomId);

    try {
      const roomInfo = await firstValueFrom(this.io.roomInfo());
      console.log(roomInfo);
      this.roomName = roomInfo.name;
      this.gameMode = roomInfo.mode;
      this.players = roomInfo.players;
      this.players[0].difficulty = JSON.parse(localStorage.getItem(`${this.players[0].id}_difficulty`) || '');
      this.rememberedChallenges = roomInfo.rememberedChallenges;
      this.showChallenges = roomInfo.showChallenges;

      this.isAdmin = this.isPlayerAdmin();
    } catch (error) {
      console.error('Error retrieving room info:', error);
    }

  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleReady(): void {
    if (!this.isReady) {
      this.io.playerReady(this.roomId, this.currentPlayerId);
    } else {
      this.io.playerUnready(this.roomId, this.currentPlayerId);
    }
    this.isReady = !this.isReady;
  }


  leaveRoom(): void {
    this.io.leaveRoom(this.roomId, this.currentPlayerId);
    this.router.navigate(['/multiplayer']).then(_ => null);
  }

  startGame(): void {
    if (this.isAdmin) {
      //everyone ready?
      if (this.players.some(p => !p.isReady)) {
        alert('Not all players are ready!');
        return;
      }

      this.io.startGame(this.roomId, this.currentPlayerId);
      this.router.navigate(['/game']).then(_ => null);
    }
  }

  openDifficultyModal(player: Player): void {
    if (!this.isAdmin) {
      return;
    }

    const dialogRef = this.dialog.open(DifficultyDialogComponent, {
      data: {
        difficultyValues: player.difficulty
      }
    });

    dialogRef.afterClosed().subscribe( async (difficulty) => {
      if (player.id) {
         this.io.updatePlayerDifficulty(this.roomId, player.id, difficulty);

         let diffSub= this.io.on("lol").subscribe(
           async (data)  => {
              if (data.playerId === player.id) {
                player.difficulty = data.difficultyValues;
              }
           }
        );
        this.subscriptions.push(diffSub);
      }
    })


  }

  kickPlayer(player: Player): void {
    if (this.isAdmin && player.id) {
      if (confirm(`Are you sure you want to kick ${player.name}?`)) {
        this.io.kickPlayer(this.roomId, player.id);
      }
    }
  }

  // HELPER FUNCTIONS

  isPlayerAdmin(): boolean {
    return this.players.find(player => player.id === this.currentPlayer?.id)?.isAdmin || false;
  }
}
