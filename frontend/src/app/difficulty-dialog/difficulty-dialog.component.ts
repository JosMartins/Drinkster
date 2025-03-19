import { Component, Inject } from '@angular/core';
import {CommonModule} from "@angular/common";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {Difficulty} from "../difficulty";

@Component({
  selector: 'app-difficulty-dialog',
  templateUrl: './difficulty-dialog.component.html',
  styleUrls: ['./difficulty-dialog.component.css']
})
export class DifficultyDialogComponent {
  sliderValues: { [key: string]: number } = {
    easy: 33,
    medium: 33,
    hard: 34,
    extreme: 0
  };
  extremeMode: boolean = false;
  errorMsg: string | null = null;

  onSliderChange(changedSlider: string) {
    const sliders = this.extremeMode
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

    this.errorMsg = total !== 100 ? 'The total must be 100%' : null;
  }
}