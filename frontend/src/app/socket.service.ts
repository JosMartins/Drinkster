import { Injectable } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  switchMap,
  first,
  filter,
  catchError,
  EMPTY,
  merge,
  takeUntil,
  throwError, Subject, mergeMap, of
} from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, Stomp } from '@stomp/stompjs';
import { Router } from "@angular/router";
import {PlayerConfig, RoomConfig} from "./models/RoomConfig";
import {PlayerDto} from "./models/dto/player.dto";
import {ChallengeResponseDto} from "./models/dto/ChallengeResponse.dto";
import {EventDto} from "./models/dto/Event.dto";
import {SessionData} from "./models/dto/SessionData.dto";
import {ErrorDto} from "./models/dto/Error.dto";
import {GameRoomDto} from "./models/dto/GameRoom.dto";
import {RoomListDto} from "./models/dto/RoomList.dto";
import {RoomCreateResponseDto} from "./models/dto/RoomCreateResponse.dto";
import {RoomJoinDto} from "./models/dto/RoomJoin.dto";
import {AckDto} from "./models/dto/Ack.dto";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly sessionData$ = new BehaviorSubject<any>(null);
  private destroy$ = new Subject<void>();
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
      if (!this.stompClient?.connected) {
        console.warn('STOMP client is not connected. Cannot send message to destination:', destination);
        return;
      }
      //If body is not a string, convert it to JSON
      const payload = typeof body === 'string' ? body : JSON.stringify(body);

      this.stompClient.publish({ destination, body: payload });
      console.debug('Published message to destination:', destination, 'with body:', payload);
  }

