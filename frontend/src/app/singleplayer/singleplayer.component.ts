import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from "@angular/common";
import { Player } from '../models/player';
import { DEFAULT_DIFFICULTY } from "../models/difficulty";
import { MatDialog } from '@angular/material/dialog';
import { DifficultyDialogComponent } from '../difficulty-dialog/difficulty-dialog.component';
import {Router} from "@angular/router";
import { SocketService} from "../socket.service";


@Component({
  selector: 'app-singleplayer',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './singleplayer.component.html',
  styleUrl: './singleplayer.component.css'
})

export class SingleplayerComponent {

  constructor(public dialog: MatDialog, private readonly router: Router, private socketService: SocketService) { }

  players: Player[] = [{id: "0", name: '', gender: 'M', difficulty: DEFAULT_DIFFICULTY }];
  numberOfRememberedChal: number = 20
  randomMode: boolean = false;


  addPlayer() {
    this.players.push({ id:"1", name: '', gender: 'M', difficulty: DEFAULT_DIFFICULTY });
  }

  removePlayer(index: number) {
    if (this.players.length > 1) {
      this.players.splice(index, 1);
    }
  }

  changeDifficulty(index: number) {
    this.openDifficultyModal(index);


  }

  startGame() {
    //TODO create the room (check backend requirements)
    this.router.navigate(['/game']);

  }


  toggleRandomMode() {
    this.randomMode = !this.randomMode;
  }
  openDifficultyModal(index: number) {

    const dialogRef = this.dialog.open(DifficultyDialogComponent, {
      width: '350px',
      data: { difficultyValues: this.players[index].difficulty }

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.players[index].difficulty = result;
      }
    });
  }
}
