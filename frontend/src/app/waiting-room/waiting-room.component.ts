import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {SocketService} from '../socket.service';
import {filter, firstValueFrom, Subscription, take} from 'rxjs';
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
    debugger;
    const storedId = this.io.getData('roomId');
    const playerId = this.io.getData('playerId');

    if (!storedId || !playerId) {
      console.log("No room ID found/ player ID, redirecting to multiplayer");
      this.io.deleteData('roomId'); //safety
      this.io.deleteData('playerId');
      this.router.navigate(['/multiplayer']).then();
      return
    }

    this.roomId = storedId;
    this.currentPlayerId = playerId

    //Player Status Update (ready/unready)
    this.subscriptions.push(
      this.io.playerStatusUpdate(this.roomId).subscribe(({id, status}) => {
        console.log('Player status update:', id, status);
        const player = this.players.find((p) => p.id === id);
        if (player) player.isReady = status;
      }),

      //Player Joined
      this.io.playerJoined(this.roomId).subscribe((newPlayer) => {
        console.log('New player joined:', newPlayer);
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
      this.io.playerLeft(this.roomId).subscribe(id => this.players.filter(p => p.id !== id)),

      this.io.playerKicked().subscribe(_ => {
        alert("You Have been Kicked.");
        this.router.navigate(['/multiplayer']).then()
      }),
      //Game Start
      this.io.gameStarted(this.roomId).subscribe(() => {
        console.log('Game started');
        this.io.setSessionData({
          self: this.self,
          room: {
            roomId: this.roomId,
            players: this.players
          },
          playerTurn: null
        });
        this.router.navigate(['/game'], {}).then();

      })
    );

    this.io.connectionStatus()
      .pipe(filter(Boolean), take(1))
      .subscribe(() => {
        this.initAsync().then();
        this.io.getRoom(this.roomId);

      });
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

      this.io.startGame(this.roomId);
    }
  }

  async openDifficultyModal(player: Player) {
    if (!this.self || !this.isPlayerAdmin()) {
      return;
    }

    const playerDifficulty = await firstValueFrom(this.io.getPlayerDifficulty(this.roomId, player.id));

    const dialogRef = this.dialog.open(DifficultyDialogComponent, {
      data: {
        difficultyValues: playerDifficulty
      }
    });

    dialogRef.afterClosed().subscribe( async (difficulty) => {
      if (player.id && difficulty) {
         this.io.updatePlayerDifficulty(this.roomId, player.id, difficulty);
      }
    })

  }

  kickPlayer(player: Player): void {
    if (this.isPlayerAdmin() && player.id && player.id !== this.currentPlayerId) {
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
    try {
      const roomInfo = await firstValueFrom(this.io.getRoom(this.roomId));

      // Only successful GameRoomDto reaches here
      if (roomInfo.roomId !== this.roomId) {
        this.roomId = roomInfo.roomId;
        this.io.deleteData('roomId');
        this.io.saveData('roomId', this.roomId);
      }
      // ... rest of success logic

    } catch (error: any) {
      // Handle both backend errors and transport errors
      console.error('Room fetch failed:', error);

      if (error.code) {
        // Backend error (ErrorDto)
        alert(`Error ${error.code}: ${error.message}`);
      } else {
        // Transport error
        alert('Network connection failed');
      }

      this.router.navigate(['/multiplayer']).then();
    }
  }

}
