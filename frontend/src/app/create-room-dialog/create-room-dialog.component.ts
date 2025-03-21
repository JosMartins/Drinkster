import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DifficultyDialogComponent } from '../difficulty-dialog/difficulty-dialog.component';
import { DEFAULT_DIFFICULTY, Difficulty } from '../difficulty';

@Component({
  selector: 'app-create-room-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatRadioModule
  ],
  templateUrl: './create-room-dialog.component.html',
  styleUrls: ['./create-room-dialog.component.css']
})
export class CreateRoomDialogComponent {
  roomForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateRoomDialogComponent>,
    private dialog: MatDialog
  ) {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      isPrivate: [false],
      password: [''],
      player: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        sex: ['M'],
        difficulty: DEFAULT_DIFFICULTY,
      }),
      mode: ['normal'],
      showChallenges: [true],
      rememberedChallenges: [35]
    });
  }

  openDifficultyDialog(): void {
    const currentDifficulty : Difficulty = this.roomForm.get('player')?.get('difficulty')?.value;
    
    const dialogRef = this.dialog.open(DifficultyDialogComponent, {
      width: '350px',
      data: { difficultyValues: currentDifficulty }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roomForm.get('player')?.patchValue({
          difficulty: result
        });
      }
    });
  }

  onSubmit(): void {
    if (this.roomForm.valid) {
      this.dialogRef.close(this.roomForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}