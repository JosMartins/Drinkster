import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from "@angular/common";
import { Player } from '../player';
import { Difficulty } from "../difficulty";
import { MatDialog } from '@angular/material/dialog';
import { DifficultyDialogComponent } from '../difficulty-dialog/difficulty-dialog.component';
import {Router} from "@angular/router";
import { io } from 'socket.io-client';


const DEFAULT_DIFFICULTY: Difficulty = { easy: 0.30, medium: 0.35, hard:0.35, extreme: 0};


@Component({
  selector: 'app-singleplayer',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './singleplayer.component.html',
  styleUrl: './singleplayer.component.css'
})

export class SingleplayerComponent {

  constructor(public dialog: MatDialog, private readonly router: Router) { }

  players: Player[] = [{ name: '', gender: 'M'}];
  difficultyValues : Difficulty = DEFAULT_DIFFICULTY;
  numberOfRememberedChal: number = 20
  randomMode: boolean = false;


  addPlayer() {
    this.players.push({ name: '', gender: 'M'});
  }

  removePlayer(index: number) {
    if (this.players.length > 1) {
      this.players.splice(index, 1);
    }
  }


  startGame() {
    //TODO
    //this.router.navigate(['/game']);

  }


  toggleRandomMode() {
    this.randomMode = !this.randomMode;
  }
  openDifficultyModal() {

    const dialogRef = this.dialog.open(DifficultyDialogComponent, {
      width: '350px',
      data: {difficulty: this.difficultyValues}

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.difficultyValues = result;
      }
    });
  }
}