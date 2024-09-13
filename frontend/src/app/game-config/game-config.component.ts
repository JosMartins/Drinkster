import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgFor} from "@angular/common";
import { Player } from '../player';
import {Difficulty} from "../difficulty";
import {Game} from "../game";
import { MatDialog } from '@angular/material/dialog';
import { DifficultyDialogComponent } from '../difficulty-dialog/difficulty-dialog.component';
import {Router} from "@angular/router";


const DEFAULT_DIFFICULTY_NO_EXTREME: Difficulty = { easy: 0.30, medium: 0.28, hard:0.27, extreme: 0};
const DEFAULT_DIFFICULTY_EXTREME: Difficulty = { easy: 0.30, medium: 0.28, hard:0.27, extreme: 0.15 };


@Component({
  selector: 'app-game-config',
  standalone: true,
  templateUrl: './game-config.component.html',
  styleUrls: ['./game-config.component.css'],
  imports: [FormsModule, NgFor] 
})
export class GameConfigComponent {

  constructor(public dialog: MatDialog, private router: Router) { }


  players: Player[] = [{ name: '', gender: 'M' }];
  extremeMode: boolean = false;
  difficultyValues : Difficulty = DEFAULT_DIFFICULTY_EXTREME;
  numberOfRememberedChal: number = 20
  probabilitiesMode: boolean = false;



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

  toggleProbabilitiesMode() {
    this.probabilitiesMode = !this.probabilitiesMode;
  }

  startGame() {
    //create the game object and save it to session storage
    sessionStorage.clear();

    //this isnt quite how i wanted to do it, but it works for now TODO: fix this
    if (!this.extremeMode && this.difficultyValues.extreme > 0) {
      this.difficultyValues= DEFAULT_DIFFICULTY_NO_EXTREME;
    }
    const game: Game = { players: this.players, extremeMode: this.extremeMode, difficultyValues: this.difficultyValues, remembered: this.numberOfRememberedChal, probabilitiesMode: this.probabilitiesMode};
    sessionStorage.setItem('game', JSON.stringify(game));
    console.log(sessionStorage.getItem('game'));
    this.router.navigate(['/game']);
  }


  openDifficultyModal() {
    
    if (this.difficultyValues) {
      this.difficultyValues = this.extremeMode ? DEFAULT_DIFFICULTY_EXTREME : DEFAULT_DIFFICULTY_NO_EXTREME;
    }

    const dialogRef = this.dialog.open(DifficultyDialogComponent, {
      width: '350px',
      data: {extremeMode: this.extremeMode, difficulty: this.difficultyValues}

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.difficultyValues = result;
      }
    });
  }
}

