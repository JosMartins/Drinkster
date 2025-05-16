import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {SocketService} from '../socket.service';
import {firstValueFrom, Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {DifficultyDialogComponent} from "../difficulty-dialog/difficulty-dialog.component";

interface Player {
  id: string;
  name: string;
  sex: string;
  isAdmin: boolean;
  isReady: boolean;
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
  self?: Player;
  roomName: string = '';
  roomId: string = '';
  players: Player[] = [];
  currentPlayerId: string = '';
  gameMode: string = 'normal';
  showChallenges: boolean = true;
  rememberedChallenges: number = 0;
  isReady: boolean = false;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly io: SocketService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {   }

  ngOnInit() {
    //from cookies
    const storedId = this.io.getCookie('roomId');
    const playerId = this.io.getCookie('playerId');

    if (!storedId || !playerId) { //if there isn't a roomId/playerId stored in cookies, redirect the user.
      console.log("No room ID found/ player ID, redirecting to multiplayer");
      this.io.deleteCookie('roomId'); //safety
      this.io.deleteCookie('playerId');
      this.router.navigate(['/multiplayer']).then();
      return
    }

    this.roomId = storedId;
    this.currentPlayerId = playerId

    //Player Status Update (ready/unready)
    this.subscriptions.push(
      this.io.playerStatusUpdate().subscribe(({playerId, isReady}) => {
        const player = this.players.find((p) => p.id === playerId);
        if (player) player.isReady = isReady;
      }),

      //Player Joined
      this.io.playerJoined().subscribe((newPlayer) => {

        if (!this.players.some(p => p.id === newPlayer.id)) {
          this.players.push({
            id: newPlayer.id,
            name: newPlayer.name,
            sex: newPlayer.sex,
            isAdmin: newPlayer.isAdmin,
            isReady: newPlayer.isReady,
          });
        }
      }),

      //Player Left
      this.io.playerLeft().subscribe((leftPlayer) => {
        this.players = this.players.filter(p => p.name !== leftPlayer.name);
      }),

      //Game Start
      this.io.gameStarted().subscribe(() => {
      this.router.navigate(['/game'], {
        state: {
          self: this.self,
          players: this.players,
          roomId: this.roomId
        }
      }).then();
    })
    );

    this.io.getRoom(this.roomId);
    this.initAsync().catch(err => console.error('Initialisation error:', err));

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
    this.router.navigate(['/multiplayer']).then();
  }

  startGame(): void {
    if (this.isPlayerAdmin()) {
      //everyone ready?
      if (this.players.some(p => !p.isReady)) {
        alert('Not all players are ready!');
        return;
      }

      this.io.startGame(this.roomId, this.currentPlayerId);
      this.router.navigate(['/game']).then();
    }
  }

  openDifficultyModal(player: Player): void {
    if (!this.isPlayerAdmin()) {
      return;
    }


    const playerDifficulty = firstValueFrom(this.io.getPlayerDifficulty(player.id));
    const dialogRef = this.dialog.open(DifficultyDialogComponent, {
      data: {
        difficultyValues: playerDifficulty
      }
    });

    dialogRef.afterClosed().subscribe( async (difficulty) => {
      if (player.id) {
         this.io.updatePlayerDifficulty(this.roomId, player.id, difficulty);
      }
    })

  }

  kickPlayer(player: Player): void {
    if (this.isPlayerAdmin() && player.id) {
      if (confirm(`Are you sure you want to kick ${player.name}?`)) {
        this.io.kickPlayer(this.roomId, player.id);
      }
    }
  }

  // HELPER FUNCTIONS

  isPlayerAdmin(): boolean {
    return this.players.find(player => player.id === this.currentPlayerId)?.isAdmin || false;
  }


  private async initAsync() {
    const roomInfo = await firstValueFrom(this.io.roomInfo(this.roomId));
    if (roomInfo.roomId !== this.roomId) {
      this.roomId = roomInfo.roomId;
      this.io.deleteCookie('roomId');
      this.io.setCookie('roomId', this.roomId, 8);
    }
    this.roomName = roomInfo.roomName;
    this.gameMode = roomInfo.roomMode;
    this.players = roomInfo.players;
    this.rememberedChallenges = roomInfo.rememberedChallenges;
    this.showChallenges = roomInfo.showChallenges;

    this.self = this.players.find(player => player.id === this.currentPlayerId);
  }
}
