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
import {Difficulty} from "./models/difficulty";
import {KickDto} from "./models/dto/Kick.dto";
import {ChallengeDto} from "./models/dto/Challenge.dto";

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
  //private readonly serverUrl = `${window.location.origin}/ws`;
  private readonly serverUrl = `http://localhost:8000/ws`;


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
    if (this.stompClient?.connected) {
      const sub = this.stompClient.subscribe(destination, (message) => {
        console.log(`Received message from ${destination}:`, message.body);
        try {
          const payload = JSON.parse(message.body);
          callback(payload);
        } catch (e) {
          console.error("Parsing error. Message body:", message.body);
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

  public createRoom(room: RoomConfig): Observable<RoomCreateResponseDto> {
    return this.sendAndObserve<RoomCreateResponseDto | ErrorDto>('/app/create-room',room, ['/user/queue/room-created', '/user/queue/room-error'])
      .pipe(
        mergeMap(response => {
          if ('code' in response) {
            return throwError(() => response);
          }
          return of(response as RoomCreateResponseDto);
        })
      );
  }

  public createSingleplayer(room: RoomConfig): Observable<any> {
    return this.sendAndObserve('/app/create-singleplayer',room, ['/user/queue/room-created', '/user/queue/room-error']);
  }


  public joinRoom(roomId: string, playerConfig: PlayerConfig) : Observable<RoomJoinDto> {
    return this.sendAndObserve<RoomJoinDto | ErrorDto>("/app/join-room", {roomId , playerConfig}, ['/user/queue/join-confirm', '/user/queue/join-error'])
      .pipe(
        mergeMap(response => {
          if ('code' in response) {
            return throwError(() => response);
          }
          return of(response as RoomJoinDto);
        })
      );
  }


  public leaveRoom(roomId: string, playerId: string) {
    this.sendAndObserve<Boolean | ErrorDto>("/app/leave-room", { roomId, playerId }, ["/user/queue/leave-confirm", "/user/queue/leave-error"])
      .pipe(
        mergeMap(response => {
          if ('code' in response) {
            return throwError(() => response);
          }
          return of(response as boolean);
        }),
        catchError(err => {
          console.error('Error leaving room:', err);
          return of(false); // Return false on error
        })
      ).subscribe(
        success => {
          if (success) {
            this.clearSessionData();
          } else {
            console.warn('Failed to leave room');
          }
        }
      );
  }

  public playerJoined(roomId: string): Observable<PlayerDto> {
    return this.observe('/topic/' + roomId + '/player-joined')
  }
                                    // receives only the id
  public playerLeft(roomId: string): Observable<String> {
    return this.observe('/topic/' + roomId + '/player-left')
  }


  // Player Management //

  public playerReady(roomId: string, playerId: string): Observable<boolean> {
    return this.sendAndObserve<Boolean | ErrorDto>('/app/player-ready', {roomId, playerId}, ['/user/queue/player-ready', '/user/queue/player-error'])
      .pipe(
        mergeMap(response => {
          if ('code' in response) {
            return throwError(() => response);
          }
          return of(response as boolean);
        }),
        catchError(err => {
          console.error('Error marking player as ready:', err);
          return of(false); // Return false on error
        })
      );
  }

  public playerUnready(roomId: string, playerId: string): Observable<boolean> {
    return this.sendAndObserve<Boolean | ErrorDto>('/app/player-unready', {roomId, playerId}, ['/user/queue/player-unready', '/user/queue/player-error'])
      .pipe(
        mergeMap(response => {
          if ('code' in response) {
            return throwError(() => response);
          }
          return of(response as boolean);
        }),
        catchError(err => {
          console.error('Error marking player as unready:', err);
          return of(false); // Return false on error
        })
      );
  }

  public playerKicked(): Observable<string> {
    return this.observe('/user/queue/kicked')
  }

  public playerStatusUpdate(roomId: string): Observable<{id: string, status: boolean}> {
    return this.observe('/topic/' + roomId + '/player-status-update');

  }

  public getPlayerDifficulty(roomId:string, playerId: string): Observable<Difficulty> {
    return this.sendAndObserve<Difficulty | ErrorDto>('/app/get-player-difficulty', {roomId, playerId}, ['/user/queue/player-difficulty', "/user/queue/player-error"])
      .pipe(
        mergeMap(response => {
          if ('code' in response) {
            return throwError(() => response);
          }
          return of(response as Difficulty);
        }),
        catchError(err => {
          console.error('Error getting player difficulty:', err);
          return of({ easy: 0, medium: 0, hard: 0, extreme: 0 }); // Return default difficulty on error
        })
      );
  }

  public updatePlayerDifficulty(roomId: string, playerId: string, difficulty_values: any): Observable<Difficulty> {
    return this.sendAndObserve<Difficulty | ErrorDto>('/app/change-difficulty', { roomId, playerId, difficulty_values }, ['/user/queue/difficulty-changed', 'user/queue/difficulty-change-error'])
      .pipe(
        mergeMap(response => {
          if ('code' in response) {
            return throwError(() => response);
          }
          return of(response as Difficulty);
        }),
        catchError(err => {
          console.error('Error updating player difficulty:', err);
          return of({ easy: 0, medium: 0, hard: 0, extreme: 0 }); // Return default difficulty on error
        })
      );
  }

  public kickPlayer(roomId: string, playerId: string): Observable<KickDto> {
    return this.sendAndObserve<KickDto | ErrorDto>('/app/admin-remove-player', { roomId, playerId }, ['user/queue/kick-confirm', '/user/queue/kick-error'])
      .pipe(
        mergeMap(response => {
          if ('code' in response) {
            return throwError(() => response);
          }
          return of(response as KickDto);
        }),
        catchError(err => {
          console.error('Error kicking player:', err);
          return of({ message: 'Failed to kick player', id: playerId }); // Return default kick message on error
        })
      );
  }


  /// Game Management ///

  public startGame(roomId: string): void {
      this.send('/app/start-game', roomId);
  }

  public gameStarted(roomId: string): Observable<void> {
    return this.observe('/topic/' + roomId + '/game-started');
  }

  public onWait(): Observable<ChallengeDto> {
    return this.observe('/user/queue/wait-challenge');
  }

  public onChallenge(): Observable<ChallengeResponseDto> {
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
