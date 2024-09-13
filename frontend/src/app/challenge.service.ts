import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {

  //private apiUrl = 'http://autistassv.ddns.net:25569/api';
  private apiUrl = 'http://localhost:3432/api'; //testing

  constructor(private http: HttpClient) { }


  getChallenge(difficulty: string): Observable<any> {
    switch (difficulty) {
      case 'easy':
        return this.http.get<any>(`${this.apiUrl}/challenge/easy`);
      case 'medium':
        return this.http.get<any>(`${this.apiUrl}/challenge/medium`);
      case 'hard':
        return this.http.get<any>(`${this.apiUrl}/challenge/hard`);
      case 'extreme':
        return this.http.get<any>(`${this.apiUrl}/challenge/extreme`);

      default:
        return this.http.get<any>(`${this.apiUrl}/challenge`);
    }
  }

}

