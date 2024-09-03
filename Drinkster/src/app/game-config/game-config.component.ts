import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgFor} from "@angular/common";
import { Player } from '../player';
import {Difficulty} from "../difficulty";
import {Game} from "../game";
import { MatDialog } from '@angular/material/dialog';
import { DifficultyDialogComponent } from '../difficulty-dialog/difficulty-dialog.component';




@Component({
  selector: 'app-game-config',
  standalone: true, // Mark as standalone
  templateUrl: './game-config.component.html',
  styleUrls: ['./game-config.component.css'],
  imports: [FormsModule, NgFor] // Import FormsModule for ngModel
})
export class GameConfigComponent {

  constructor(public dialog: MatDialog) { }


  players: Player[] = [{ name: '', gender: 'M' }];
  extremeMode: boolean = false;
  difficultyValues : Difficulty = { easy: 0.30, medium: 0.28, hard:0.27, extreme: 0.15 }; //DEFAULT VALUES


  addPlayer() {
    this.players.push({ name: '', gender: 'M' });
  }

  removePlayer(index: number) {
    if (this.players.length > 1) {
      this.players.splice(index, 1);
    }
  }

  toggleExtremeMode() {
    this.extremeMode = !this.extremeMode;
  }

  startGame() {
    //create the game object and save it to session storage
    const game: Game = { players: this.players, extremeMode: this.extremeMode, difficultyValues: this.difficultyValues };
    sessionStorage.setItem('game', JSON.stringify(game));
    console.log(sessionStorage.getItem('game'));
    // Implement navigation or game start logic here
  }


  openDifficultyModal() {
    const dialogRef = this.dialog.open(DifficultyDialogComponent, {
      width: '250px',
      data: this.difficultyValues
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.difficultyValues = result;
      }
    });
  }
}

