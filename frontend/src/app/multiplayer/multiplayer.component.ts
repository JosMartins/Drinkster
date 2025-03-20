import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateRoomDialogComponent } from '../create-room-dialog/create-room-dialog.component';

interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
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
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // TODO: Connect to socket and fetch available rooms
    this.fetchRooms();
  }

  fetchRooms(): void {
    // Example data - replace with actual socket connection
    this.rooms = [];
  }

  createRoom(): void {
    const dialogRef = this.dialog.open(CreateRoomDialogComponent, {
      width: '400px',
      data: {} // You can pass initial data here if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the result data from the dialog
        console.log('Room created:', result);
        // TODO: Send room creation request to the server
        // After confirmation, refresh rooms or navigate to the room
      }
    });
  }

  joinRoom(roomId: string): void {
    // TODO: Join the selected room via socket
    console.log(`Joining room ${roomId}`);
  }
}