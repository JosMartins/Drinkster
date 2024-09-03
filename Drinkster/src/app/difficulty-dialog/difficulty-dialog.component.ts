import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Inject } from '@angular/core';
import {Difficulty} from "../difficulty";

@Component({
  selector: 'app-difficulty-dialog',
  standalone: true,
  templateUrl: './difficulty-dialog.component.html',
  styleUrls: ['./difficulty-dialog.component.css'],
  imports: [MatFormFieldModule, MatInputModule, FormsModule]
})

export class DifficultyDialogComponent {
  difficulty: Difficulty;

  constructor(
    public dialogRef: MatDialogRef<DifficultyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Difficulty
  ) {
    this.difficulty = { ...data };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.difficulty);
  }
}
