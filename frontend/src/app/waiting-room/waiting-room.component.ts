import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {SocketService} from '../socket.service';
import {firstValueFrom, Subscription, merge} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {AdminOptionsDialogComponent} from "../admin-options-dialog/admin-options-dialog.component";

interface Player {
  id?: string;
  name: string;
  sex?: string;
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
  roomId: number = 0;
  players: Player[] = [];
  currentPlayerId: string = '';
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
    const storedId = parseInt(localStorage.getItem("roomId") || '');

    if (!storedId) {
      console.log("No room ID found, redirecting to multiplayer");
      await this.router.navigate(['/multiplayer']).then(_ => null);
    }

    this.roomId = storedId;

    this.currentPlayerId = localStorage.getItem('sessionId') || '';

    //Player Status Update
    this.subscriptions.push(
      this.io.playerStatusUpdate().subscribe(({playerId, isReady}) => {
        const player = this.players.find(p => p.id === playerId);
        if (player) player.isReady = isReady;
      }),

      merge(
        this.io.playerJoined(),
        this.io.adminJoined()
      ).subscribe((newPlayer) => {
        // For admins: Full player object with ID
        // For regular users: Basic {name, isReady} object
        if (!this.players.some(p => p.name === newPlayer.name)) {
          this.players.push({
            id: this.isAdmin ? newPlayer.id : undefined,
            name: newPlayer.name,
            isReady: newPlayer.isReady,
            isAdmin: newPlayer.isAdmin
          });
        }
      })
      ),

      this.io.playerLeft().subscribe((leftPlayer) => {
        this.players = this.players.filter(p => p.name !== leftPlayer.name);
      }),

      this.io.gameStarted().subscribe(() => {
      this.startGame();
    });

    this.io.getRoom(this.roomId);

    try {
      const roomInfo = await firstValueFrom(this.io.roomInfo());
      console.log(roomInfo);
      this.roomName = roomInfo.name;
      this.gameMode = roomInfo.mode;
      this.players = roomInfo.players;
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
      this.io.playerReady();
    } else {
      this.io.playerUnready();
    }
    this.isReady = !this.isReady;
  }


  leaveRoom(): void {
    this.io.leaveRoom();
    this.router.navigate(['/multiplayer']).then(_ => null);
  }

  startGame(): void {
    if (this.isAdmin) {
      this.io.startGame();

      this.router.navigate(['/game']).then(_ => null);
    }
  }

  openAdminOptions(player: Player): void {
    if (!this.isAdmin) {
      return;
    }


    const dialogRef = this.dialog.open(AdminOptionsDialogComponent, {
      data: {
        player: player,
        roomId: this.roomId,
        difficulty: undefined /*this.findDifficulty()   check out*/,
        isSelf: player.id === this.currentPlayerId
      }
    });

    dialogRef.afterClosed().subscribe(_ => null)
  }

  // HELPER FUNCTIONS

  isPlayerAdmin(): boolean {
    return this.players.find(player => player.id === this.currentPlayerId)?.isAdmin || false;
  }

  /* Will need to see this
  findDifficulty(): any {
    this.io.askDifficulty(this.roomId);

    this.io.getDifficulty().subscribe(
      (difficulty: {
        easy: number,
        medium: number,
        hard: number,
        extreme: number
      }) => {
        return difficulty;
      }
    )
  }*/
}
