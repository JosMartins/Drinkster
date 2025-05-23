import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {MatCheckbox} from "@angular/material/checkbox";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";

@Component({
    selector: 'app-add-challenge-dialog',
    templateUrl: './add-challenge-dialog.component.html',
    styleUrls: ['./add-challenge-dialog.component.css'],
    standalone: true,
  imports: [
    CommonModule,
    MatFormField,
    MatLabel,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogTitle,
    MatCheckbox,
    MatOption,
    MatSelect,
    MatDialogActions
  ],
  encapsulation: ViewEncapsulation.None
})
export class AddChallengeDialogComponent implements OnInit {
  challengeForm: FormGroup;
  showPenalty: boolean = false;

  difficultyOptions = ['EASY', 'MEDIUM', 'HARD', 'EXTREME'];
  typeOptions = ['EVERYONE_DRINK', 'CHOSEN_DRINK', 'YOU_DRINK', 'BOTH_DRINK'];
  sexOptions = ['M', 'F', 'All'];

  get playerReferences(): FormArray {
    return this.challengeForm.get('playerReferences') as FormArray;
  }


  constructor(
      private readonly fb: FormBuilder,
      private readonly dialogRef: MatDialogRef<AddChallengeDialogComponent>,
      private readonly http: HttpClient
  ) {
      this.challengeForm = this.fb.group({
        text: ['', [Validators.required, this.validateSipsInText()]],
        difficulty: ['MEDIUM', Validators.required],
        players: [0, [Validators.required, Validators.min(0)]],
        sips: [0, [Validators.required, Validators.min(0)]],
        type: ['challenge', Validators.required],
        hasPenalty: [false],
        penaltyText: [''],
        penaltyRounds: [0, Validators.min(0)],
        playerReferences: this.fb.array([]),
        apiKey: ['', Validators.required]
      });
  }

  ngOnInit(): void {
    this.challengeForm.get('text')?.valueChanges.subscribe(text => {
      this.updatePlayerReferences(text ?? '');
    });


    this.challengeForm.get('hasPenalty')?.valueChanges.subscribe(value => {
      this.showPenalty = value;

      if (value) {
        this.challengeForm.get('penaltyText')?.setValidators([Validators.required]);
        this.challengeForm.get('penaltyRounds')?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        this.challengeForm.get('penaltyText')?.clearValidators();
        this.challengeForm.get('penaltyRounds')?.clearValidators();
        this.challengeForm.get('penaltyText')?.setValue('');
        this.challengeForm.get('penaltyRounds')?.setValue(0);
      }

      this.challengeForm.get('penaltyText')?.updateValueAndValidity();
      this.challengeForm.get('penaltyRounds')?.updateValueAndValidity();
    });
  }

  updatePlayerReferences(text: string): void {

    while (this.playerReferences.length) {
      this.playerReferences.removeAt(0);
    }

    const playerMatches = text.match(/{Player[0-9]*}/g) || [];
    const uniquePlayers = [...new Set(playerMatches)];

    uniquePlayers.forEach(player => {
      this.playerReferences.push(
        this.fb.group({
          reference: [player],
          sex: ['All']
        })
      );
    });
  }

  validateSipsInText() {
    return (control: any) => {
      if (!control.value) return null;

      const sipsValue = this.challengeForm?.get('sips')?.value;
      if (sipsValue > 0 && !control.value.includes('{sips}')) {
        return { noSipsReference: true };
      }
      return null;
    };
  }

  submit(): void {
    if (this.challengeForm.invalid) {
      return;
    }

    // Construir objeto de sexos a partir das referências
    const sexesMap = new Map();
    this.playerReferences.controls.forEach(control => {
      const reference = control.get('reference')?.value;
      const sex = control.get('sex')?.value;
      sexesMap.set(reference, sex);
    });

    // Build the request payload matching CreateChallengeRequest
    const payload = {
      text: this.challengeForm.value.text,
      difficulty: this.challengeForm.value.difficulty,
      sexes: Array.from(sexesMap.values()),
      players: this.challengeForm.value.players,
      sips: this.challengeForm.value.sips,
      type: this.challengeForm.value.type,
      penalty: this.challengeForm.value.hasPenalty ? {
        text: this.challengeForm.value.penaltyText,
        rounds: this.challengeForm.value.penaltyRounds
      } : null
    };

    // Send the POST request to the backend endpoint
    console.log('Sending POST request to /api/challenges', payload);
    this.http.post('/api/challenges',
      payload,
      {headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'X-API-Key': this.challengeForm.value.apiKey
      })
      }).subscribe({
      next: (response) => {
        console.log('Challenge added', response);
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error adding challenge', error);
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
