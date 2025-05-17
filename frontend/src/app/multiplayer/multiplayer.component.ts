import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateRoomDialogComponent } from '../create-room-dialog/create-room-dialog.component';
import {SocketService} from "../socket.service";
import {PlayerConfigComponent} from "../player-config/player-config.component";
import {filter, switchMap, take} from "rxjs";

interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  players: number;
  state: string;
}

interface RoomListResponse {
  rooms: Room[];
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
    private readonly dialog: MatDialog,
    private readonly socketService: SocketService,
  ) {}

  ngOnInit(): void {
    this.socketService.connectionStatus().pipe(
      filter(Boolean),      // only TRUE values
      take(1),
      switchMap(() => {
        const rooms$ = this.socketService.listRooms();
        this.socketService.getRooms();
        return rooms$;
      })
    ).subscribe((response: RoomListResponse) => {
      this.rooms = response.rooms;
    });
  }


  createRoom(): void {
    const dialogRef = this.dialog.open(CreateRoomDialogComponent, {
      width: '800px',
      panelClass: ['custom-dialog', 'transparent-overlay'],
      //hasBackdrop: false,
      data: {} // You can pass initial data here if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the result data from the dialog
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
        this.router.navigate(['/room']).then();
      }
    })


  }
}