private subscribe(destination: string, callback: (payload: any) => void): () => void {
    if (!this.stompClient?.connected) {
      const sub = this.stompClient.subscribe(destination, (message) => {
        try {
          const payload = JSON.parse(message.body);
        } catch {
          callback(message.body);
        }
      });
      return () => sub.unsubscribe();
    } else {
      const pendingSub = {destination, callback};
      this.pendingSubscriptions.push(pendingSub);

      return () => {
        const index = this.pendingSubscriptions.indexOf(pendingSub);
        if (index > -1) {
          this.pendingSubscriptions.splice(index, 1);
        }
      };
    }
}

  private observe<T>(destination: string): Observable<T> {
    return new Observable<T>(observer => {
      const subscription = this.subscribe(destination, (data: T) => {
        observer.next(data);
      });

      return () => subscription();
    });
  }


  public sendAndObserve<T>(
    sendDestination: string,
    body: any,
    observerDestinations: string[]
  ): Observable<T> {
    return this.connectionStatus().pipe(
      filter(connected => connected),                                               // check if connected/ wait for connection
      first(),
      switchMap((): Observable<T> => {                                                      // setup subscription and send
        // observables for each observer destination
        const observables = observerDestinations.map(dest =>          // create an observable for each destination
          this.observe<T>(dest).pipe(
            catchError(err => {
              console.error(`Error in observer for ${dest}:`, err);
              return EMPTY;
            })
          ));

        queueMicrotask(() => this.send(sendDestination, body));                       // send a message after subscription is set up

        return merge(...observables).pipe(                                                  // combine all observables
          takeUntil(this.destroy$),
        );
      }),
      catchError(error => {                                                           //Error handling
        console.error('Connection error during sendAndObserve:', error);
        return throwError(() => new Error('Connection failed'));
      })
    );
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
    if (!roomId || !playerId) { return; }

    this.sendAndObserve<SessionData | ErrorDto>(
      '/app/restore-session',
      { roomId, playerId },
      [
        '/user/queue/session-restored',
        '/user/queue/session-error'
      ]
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        if ('self' in data) {
          this.handleRestoredSession(data);
        } else {
          this.clearSessionData();
          this.router.navigate(['/']).then(null);
        }
      },
      error: (err) => {
        console.error('Error restoring session:', err);
        this.clearSessionData();
      }
    });
  }

  public disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.deactivate().then();
    }
  }


  /// Session Management ///

  private handleRestoredSession(data: SessionData): void {

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

  private clearSessionData(): void {
    this.sessionData$.next(null);
    this.deleteData('playerId');
    this.deleteData('roomId');
    this.router.navigate(['/']).then();
  }

  /// Room Management ///

  public listRooms(): Observable<RoomListDto> {
    return this.sendAndObserve('/app/list-rooms', {}, ['/user/queue/room-list']);
  }


  public createRoom(room: RoomConfig): Observable<RoomCreateResponseDto | ErrorDto> {
    return this.sendAndObserve('/app/create-room',room, ['/user/queue/room-created', '/user/queue/room-error']);
  }

  public createSingleplayer(room: RoomConfig): Observable<any> {
    return this.sendAndObserve('/app/create-singleplayer',room, ['/user/queue/room-created', '/user/queue/room-error']);
  }


  public joinRoom(roomId: string, playerConfig: PlayerConfig) : Observable<RoomJoinDto | ErrorDto> {
    return this.sendAndObserve("/app/join-room", {roomId , playerConfig}, ['/user/queue/join-confirm', '/user/queue/join-error']);
  }


  public leaveRoom(roomId: string, playerId: string) {
    this.send("/app/leave-room", { roomId, playerId });
  }

  public playerJoined(roomId: string): Observable<PlayerDto> {
    return this.observe('/topic/' + roomId + '/player-joined')
  }
                                    // receives only the id
  public playerLeft(roomId: string): Observable<String> {
    return this.observe('/topic/' + roomId + '/player-left')
  }

  public getRoom(roomId: string): Observable<GameRoomDto> {
    return this.sendAndObserve<GameRoomDto | ErrorDto>('/app/get-room', roomId, [
      '/user/queue/room-info',
      '/user/queue/room-error'
    ]).pipe(
      mergeMap(response => {
        if ('code' in response) {
          return throwError(() => response);
        }
        return of(response as GameRoomDto);
      })
    );
  }

  // Player Management //

  public playerReady(roomId: string, playerId: string): Observable<boolean | ErrorDto> {
    return this.sendAndObserve('/app/player-ready', {roomId, playerId}, ['/user/queue/player-ready', '/user/queue/player-error']);
  }

  public playerUnready(roomId: string, playerId: string): Observable<boolean | ErrorDto> {
    return this.sendAndObserve('/app/player-unready', {roomId, playerId}, ['/user/queue/player-unready', '/user/queue/player-error'])
  }

  public playerKicked(): Observable<string> {
    return this.observe('/user/queue/kicked')
  }

  public playerStatusUpdate(roomId: string): Observable<{id: string, status: boolean}> {
    return this.observe('/topic/' + roomId + '/player-status-update');

  }

  public getPlayerDifficulty(roomId:string, playerId: string): Observable<any> {
    return this.sendAndObserve('/app/get-player-difficulty', {roomId, playerId}, ['/user/queue/player-difficulty']);
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

  public gameStarted(roomId: string): Observable<void> {
    return this.observe('/topic/' + roomId + '/game-started');
  }

  public onChallenge(playerId: string): Observable<ChallengeResponseDto> {
    return this.observe('/user/queue/challenge');
  }


  public challengeCompleted(roomId: string, playerId: string): Observable<AckDto | ErrorDto> {
    return this.sendAndObserve('app/challenge-drunk', {roomId , playerId}, ['/user/queue/ack', '/user/queue/challenge-error'])
  }

  public challengeDrunk(roomId: string, playerId: string): Observable<AckDto | ErrorDto> {
    return this.sendAndObserve('app/challenge-drunk', {roomId , playerId}, ['/user/queue/ack', '/user/queue/challenge-error'])
  }

  public randomEvent(): Observable<EventDto> {
    return this.observe('/user/queue/random-event');
  }

  public forceSkipChallenge(roomId: string): void {
    this.send('/app/admin-force-skip', roomId);
  }

  // Error Handling //
  public handleError(error: any): Observable<never> {
    console.error("Backend error:", error);
    return throwError(() => error);
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
