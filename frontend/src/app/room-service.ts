import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private id: number | null = null;

  constructor() { }

  setId(id: number) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

}
