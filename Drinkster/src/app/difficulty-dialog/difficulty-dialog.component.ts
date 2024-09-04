import { Component, Inject } from '@angular/core';
import {CommonModule} from "@angular/common";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {Difficulty} from "../difficulty";

@Component({
  selector: 'app-difficulty-dialog',
  standalone: true,
  templateUrl: './difficulty-dialog.component.html',
  styleUrls: ['./difficulty-dialog.component.css'],
  imports: [MatFormFieldModule, MatInputModule, FormsModule, CommonModule]
})

export class DifficultyDialogComponent {
  difficulty: Difficulty;
  extremeMode: boolean;
  errorMsg: string = '';

  constructor(
    public dialogRef: MatDialogRef<DifficultyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) {
    this.difficulty = {
      easy: data.difficulty.easy * 100,
      medium: data.difficulty.medium * 100,
      hard: data.difficulty.hard * 100,
      extreme: data.difficulty.extreme * 100
    };
    this.extremeMode = data.extremeMode;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.difficulty.easy + this.difficulty.medium + this.difficulty.hard + (this.extremeMode ? this.difficulty.extreme : 0) != 100) {
      this.errorMsg = 'The sum of the difficulties must be equal to 100%!'
    } else {
      this.dialogRef.close({
            easy: this.difficulty.easy / 100,
            medium: this.difficulty.medium / 100,
            hard: this.difficulty.hard / 100,
            extreme: this.extremeMode ? this.difficulty.extreme / 100 : 0
          });
    }

  }

}
