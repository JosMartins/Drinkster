import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly socket: Socket;

  constructor(private router: Router) {
    this.socket = io("http://192.168.1.66:3432", {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    this.setupReconnection();
  }

  // Handle reconnection with persistent ID
  private setupReconnection(): void {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        console.log('Attempting to restore session:', sessionId);
        this.socket.emit('restore-session', sessionId);
      }
    });

    // Handle successful session restoration
    this.socket.on('session-restored', (data) => {
      console.log('Session restored successfully', data);

      localStorage.setItem('sessionId', data.id);
      this.router.navigate(['/room']);
    });

    // Handle failed session restoration
    this.socket.on('session-not-found', () => {
      console.log('Session not found, creating new session');
      localStorage.removeItem('sessionId');
    });
  }

  // Store session ID from server
  public storeSessionId(sessionId: string): void {
    localStorage.setItem('sessionId', sessionId);
    console.log('Stored session ID:', sessionId);
  }

  // Emit events
  public emit(eventName: string, ...args: any[]): void {
    this.socket.emit(eventName, ...args);
  }

  // Listen for events
  public on(eventName: string): Observable<any> {
    const subject = new Subject<any>();

    this.socket.on(eventName, (data) => {
      subject.next(data);
    });

    return subject.asObservable();
  }

  // Clean up
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    localStorage.removeItem('sessionId');
  }

  public roomUpdate(): Observable<any> {
    return this.on('room-update');
  }

  public gameStarted(): Observable<any> {
    return this.on('game-started');
  }

  public playerReady(): void {
    this.emit('player-ready');
  }

  public playerUnready(): void {
    this.emit('player-unready');
  }

  public leaveRoom(): void {
    this.emit('leave-room');
  }

  public startGame(): void {
    this.emit('game-start');
  }

  public updatePlayerDifficulty(roomId: number, playerId: string, difficulty: any): void {
    this.emit('admin-update-difficulty', roomId, playerId, difficulty);
  }

  public kickPlayer(roomId: number, playerId: string): void {
    this.emit('admin-remove-player', {roomId, playerId});
  }

  public getRooms(): void {
    this.emit('get-rooms');
  }

  public listRooms(): Observable<any> {
    return this.on('room-list');
  }

  public getRoom(roomId: number): void {
    this.emit('get-room', roomId);
  }

  public joinRoom(roomId: string): void {
    this.emit('join-room', roomId);
  }

}

