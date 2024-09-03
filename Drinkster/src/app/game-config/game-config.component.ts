import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgFor} from "@angular/common"; // Import FormsModule

interface Player {
  name: string;
  gender: 'M' | 'F';
}

@Component({
  selector: 'app-game-config',
  standalone: true, // Mark as standalone
  templateUrl: './game-config.component.html',
  styleUrls: ['./game-config.component.css'],
  imports: [FormsModule, NgFor] // Import FormsModule for ngModel
})
export class GameConfigComponent {
  players: Player[] = [{ name: '', gender: 'M' }];
  extremeMode: boolean = false;

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
    console.log('Players:', this.players);
    console.log('Extreme Mode:', this.extremeMode);
    //Save players and extreme mode to session storage
    sessionStorage.setItem('players', JSON.stringify(this.players));
    sessionStorage.setItem('extremeMode', JSON.stringify(this.extremeMode));
    // Implement navigation or game start logic here
  }
}
