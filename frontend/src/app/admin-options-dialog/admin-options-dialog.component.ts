import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import { SocketService } from '../socket.service';
import { Difficulty } from '../models/difficulty';
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {DecimalPipe, NgIf} from "@angular/common";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatSlider} from "@angular/material/slider";

@Component({
  selector: 'app-admin-options-dialog',
  templateUrl: './admin-options-dialog.component.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatDialogActions,
    MatInputModule,
    MatDialogContent,
    MatButton,
    MatButtonModule,
    MatDialogClose,
    NgIf,
    MatDialogTitle,
    MatSlider
  ],
  styleUrls: ['./admin-options-dialog.component.css']
})
export class AdminOptionsDialogComponent {
  sliderValues = { easy: 0, medium: 0, hard: 0, extreme: 0 };
  errorMsg: string = '';

  constructor(
    private socketService: SocketService,
    public dialogRef: MatDialogRef<AdminOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.player.difficulty_values) {
      // Convert [0..1] values to [0..100] for sliders
      this.sliderValues.easy = Math.round(this.data.player.difficulty_values.easy * 100);
      this.sliderValues.medium = Math.round(this.data.player.difficulty_values.medium * 100);
      this.sliderValues.hard = Math.round(this.data.player.difficulty_values.hard * 100);
      this.sliderValues.extreme = Math.round(this.data.player.difficulty_values.extreme * 100);
    }

  }

  formatLabel(value: number): string {
    return `${value}%`;
  }

  onSliderChange(changedSlider: string) {
    const sliders: (keyof typeof this.sliderValues)[] = ['easy', 'medium', 'hard', 'extreme'];
    let total = sliders.reduce((sum, slider) => sum + this.sliderValues[slider], 0);

    if (total > 100) {
      this.errorMsg = 'Total cannot exceed 100%!';
    } else {
      this.errorMsg = '';
    }
  }

  saveDifficulty(): void {
    const total = Object.values(this.sliderValues).reduce((a, b) => a + b, 0);

    if (total !== 100) {
      this.errorMsg = 'Total must equal 100%!';
      return;
    }

    const difficulty = {
      easy: this.sliderValues.easy / 100,
      medium: this.sliderValues.medium / 100,
      hard: this.sliderValues.hard / 100,
      extreme: this.sliderValues.extreme / 100
    };

    this.socketService.updatePlayerDifficulty(
      this.data.roomId,
      this.data.player.id,
      difficulty
    );

    this.dialogRef.close();
  }

  kickPlayer(): void {
    if (this.data.isAdmin && !this.data.isSelf) {
      this.socketService.kickPlayer(this.data.roomId, this.data.player.id);
      this.dialogRef.close();
    }
  }
}
