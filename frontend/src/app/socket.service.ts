import { Injectable } from '@angular/core';
import {Observable, BehaviorSubject, switchMap, first, filter} from 'rxjs';
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
  private readonly serverUrl = `${window.location.origin}/ws`;
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
            console.log('Received message:', JSON.stringify(message.body));
            let payload;
            try {
                payload = JSON.parse(message.body);
            } catch (e) {
                payload = message.body;
            }
            callback(payload);
        });
    } else {
        this.pendingSubscriptions.push({ destination, callback });
    }
}

  public on(destination: string): Promise<Observable<any>> {
    return new Promise((resolve) => {
      const observable = new Observable(observer => {
        this.subscribe(destination, (data) => {
          observer.next(data);
        });
      });
      resolve(observable);
    });
  }


  public sendAndSubscribe(destination: string,body: any, ...topics: string[] ): Observable<any> {
    return new Observable((observer) => {
    // Wait for all topics to be subscribed
      const topicSubscriptions = topics.map((topic) => this.on(topic));

      Promise.all(topicSubscriptions).then((observables) => {
      // Subscribe to all topics and forward data to the observer
        const subscriptions = observables.map((observable$) =>
          observable$.subscribe((data) => observer.next(data))
        );

        // Send the message after all subscriptions are ready
        this.send(destination, body);

        // Cleanup: Unsubscribe from all topics when the observer unsubscribes
        return () => subscriptions.forEach((sub) => sub.unsubscribe());
      });
    });
  }


  /// Connection ///

  private initializeConnection(): void {
    const socket = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(() => socket);

    this.stompClient.onConnect = () => {
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


  setupReconnection(): void {
    const roomId = this.getData('roomId')
    const playerId = this.getData('playerId')
    if (roomId && playerId) {

      this.connectionStatus()
        .pipe(
          filter(connected => connected),
          first(),
          switchMap(() => Promise.all([
            this.on(`/topic/${playerId}/session-restored`),
            this.on(`/topic/${playerId}/session-not-found`)
          ]))
        ).subscribe(([sessionRestored$, sessionNotFound$]) => {
        sessionRestored$.subscribe(data => this.handleRestoredSession(data));

        sessionNotFound$.subscribe(() => {
          this.deleteData('playerId');
          this.deleteData('roomId');
          this.router.navigate(['/']).then();
        });

        // Now it's safe to send the frame
        this.send('/app/restore-session', { roomId, playerId });
      });
    }
  }

  public disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.deactivate().then();
    }
  }


  /// Session Management ///

  private handleRestoredSession(data: any): void {

    this.saveData('playerId', data.self.id);
    this.saveData('roomId', data.room.roomId);

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

  public listRooms(): Observable<any> {
    return this.sendAndSubscribe('/app/list-rooms', {}, '/topic/rooms-list');
  }


  public createRoom(room: RoomConfig): Observable<any> {
    return this.sendAndSubscribe('/app/create-room',room, '/topic/room-created', '/topic/room-error');
  }

  public createSingleplayer(room: RoomConfig): Observable<any> {
    return this.sendAndSubscribe('/app/create-singleplayer',room, '/topic/room-created', '/topic/room-error');
  }


  public joinRoom(roomId: string, playerConfig: PlayerConfig) {
    return this.sendAndSubscribe("/app/join-room", {roomId , playerConfig}, "/topic/" + roomId + "/player-joined", "/topic/" + roomId + "/room-error");
  }


  public leaveRoom(roomId: string, playerId: string) {
    this.send("/app/leave-room", { roomId, playerId });
  }


public playerJoined(roomId: string): Observable<any> {
    return new Observable(observer => {
        this.on('/topic/' + roomId + '/player-joined').then(observable => {
            const subscription = observable.subscribe(data => observer.next(data));
            return () => subscription.unsubscribe();
        });
    });
}

public playerLeft(roomId: string): Observable<any> {
    return new Observable(observer => {
        this.on('/topic/' + roomId + '/player-left').then(observable => {
            const subscription = observable.subscribe(data => observer.next(data));
            return () => subscription.unsubscribe();
        });
    });
}

  public getRoom(roomId: string): Observable<any> {
    return this.sendAndSubscribe("/app/get-room", roomId, "/topic/" + roomId + "/room-info", "/topic/" + roomId + "/error");
  }

  // Player Management
  public playerReady(roomId: string, playerId: string) {
    this.send('/app/player-ready', {roomId, playerId});
  }

  public playerUnready(roomId: string, playerId: string) {
    this.send('/app/player-unready', {roomId, playerId});
  }

  playerStatusUpdate(roomId: string): Observable<any> {
    return new Observable(observer => {
      this.on('/topic/' + roomId + '/player-status-update').then(observable => {
        const subscription = observable.subscribe(data => observer.next(data));
        return () => subscription.unsubscribe();
      });
    });
  }

  getPlayerDifficulty(roomId:string, playerId: string, adminId: string): Observable<any> {
    return this.sendAndSubscribe('/app/get-player-difficulty', {roomId, playerId}, '/topic/' + adminId +'/difficulty');
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
    return new Observable(observer => {
      this.on('/topic/' + roomId + '/game-started').then(observable => {
        const subscription = observable.subscribe(data => observer.next(data));
        return () => subscription.unsubscribe();
      });
    });
  }

  public onChallenge(playerId: string): Observable<any> {
    return new Observable(observer => {
      this.on(`/topic/${playerId}/challenge`).then(observable$ => {
        observable$.subscribe(data => {
          console.log('Challenge received:', data);   // <- log to console
          observer.next(data);                        // forward to caller
        });
        // NOTE: intentionally no teardown function returned – the inner
        // subscription stays alive until the outer subscription is disposed of.
      });
    });
  }



  public challengeCompleted(roomId: string, playerId: string): void {
    this.send('/app/challenge-completed', {roomId, playerId});
  }

  public challengeDrunk(roomId: string, playerId: string): void {
    this.send('/app/challenge-drunk', {roomId, playerId});
  }

  public randomEvent(playerId: string): Observable<any> {
    return new Observable(observer => {
      this.on('/topic/' + playerId + '/random-event').then(observable => {
        const subscription = observable.subscribe(data => observer.next(data));
        return () => subscription.unsubscribe();
      });
    });
  }

  public forceSkipChallenge(roomId: string): void {
    this.send('/app/admin-force-skip', roomId);
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


  /// Local Storage ///

  public saveData(name: string, value: string): void {
    localStorage.setItem(name, value);
  }



  public getData(name: string): string | null {
    return localStorage.getItem(name);
  }


  deleteData(name: string): void {
    localStorage.removeItem(name);
  }


}
