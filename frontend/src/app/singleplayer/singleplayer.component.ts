import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from "@angular/common";
import { DEFAULT_DIFFICULTY } from "../models/difficulty";
import { MatDialog } from '@angular/material/dialog';
import { DifficultyDialogComponent } from '../difficulty-dialog/difficulty-dialog.component';
import {Router} from "@angular/router";
import { SocketService} from "../socket.service";
import {PlayerConfig} from "../models/RoomConfig";


@Component({
  selector: 'app-singleplayer',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './singleplayer.component.html',
  styleUrl: './singleplayer.component.css'
})

export class SingleplayerComponent {

  constructor(public dialog: MatDialog, private readonly router: Router, private readonly io: SocketService) { }

  players: PlayerConfig[] = [{name: '', sex: 'M', difficulty_values: DEFAULT_DIFFICULTY }];
  numberOfRememberedChal: number = 20
  randomMode: boolean = false;



  addPlayer() {
    this.players.push({ name: '', sex: 'M', difficulty_values: DEFAULT_DIFFICULTY });
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
    this.io.createSingleplayer({
      name: "singleplayerRoom",
      isPrivate: false,
      password: '',
      player: this.players[0], //this is wrong, but we are not focusing on singleplayer yet
      mode: this.randomMode ? 'random' : 'normal',
      showChallenges: true,
      rememberCount: this.numberOfRememberedChal
    });
    this.router.navigate(['/game']).then();

  }


  toggleRandomMode() {
    this.randomMode = !this.randomMode;
  }
  openDifficultyModal(index: number) {

    const dialogRef = this.dialog.open(DifficultyDialogComponent, {
      width: '350px',
      data: { difficultyValues: this.players[index].difficulty_values }

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.players[index].difficulty_values = result;
      }
    });
  }
}
