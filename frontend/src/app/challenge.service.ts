import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {

  private readonly apiUrl = '/api';

  constructor(private readonly http: HttpClient) { }


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

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/challenge/stats`);
  }

  addChallenge(challenge: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/challenge/add`, challenge);
  }
}

