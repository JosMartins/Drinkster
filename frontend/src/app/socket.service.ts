import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, Stomp } from '@stomp/stompjs';
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
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
private readonly serverUrl = ((): string => {
  const proto = window.location.protocol === 'https:' ? 'https' : 'http';
  return `${proto}://localhost:8000/ws`;
})();
  constructor(private readonly router: Router) {
    this.initializeConnection();
  }

  // base methods

  private send(destination: string, body: any): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: destination,
        body: typeof body === "string" ? body : JSON.stringify(body)
      });
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
        console.log("received to ("+ destination +"):" + JSON.stringify(data));
        observer.next(data);
      });
    });
  }

  /// Connection ///

  private initializeConnection(): void {
    const socket = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(() => socket);

    this.stompClient.onConnect = (frame) => {
      this.isConnected$.next(true);
      this.reconnectAttempts = 0;

      this.pendingSubscriptions.forEach(({ destination, callback }) => {
        this.subscribe(destination, callback);
      });
      this.pendingSubscriptions = [];
    };

    this.stompClient.onStompError = (error) => {
      console.error('STOMP error:', error);
    };

    this.stompClient.onWebSocketClose = () => {
      this.isConnected$.next(false);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.initializeConnection();
        }, 2000);
      }
    };

    this.stompClient.activate();
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
    const roomId = this.getCookie('roomId')
    const playerId = this.getCookie('playerId')
    if (roomId && playerId) {

      this.on('/topic/' + playerId + '/session-restored').subscribe((data) => {
        console.log('Session restored successfully', data);
        this.handleRestoredSession(data);
      })

      this.on('/topic/' + playerId +'/session-not-found').subscribe(_ => {
        console.log('Session not found, creating new session');
        this.deleteCookie('playerId');
        this.deleteCookie('roomId');
        this.router.navigate(['/multiplayer']).then();
      });

      this.send('/app/restore-session', { roomId , playerId });
    }
  }

  public disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
    }
  }


  /// Session Management ///

  private handleRestoredSession(data: any): void {
    this.setCookie('playerId', data.self.id, 8);
    this.setCookie('roomId', data.room.roomId, 8);

    this.sessionData$.next({
      self: data.self, //Player
      room: data.room, //GameRoom
      penalties: data.penalties, //Penalty[]
      playerTurn: data.playerTurn //Challenge
    });
    if (data.room.roomState === 'LOBBY') {
      this.router.navigate(['/room']).then();
    } else if (data.room.roomState === 'PLAYING') {
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

  public roomError(): Observable<any> {
    return this.on('/topic/room-error');
  }

  public joinRoom(roomId: string, playerConfig: PlayerConfig) {
    this.send("/app/join-room", {roomId , playerConfig});
  }

  public roomJoined(): Observable<any> {
    return this.on('/user/queue/room-joined');
  }


  public leaveRoom(roomId: string, playerId: string) {
    this.send("/app/leave-room", { roomId, playerId });
  }


  public playerJoined(roomId: string): Observable<any> {
    return this.on('/topic/' + roomId + '/player-joined');
  }

  public playerLeft(roomId: string): Observable<any> {
    return this.on('/topic/'+ roomId + '/player-left');
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

  playerStatusUpdate(roomId: string): Observable<any> {
    return this.on('/topic/'+ roomId +'/player-status-update');
  }

  getPlayerDifficulty(roomId:string, playerId: string, adminId: string): Observable<any> {
    this.send('/app/get-player-difficulty', {roomId, playerId});
    return this.on('/topic/' + adminId +'/difficulty');
  }

  public updatePlayerDifficulty(roomId: string, playerId: string, difficulty_values: any): void {
    this.send('/app/change-difficulty', { roomId, playerId, difficulty_values });
  }

  public kickPlayer(roomId: string, playerId: string): void {
    this.send('/app/admin-remove-player', { roomId, playerId });
  }


  /// Game Management ///

  public startGame(roomId: string): void {
      this.send('/app/start-game', roomId);
    }

  public gameStarted(roomId: string): Observable<any> {
    return this.on('/topic/'+ roomId + '/game-started');
  }


  public onChallenge(playerId: string): Observable<any> {
    return this.on('/topic/'+ playerId + '/challenge');
  }


  public challengeCompleted(roomId: string, playerId: string): void {
    this.send('/app/challenge-completed', {roomId, playerId});
  }

  public challengeDrunk(roomId: string, playerId: string): void {
    this.send('/app/challenge-drunk', {roomId, playerId});
  }

  public randomEvent(playerId: string): Observable<any> {
    return this.on('/topic/' + playerId + '/random-event');
  }

  public forceSkipChallenge(roomId: string): void {
    this.send('/app/admin-force-skip', roomId);
  }


  // ERROR
  public error(id: string): Observable<any> {
    return this.on('/topic/' + id + '/error');
  }

  // Session Data
  public getSessionData(): Observable<any> {
    return this.sessionData$.asObservable();
  }

  public setSessionData(data: any): void {
    this.sessionData$.next(data);
  }

  // Connection Status
  public connectionStatus(): Observable<boolean> {
    return this.isConnected$.asObservable();
  }


  /// Cookies ///
 // TESTING LOCALSTORAGE
  public setCookie(name: string, value: string, hours: number): void {
     const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString();
     /*
    // store the raw value – encodeURIComponent keeps it cookie-safe
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
     */
    localStorage.setItem(name, value);
  }



  public getCookie(name: string): string | null {
    /*
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + name + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[1]) : undefined;
     */
    return localStorage.getItem(name);
  }


  deleteCookie(name: string): void {

    /*
    const encodedName = encodeURIComponent(name);

    let cookie = `${encodedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

    // Only add Secure if the current connection is HTTPS
    if (location.protocol === 'https:') {
      cookie += '; Secure';
    }

    document.cookie = cookie;
    */

    localStorage.removeItem(name);
  }


}
