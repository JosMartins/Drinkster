import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

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
    MatCheckboxModule
  ],
  templateUrl: './create-room-dialog.component.html',
  styleUrls: ['./create-room-dialog.component.css']
})
export class CreateRoomDialogComponent {
  roomForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateRoomDialogComponent>
  ) {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      isPrivate: [false],
      password: ['']
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