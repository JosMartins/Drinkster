import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  
  constructor() {
    this.socket = io();
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
      //TODO> Send to room 
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
  }
}