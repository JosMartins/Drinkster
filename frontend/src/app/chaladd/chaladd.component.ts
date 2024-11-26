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

  constructor(private readonly http: HttpClient, private readonly route: ActivatedRoute, private readonly router: Router) {}
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      //This should be in a different file, but for the sake of simplicity... plus this is not easily accessible
      let pass = 'passw';
      if (params['secret'] !== pass) {
        this.router.navigate(['/']);  // Redirect to home if the secret code is wrong
      }
    });
  }

  onSubmit() {
    if (this.challenge && this.difficulty) {
      const newChallenge = {
        challenge: this.challenge,
        difficulty: this.difficulty
      };

      this.http.post('http://localhost:3432/challenge/add', newChallenge).subscribe(
        (response) => {
          this.message = 'Challenge added successfully!';
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
}

