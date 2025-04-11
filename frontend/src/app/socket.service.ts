import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, over } from 'stompjs';
import { Router } from "@angular/router";
import {PlayerConfig, RoomConfig} from "./models/RoomConfig";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private sessionData$ = new BehaviorSubject<any>(null);
  private stompClient!: Client;
  private readonly serverUrl = 'http://localhost:8080/ws';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private router: Router) {
    this.initializeConnection();
  }

  // base methods

  private send(destination: string, body: any): void {
    if (this.stompClient?.connected) {
      this.stompClient.send(destination, {}, JSON.stringify(body));
    }
  }

  public subscribe(destination: string, callback: (payload: any) => void): void {
    if (this.stompClient?.connected) {
      this.stompClient.subscribe(destination, (message) => {
        callback(JSON.parse(message.body));
      });
    }
  }

  public on(destination: string): Observable<any> {
    return new Observable(observer => {
      this.subscribe(destination, (data) => {
        observer.next(data);
      });
    });
  }

  //Connection

  private initializeConnection(): void {
    const socket = new SockJS(this.serverUrl);
    this.stompClient = over(socket);

    this.stompClient.connect({}, (frame) => {
      console.log('Connected: ' + frame);
      this.reconnectAttempts = 0;
      this.setupReconnection();
    }, (error) => {
      console.log('Connection error: ', error);
      this.handleReconnection();
    });
  }


  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Reconnection attempt ${this.reconnectAttempts}`);
        this.initializeConnection();
      }, 1000);
    }
  }

  private setupReconnection(): void {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      this.send('/app/restore-session', { sessionId });

      this.subscribe('/user/queue/session-restored', (data) => {
        console.log('Session restored successfully', data);
        this.handleRestoredSession(data);
      });

      this.subscribe('/user/queue/session-not-found', () => {
        console.log('Session not found, creating new session');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('roomId');
      });
    }
  }

  public disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.disconnect(() => {}); // Add empty callback
    }
    localStorage.removeItem('sessionId');
  }

  // Session Management

  private handleRestoredSession(data: any): void {
    localStorage.setItem('roomId', data.roomId);

    if (data.status === 'waiting') {
      this.router.navigate(['/room']).then();
    } else if (data.status === 'playing') {
      this.sessionData$.next({
        me: data.me,
        status: data.status,
        roomId: data.roomId,
        players: data.players,
        isAdmin: data.isAdmin,
        penalties: data.penalties,
        text: data.text || 'Loading challenge...',
        difficulty: data.difficulty,
        type: data.type || 'challenge',
        round: data.round || 0,
        playerName: data.playerName || '',
      });
      this.router.navigate(['/game']).then();
    }
  }

  // Room Management

  public getRooms() {
    this.send("/app/list-rooms", {});
  }

  public listRooms(): Observable<any> {
    return this.on('/topic/rooms-list');
  }


  public createRoom(room: RoomConfig) {
    this.send("/app/create-room", room);
  }

  public createSinglePlayer(room: RoomConfig) {
    this.send("/app/create-singlePlayer", room);
  }

  public roomCreated(): Observable<any> {
    return this.on('/topic/room-created');
  }


  public joinRoom(room: { roomId: string, playerConfig: PlayerConfig }) {
    this.send("/app/join-room", room);
  }

  public roomJoined(): Observable<any> {
    return this.on('/topic/room-joined');
  }


  public leaveRoom(roomId: string, playerId: string) {
    this.send("/app/leave-room", { roomId, playerId });
  }


  public playerJoined(): Observable<any> {
    return this.on('/topic/player-joined');
  }

  public playerLeft(): Observable<any> {
    return this.on('/topic/player-left');
  }


  public getRoom(roomId: string) {
    this.send("/app/get-room", roomId);
  }

  public roomInfo(): Observable<any> {
    return this.on('room-info');
  }

  public roomUpdate(): Observable<any> {
    return this.on('/topic/rooms-list-update');
  }
  // Player Management
  public playerReady(roomId: string, playerId: string) {
    this.send('/app/player-ready', {roomId, playerId});
  }

  public playerUnready(roomId: string, playerId: string) {
    this.send('/app/player-unready', {roomId, playerId});
  }

  playerStatusUpdate(): Observable<any> {
    return this.on('player-status-update');
  }


  public updatePlayerDifficulty(roomId: string, playerId: string, difficulty: any): void {
    this.send('/aoo/admin-update-difficulty', { roomId, playerId, difficulty});
  }

  public kickPlayer(roomId: string, playerId: string): void {
    this.send('/app/admin-remove-player', { roomId, playerId });
  }


  // Game Management
  public startGame(roomId: string, playerId: string): void {
      this.send('/app/start-game', { roomId, playerId });
    }

  public gameStarted(): Observable<any> {
    return this.on('/topic/game-started');
  }


  public gotChallenge(): Observable<any> {
    return this.on('/topic/your-challenge');
  }

  public otherPlayerChallenge(): Observable<any> {
    return this.on('/topic/other-player-challenge');
  }

  public challengeCompleted(roomId: string): void {
    this.send('/app/challenge-completed', roomId);
  }

  public challengeDrunk(roomId: string): void {
    this.send('/app/challenge-drunk', roomId);
  }

  public forceSkipChallenge(roomId: string): void {
    this.send('/app/admin-force-skip', roomId);
  }



  // ERROR
  public error(): Observable<any> {
    return this.on('/topic/error');
  }

  // Session Data
  public getSessionData(): Observable<any> {
    return this.sessionData$.asObservable();
  }

}
