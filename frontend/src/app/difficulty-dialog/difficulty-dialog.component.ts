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
  sliderValues = {
    easy: 33,
    medium: 33,
    hard: 34,
    extreme: 0
  };
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

  onSliderChange(changedSlider: string) {
    const sliders: (keyof typeof this.sliderValues)[] = this.extremeMode
      ? ['easy', 'medium', 'hard', 'extreme']
      : ['easy', 'medium', 'hard'];

    let total = sliders.reduce((sum, slider) => sum + this.sliderValues[slider], 0);
    let difference = 100 - total;

    if (difference !== 0) {
      const adjustableSliders = sliders.filter(s => s !== changedSlider);

      for (let slider of adjustableSliders) {
        if (this.sliderValues[slider] + difference >= 0) {
          this.sliderValues[slider] += difference;
          break;
        }
      }
    }

    this.errorMsg = total !== 100 ? 'The total must be 100%' : '';
  }
}