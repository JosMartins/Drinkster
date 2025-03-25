import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';
import {firstValueFrom, Subscription} from 'rxjs';

interface Player {
  id: string;
  name: string;
  sex: string;
  isReady: boolean;
  isAdmin: boolean;
}

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.css'
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  roomName: string = '';
  roomId: number = 0;
  players: Player[] = [ ];
  currentPlayerId: string = '';
  isAdmin: boolean = false;
  gameMode: string = 'normal';
  showChallenges: boolean = true;
  rememberedChallenges: number = 0;
  isReady: boolean = false;
  admin: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private io: SocketService,
    private router: Router,
  ) {}

  async ngOnInit() {
    const storedId = parseInt(localStorage.getItem("roomId") || '');

    if (!storedId) {
      console.log("No room ID found, redirecting to multiplayer");
      await this.router.navigate(['/multiplayer']).then(_ => null);
    }

    this.roomId = storedId;

    this.currentPlayerId = localStorage.getItem('sessionId') || '';

    // Subscribe to room updates
    this.subscriptions.push(
      this.io.roomUpdate().subscribe(roomData => {
        this.roomName = roomData.name;
        this.roomId = roomData.id;
        this.players = roomData.players;

      })
    );

    // Listen for game start event
    this.subscriptions.push(
      this.io.gameStarted().subscribe(() => {
        this.router.navigate(['/gameplay']).then(_ => null);
      })
    );

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
    if (this.isReady) {
      this.io.playerReady();
    } else {
      this.io.playerUnready();
    }
    this.isReady = !this.isReady;
  }


  leaveRoom(): void {
    this.io.leaveRoom();
    this.router.navigate(['/multiplayer']).then(_ => null );
  }

  startGame(): void {
    if (this.isAdmin) {
      this.io.startGame();
    }
  }

  // HELPER FUNCTIONS

  isPlayerAdmin(): boolean {
    return this.players.find(player => player.id === this.currentPlayerId)?.isAdmin || false;
  }
}
