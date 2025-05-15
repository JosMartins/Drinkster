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
  private readonly sessionData$ = new BehaviorSubject<any>(null);
  public isConnected$ = new BehaviorSubject<boolean>(false);
  private stompClient!: Client;
  private pendingSubscriptions: Array<{ destination: string, callback: (payload: any) => void }> = [];
  private readonly serverUrl = 'http://localhost:8000/ws';
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor(private readonly router: Router) {
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
    } else {
      // Queue the subscription if not connected
      this.pendingSubscriptions.push({ destination, callback });
    }
  }

  public on(destination: string): Observable<any> {
    return new Observable(observer => {
      this.subscribe(destination, (data) => {
        console.log("received:" + data);
        observer.next(data);
      });
    });
  }

  /// Connection ///

  private initializeConnection(): void {
    const socket = new SockJS(this.serverUrl);
    this.stompClient = over(socket);

    this.stompClient.connect({}, (frame) => {
      console.log('Connected: ' + frame);
      this.isConnected$.next(true);
      this.reconnectAttempts = 0;
      this.setupReconnection();
      this.pendingSubscriptions.forEach(sub => {
        this.subscribe(sub.destination, sub.callback);
      });
      this.pendingSubscriptions = [];
    }, (error) => {
      console.log('Connection error: ', error);
      this.isConnected$.next(false);
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
    const playerId = this.getCookie('playerId')
    if (playerId) {
      this.send('/app/restore-session', { playerId });

      this.subscribe('/user/queue/session-restored', (data) => {
        console.log('Session restored successfully', data);
        this.handleRestoredSession(data);
      });

      this.subscribe('/user/queue/session-not-found', () => {
        console.log('Session not found, creating new session');
        this.deleteCookie('playerId');
        this.deleteCookie('roomId');
      });
    }
  }

  public disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.disconnect(() => {});
    }
    //remove playerId and roomId from cookies
    this.deleteCookie('playerId');
    this.deleteCookie('roomId');

  }

  /// Session Management ///

  private handleRestoredSession(data: any): void {
    this.setCookie('roomId', data.roomId, 12);

    this.sessionData$.next({
      self: data.self, //Player
      room: data.room, //GameRoom
      challenge: data.currentChallenge //Challenge
    });
    if (data.status === 'waiting') {
      this.router.navigate(['/room']).then();
    } else if (data.status === 'playing') {
      this.router.navigate(['/game']).then();
    }
  }

  /// Room Management ///

  public getRooms() {
    this.send("/app/list-rooms", {});
  }

  public listRooms(): Observable<any> {
    return this.on('/topic/rooms-list');
  }


  public createRoom(room: RoomConfig) {
    this.send("/app/create-room", room);
  }

  public createSingleplayer(room: RoomConfig) {
    this.send("/app/create-single-player", room);
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

  public roomInfo(roomId: string): Observable<any> {
    return this.on("/topic/" + roomId + "/room-info");
  }


  // Player Management
  public playerReady(roomId: string, playerId: string) {
    this.send('/app/player-ready', {roomId, playerId});
  }

  public playerUnready(roomId: string, playerId: string) {
    this.send('/app/player-unready', {roomId, playerId});
  }

  playerStatusUpdate(): Observable<any> {
    return this.on('/topic/player-status-update');
  }

  getPlayerDifficulty(id: string): Observable<any> {
    this.send('/app/get-player-difficulty', id);

    return this.on('/topic/difficulty'+ id);
  }
  public updatePlayerDifficulty(roomId: string, playerId: string, difficulty: any): void {
    this.send('app/change-difficulty', { roomId, playerId, difficulty });
  }

  public kickPlayer(roomId: string, playerId: string): void {
    this.send('/app/admin-remove-player', { roomId, playerId });
  }


  /// Game Management ///

  public startGame(roomId: string, playerId: string): void {
      this.send('/app/start-game', { roomId, playerId });
    }

  public gameStarted(): Observable<any> {
    return this.on('/topic/game-started');
  }


  public onChallege(playerId: string): Observable<any> {
    return this.on('/topic/'+ playerId + '/challenge');
  }


  public challengeCompleted(roomId: string, playerId: string): void {
    this.send('/app/challenge-completed', {roomId, playerId});
  }

  public challengeDrunk(roomId: string, playerId: string): void {
    this.send('/app/challenge-drunk', {roomId, playerId});
  }

  public randomEvent(): Observable<any> {
    return this.on('/topic/random-event');
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

  // Connection Status
  public connectionStatus(): Observable<boolean> {
    return this.isConnected$.asObservable();
  }


  /// Cookies ///

  public setCookie(name: string, value: string, hours: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
    const encodedName = encodeURIComponent(name);
    const encodedValue = encodeURIComponent(value);
    let cookie = `${encodedName}=${encodedValue};expires=${expires.toUTCString()};path=/`;
    if (location.protocol === 'https:') cookie += ';Secure';
    document.cookie = cookie;
  }

  getCookie(name: string): string | null {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = RegExp(new RegExp(`(^| )${escapedName}=([^;]+)`)).exec(document.cookie);
    return match ? decodeURIComponent(match[2]) : null;
  }

  deleteCookie(name: string): void {
    const encodedName = encodeURIComponent(name);
    let cookie = `${encodedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

    // Only add Secure if the current connection is HTTPS
    if (location.protocol === 'https:') {
      cookie += '; Secure';
    }

    document.cookie = cookie;
  }


}
