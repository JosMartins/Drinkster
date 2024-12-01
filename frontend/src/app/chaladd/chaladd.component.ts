import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chaladd',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './chaladd.component.html',
  styleUrls: ['./chaladd.component.css']
})
export class ChalAddComponent {
  challenge: string = '';
  difficulty: number | null = null;
  message: string = '';
  sexes = {M: false, F: false}; 
  sexes2 = {M: false, F: false}; 

  constructor(private readonly http: HttpClient, private readonly route: ActivatedRoute, private readonly router: Router) {}

  

  onSubmit() {

    if ((this.challenge.includes("{Player}") && this.sexes.M === false && this.sexes.F === false) ||
      (this.challenge.includes("{Player2}") && this.sexes2.M === false && this.sexes2.F === false)) {
      this.message = 'Please select sex.';
      return;
    }

    if (this.challenge && this.difficulty) {
      const newChallenge = {
        challenge: this.challenge,
        difficulty: this.difficulty,
        sexes: this.stringifySexes() 
      };
      console.log(newChallenge);

      this.http.post('http://localhost:3432/challenge/add', newChallenge).subscribe(
        (response: any) => {
          this.message = 'Challenge added successfully!\nId: ' + response._id;
          this.challenge = '';
          this.difficulty = null;
        },
        (error) => {
          this.message = 'Error adding challenge.';
          console.error(error);
        }
      );
    }
  }

  formatSexes( boolSexes: { M: boolean; F: boolean } ) {
    let sexes = [];
    if (boolSexes.M && boolSexes.F) {
      sexes.push('All');
    return sexes;
    } else if (boolSexes.M) {
      sexes.push('M');
    } else if (boolSexes.F) {
      sexes.push('F');
    }

    return sexes;
  }

  stringifySexes() {
    return this.formatSexes(this.sexes).concat(
            this.formatSexes(this.sexes2));
  }
}

