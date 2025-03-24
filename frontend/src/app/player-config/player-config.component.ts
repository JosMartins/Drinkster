import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {SocketService} from "../socket.service";

@Component({
  selector: 'app-player-config',
  standalone: true,
  templateUrl: './player-config.component.html',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatRadioGroup,
    MatRadioButton,
    MatLabel,
    MatError
  ],
  styleUrls: ['./player-config.component.css']
})
export class PlayerConfigComponent implements OnInit {
  playerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PlayerConfigComponent>,
    private socketService: SocketService,
    @Inject(MAT_DIALOG_DATA) public roomId: number
  ) {
    this.playerForm = this.fb.group({
      id: [''], // backend fills in the id
      name: ['', [Validators.required, Validators.minLength(3)]],
      sex: ['M', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSave(): void {
    if (this.playerForm.valid) {

      const errorSubscription = this.socketService.error().subscribe(
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

      const roomJoinedSubscription = this.socketService.roomJoined().subscribe(
        (data) => {
          const { roomId, playerId } = data;
          console.log('Room joined room:', roomId);
          localStorage.setItem('sessionId', playerId);
          localStorage.setItem('roomId', roomId);

          errorSubscription.unsubscribe();
          roomJoinedSubscription.unsubscribe();

          this.dialogRef.close({
            success: true,
            roomId: roomId,
            playerId: playerId
          });
        }
      )


      this.socketService.joinRoom(this.roomId.valueOf(), this.playerForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
