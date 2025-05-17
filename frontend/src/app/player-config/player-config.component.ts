import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {SocketService} from "../socket.service";
import {MatButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {DEFAULT_DIFFICULTY} from "../models/difficulty";

@Component({
  selector: 'app-player-config',
  standalone: true,
  templateUrl: './player-config.component.html',
  imports: [
    MatFormField,
    MatRadioGroup,
    MatInputModule,
    MatRadioButton,
    MatLabel,
    MatError,
    FormsModule,
    MatButton,
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['./player-config.component.css']
})
export class PlayerConfigComponent implements OnInit {
  playerForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<PlayerConfigComponent>,
    private readonly io: SocketService,
    @Inject(MAT_DIALOG_DATA) public roomId: string
  ) {
    this.playerForm = this.fb.group({
      id: [''], // backend fills in the id
      name: ['', [Validators.required, Validators.minLength(2)]],
      sex: ['M', Validators.required],
      difficulty_values: DEFAULT_DIFFICULTY,
    });
  }

  ngOnInit(): void {
    /* Nothing to init*/
  }

  onSave(): void {
    if (this.playerForm.valid) {
      const roomJoinedSubscription = this.io.playerJoined(this.roomId).subscribe(
        (player) => {
          debugger
          console.log('Room joined room:', this.roomId);
          localStorage.setItem('playerId', player.id);
          localStorage.setItem('roomId', this.roomId);

          errorSubscription.unsubscribe();
          roomJoinedSubscription.unsubscribe();

          this.dialogRef.close({
            success: true,
            roomId: this.roomId,
            playerId: player.id
          });
        }
      )

      const errorSubscription = this.io.error(this.roomId).subscribe(
        error => {
          console.log('Error joining room:', error);

          errorSubscription.unsubscribe();
          roomJoinedSubscription.unsubscribe();

          this.dialogRef.close({
            success: false,
            error: error
          });
        }
      )




      this.io.joinRoom(this.roomId, this.playerForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
