import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';
import { Subscription } from 'rxjs';

interface Player {
  id: string;
  playerName: string;
  playerSex: string;
  isAdmin: boolean;
  isReady: boolean;
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
  players: Player[] = [
    { id: '123', playerName: 'Test1', playerSex: 'M', isAdmin: false, isReady: false },
    { id: '1234', playerName: 'Test2', playerSex: 'M', isAdmin: true, isReady: true },
    { id: '321', playerName: 'Test3', playerSex: 'F', isAdmin: false, isReady: true }

  ];
  currentPlayerId: string = '';
  isAdmin: boolean = false;
  gameMode: string = 'normal';
  showChallenges: boolean = true;
  isReady: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private io: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentPlayerId = localStorage.getItem('playerId') || '';

    // Subscribe to room updates
    this.subscriptions.push(
      this.io.roomUpdate().subscribe(roomData => {
        this.roomName = roomData.name;
        this.roomId = roomData.id;
        this.players = roomData.players;

        // Find current player
        const currentPlayer = this.players.find(p => p.id === this.currentPlayerId);
        if (currentPlayer) {
          this.isAdmin = currentPlayer.isAdmin;
          this.isReady = currentPlayer.isReady;
        }

      })
    );

    // Listen for game start event
    this.subscriptions.push(
      this.io.gameStarted().subscribe(() => {
        this.router.navigate(['/gameplay']).then(_ => null);
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleReady(): void {
    this.isReady = !this.isReady;
    if (this.isReady) {
      this.io.playerReady();
    } else {
      this.io.playerUnready();
    }
  }


  leaveRoom(): void {
    this.io.leaveRoom();
    this.router.navigate(['/lobby']).then(_ => null );
  }

  startGame(): void {
    if (this.isAdmin) {
      this.io.startGame();
    }
  }
}
