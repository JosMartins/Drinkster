import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateRoomDialogComponent } from '../create-room-dialog/create-room-dialog.component';
import {SocketService} from "../socket.service";
import {PlayerConfigComponent} from "../player-config/player-config.component";

interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  playerCount: number;
}

@Component({
  selector: 'app-multiplayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.css']
})
export class MultiplayerComponent implements OnInit {
  rooms: Room[] = [];

  constructor(
    private readonly router: Router,
    private dialog: MatDialog,
    private socketService: SocketService,
  ) {}

  ngOnInit(): void {
    // Subscribe to initial room list
    this.socketService.listRooms().subscribe((rooms: Room[]) => {
      this.rooms = rooms;
    });

    // Subscribe to real-time updates
    this.socketService.roomUpdate().subscribe((rooms: Room[]) => {
      this.rooms = rooms;
    });

    // Request the initial room list
    this.socketService.getRooms();
  }

  createRoom(): void {
    const dialogRef = this.dialog.open(CreateRoomDialogComponent, {
      width: '800px',
      panelClass: ['custom-dialog', 'transparent-overlay'],
      hasBackdrop: false,
      data: {} // You can pass initial data here if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the result data from the dialog
        console.log('Room created:', result);
      }
    });
  }

  joinRoom(roomId: string): void {
    console.log(`Joining room ${roomId}`);

    const dialogRef = this.dialog.open(PlayerConfigComponent, {
      width: '800px',
      panelClass: ['custom-dialog', 'transparent-overlay'],
      hasBackdrop: false,
      data: roomId
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/room']).then(_ => null);
      }
    })


  }
}
