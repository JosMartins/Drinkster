import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgFor} from "@angular/common";
import { Player } from '../player';
import {Difficulty} from "../difficulty";
import {Game} from "../game";
import { MatDialog } from '@angular/material/dialog';
import { DifficultyDialogComponent } from '../difficulty-dialog/difficulty-dialog.component';
import {Router} from "@angular/router";




@Component({
  selector: 'app-game-config',
  standalone: true, // Mark as standalone
  templateUrl: './game-config.component.html',
  styleUrls: ['./game-config.component.css'],
  imports: [FormsModule, NgFor] // Import FormsModule for ngModel
})
export class GameConfigComponent {

  constructor(public dialog: MatDialog, private router: Router) { }


  players: Player[] = [{ name: '', gender: 'M' }];
  extremeMode: boolean = false;
  difficultyValues : Difficulty = { easy: 0.30, medium: 0.28, hard:0.27, extreme: 0.15 }; //DEFAULT VALUES
  numberOfRememberedChal: number = 20


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
    const game: Game = { players: this.players, extremeMode: this.extremeMode, difficultyValues: this.difficultyValues, remembered: this.numberOfRememberedChal};
    sessionStorage.setItem('game', JSON.stringify(game));
    console.log(sessionStorage.getItem('game'));
    this.router.navigate(['/game']);
  }


  openDifficultyModal() {
    //change based on extremeMode
      this.difficultyValues = this.extremeMode ? {easy: 0.30, medium: 0.28, hard: 0.27, extreme: 0.15} : {
        easy: 0.35,
        medium: 0.35,
        hard: 0.3,
        extreme: 0
      }

    const dialogRef = this.dialog.open(DifficultyDialogComponent, {
      width: '350px',
      data: {extremeMode: this.extremeMode, difficulty: this.difficultyValues}

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.difficultyValues = result;
        sessionStorage.setItem("difficulty", JSON.stringify(this.difficultyValues));
      }
    });
  }
}

