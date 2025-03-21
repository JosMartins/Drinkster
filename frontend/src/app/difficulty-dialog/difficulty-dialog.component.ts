import { Component, Inject } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { Difficulty } from "../difficulty";

@Component({
  selector: 'app-difficulty-dialog',
  standalone: true,
  templateUrl: './difficulty-dialog.component.html',
  styleUrls: ['./difficulty-dialog.component.css'],
  imports: [
    MatDialogModule,
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule, 
    CommonModule, 
    MatSliderModule,
    MatButtonModule
  ]
})
export class DifficultyDialogComponent {
  /**
   * We keep difficulty in [0..1] form internally. 
   * sliderValues is in [0..100] for the UI.
   */
  difficulty!: Difficulty;
  sliderValues = { easy: 0, medium: 0, hard: 0, extreme: 0 };
  errorMsg: string = '';

  constructor(
    public dialogRef: MatDialogRef<DifficultyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data : {difficultyValues : Difficulty}
  ) {
    // Convert [0..1] difficulty to [0..100] for the sliders
    this.sliderValues.easy = Math.round(data.difficultyValues.easy * 100);
    this.sliderValues.medium = Math.round(data.difficultyValues.medium * 100);
    this.sliderValues.hard = Math.round(data.difficultyValues.hard * 100);
    this.sliderValues.extreme = Math.round(data.difficultyValues.extreme * 100);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // Convert sliderValues [0..100] back to difficulty [0..1]
    const total = 
        this.sliderValues.easy + 
        this.sliderValues.medium + 
        this.sliderValues.hard + 
        this.sliderValues.extreme;

    if (total !== 100) {
      this.errorMsg = 'The sum of the difficulties must be equal to 100%!';
      return;
    }
    this.difficulty = {
      easy: this.sliderValues.easy / 100,
      medium: this.sliderValues.medium / 100,
      hard: this.sliderValues.hard / 100,
      extreme: this.sliderValues.extreme / 100
    }
    this.dialogRef.close(this.difficulty);
  }

  onSliderChange(changedSlider: string) {
    const sliders: (keyof typeof this.sliderValues)[] = ['easy', 'medium', 'hard', 'extreme'];
    
    // Current total
    let total = sliders.reduce((sum, slider) => sum + this.sliderValues[slider], 0);
    
    // Difference from 100
    let difference = 100 - total;
    
    if (difference !== 0) {
      // Sliders that can be adjusted
      const adjustableSliders = sliders.filter(s => s !== changedSlider);
      
      // Calculate total of adjustable sliders
      const adjustableTotal = adjustableSliders.reduce(
        (sum, slider) => sum + this.sliderValues[slider], 
        0
      );
      
      if (adjustableTotal > 0) {
        const originalValues = { ...this.sliderValues };
        
        // First pass: proportional adjustment
        adjustableSliders.forEach(slider => {
          const proportion = originalValues[slider] / adjustableTotal;
          const adjustment = difference * proportion;
          this.sliderValues[slider] += adjustment;
          if (this.sliderValues[slider] < 0) this.sliderValues[slider] = 0;
          this.sliderValues[slider] = Math.round(this.sliderValues[slider]);
        });
        
        // Second pass: fix rounding
        total = sliders.reduce((sum, slider) => sum + this.sliderValues[slider], 0);
        if (total !== 100) {
          const stillAdjustable = adjustableSliders.filter(s => this.sliderValues[s] > 0);
          if (stillAdjustable.length > 0) {
            this.sliderValues[stillAdjustable[0]] += (100 - total);
          } else {
            // If all others are zero, set changedSlider to 100
            this.sliderValues[changedSlider as keyof typeof this.sliderValues] = 100;
          }
        }
      } else {
        // If all other sliders are zero, set the changed slider to 100
        this.sliderValues[changedSlider as keyof typeof this.sliderValues] = 100;
      }
    }
    
    // Clear old error message
    this.errorMsg = '';
  }
}