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
import { DEFAULT_DIFFICULTY, Difficulty } from '../models/difficulty';
import { SocketService} from "../socket.service";

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
    private dialog: MatDialog,
    private socketService: SocketService
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
    const currentDifficulty: Difficulty = this.roomForm.get('player')?.get('difficulty')?.value;

    const dialogRef = this.dialog.open(DifficultyDialogComponent, {
      width: '350px',
      panelClass: 'difficulty-dialog',
      data: {difficultyValues: currentDifficulty}
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
      const roomConfig = {
        roomName: this.roomForm.value.name,
        private: this.roomForm.value.isPrivate,
        password: this.roomForm.value.password,
        playerConfig: {
          name: this.roomForm.value.player.name,
          sex: this.roomForm.value.player.sex,
          difficulty_values: this.roomForm.value.player.difficulty
        },
        mode: this.roomForm.value.mode,
        rememberedChallenges: this.roomForm.value.rememberedChallenges,
        showChallenges: this.roomForm.value.showChallenges,
      };

      // Set up event listener first
      const errorSubscription = this.socketService.on('error').subscribe(
        (errorMessage) => {
          console.error('Error creating room:', errorMessage);

          // Clean up subscriptions
          errorSubscription.unsubscribe();
          roomCreatedSubscription.unsubscribe();

          // Close dialog with error
          this.dialogRef.close({
            success: false,
            error: errorMessage
          });
        }
      );

      const roomCreatedSubscription = this.socketService.on('room-created').subscribe(
        (data) => {
          const { roomId, playerId } = data;
          console.log('Room created:', roomId, 'Player ID:', playerId);

          // Store player ID for session restoration
          this.socketService.storeSessionId(playerId);

          // Clean up subscription
          roomCreatedSubscription.unsubscribe();

          // Close dialog with result
          this.dialogRef.close({
            success: true,
            roomId: roomId,
            playerId: playerId
          });
        }
      );

      this.socketService.emit('create-room', roomConfig);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
