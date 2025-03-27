import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly socket: Socket;

  constructor(private router: Router) {
    this.socket = io("http://autistassv.ddns.net:25568", {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    this.setupReconnection().then(_ => null);
  }

  // Handle reconnection with persistent ID
  private async setupReconnection(): Promise<void> {

    this.socket.emit('restore-session', localStorage.getItem('sessionId'));

    await new Promise<void>((resolve) => {
      this.socket.on('connect', () => {
        console.log('Socket connected');
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
          console.log('Attempting to restore session:', sessionId);
          this.socket.emit('restore-session', sessionId);

          this.socket.once('session-restored', (data) => {
            console.log('Session restored successfully', data);

            localStorage.setItem('roomId', data.roomId);

            // Route based on game status
            if (data.status === 'waiting') {
              this.router.navigate(['/room']);
            } else if (data.status === 'playing') {
              this.router.navigate(['/game']);
            }

            resolve();
          });

          this.socket.once('session-not-found', () => {
            console.log('Session not found, creating new session');
            localStorage.removeItem('sessionId');
            localStorage.removeItem('roomId');
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  // Emit events
  private emit(eventName: string, ...args: any[]): void {
    this.socket.emit(eventName, ...args);
  }

  // Listen for events
  private on(eventName: string): Observable<any> {
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

  roomUpdate(): Observable<any> {
    return this.on('room-update');
  }

  gameStarted(): Observable<any> {
    return this.on('game-started');
  }

  playerReady(): void {
    this.emit('player-ready');
  }

  playerUnready(): void {
    this.emit('player-unready');
  }

  leaveRoom(): void {
    this.emit('leave-room');
  }

  startGame(): void {
    this.emit('game-start');
  }

  updatePlayerDifficulty(roomId: number, playerId: string, difficulty: any): void {
    this.emit('admin-update-difficulty', roomId, playerId, difficulty);
  }

  kickPlayer(roomId: number, playerId: string): void {
    this.emit('admin-remove-player', {roomId, playerId});
  }

  getRooms(): void {
    this.emit('get-rooms');
  }

  listRooms(): Observable<any> {
    return this.on('room-list');
  }

  getRoom(roomId: number): void {
    this.emit('get-room', roomId);
  }

  createRoom(room: any) {
    this.emit('create-room',room)
  }

  createSinglePlayer(room: any) {
    this.emit('create-singleplayer',room);
  }
  roomCreated(): Observable<any> {
    return this.on('room-created');
  }
  roomInfo(): Observable<any> {
    return this.on('room-info');
  }

  joinRoom(payload: { roomId: number; playerConfig: any }): void {
    this.emit('join-room', payload);
  }

  roomJoined(): Observable<any> {
    return this.on('room-joined');
  }

  playerStatusUpdate(): Observable<any> {
    return this.on('player-status-update');
  }

  playerDifficultyUpdate(): Observable<any> {
    return this.on('player-difficulty-updated');
  }
  playerJoined() {
    return new Observable<any>(observer => {
      this.socket.on('player-joined', data => observer.next(data));
    });
  }

  playerLeft() {
    return new Observable<any>(observer => {
      this.socket.on('player-left', data => observer.next(data));
    });
  }

  adminJoined() {
    return new Observable<any>(observer => {
      this.socket.on('admin-player-joined', data => observer.next(data));
    });
  }

  gotChallenge(): Observable<any> {
    return this.on('your-challenge');
  }

  otherPlayerChallenge(): Observable<any> {
    return this.on('other-player-challenge');
  }
  challengeCompleted(roomId: number) {
    this.emit('challenge-completed', roomId);
  }

  challengeDrunk(roomId: number) {
    this.emit('challenge-drunk', roomId);
  }

  public forceSkipChallenge(roomId: number): void {
    this.emit('admin-force-skip', roomId);
  }

  public error(): Observable<any> {
    return this.on('error');
  }

}

