import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import { SocketService } from '../socket.service';
import { Difficulty } from '../models/difficulty';
import {MatFormField} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {DecimalPipe, NgIf} from "@angular/common";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-admin-options-dialog',
  templateUrl: './admin-options-dialog.component.html',
  standalone: true,
  imports: [
    MatFormField,
    FormsModule,
    DecimalPipe,
    MatDialogActions,
    MatInput,
    MatDialogContent,
    MatButton,
    MatDialogClose,
    NgIf,
    MatDialogTitle
  ],
  styleUrls: ['./admin-options-dialog.component.css']
})
export class AdminOptionsDialogComponent implements OnInit {
  playerDifficulty: Difficulty = { easy: 0.3, medium: 0.35, hard: 0.35, extreme: 0 };

  constructor(
    private dialogRef: MatDialogRef<AdminOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      player: any,
      roomId: number,
      isAdmin: boolean,
      isSelf: boolean
    },
    private io: SocketService
  ) {}

  ngOnInit(): void {
    // Initialize with the player's current difficulty values
    if (this.data.player.difficulty_values) {
      this.playerDifficulty = {...this.data.player.difficulty_values};
    }
  }

  isValidDifficulty(): boolean {
    const total = this.getDifficultyTotal();
    return Math.abs(total - 1) < 0.01; // Allow small floating point errors
  }

  getDifficultyTotal(): number {
    return this.playerDifficulty.easy +
      this.playerDifficulty.medium +
      this.playerDifficulty.hard +
      this.playerDifficulty.extreme;
  }

  saveDifficulty(): void {
    if (!this.isValidDifficulty()) return;

    this.io.updatePlayerDifficulty(
      this.data.roomId,
      this.data.player.id,
      this.playerDifficulty
    );

    this.dialogRef.close();
  }

  kickPlayer(): void {
    if (this.data.isAdmin && !this.data.isSelf) {
      this.io.kickPlayer(this.data.roomId, this.data.player.id);
      this.dialogRef.close();
    }
  }
}
