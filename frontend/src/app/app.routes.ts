import { Routes } from '@angular/router';
import { StartPageComponent } from './start-page/start-page.component';
import { GameplayComponent} from "./gameplay/gameplay.component";
import { MultiplayerComponent } from './multiplayer/multiplayer.component';
import { SingleplayerComponent } from './singleplayer/singleplayer.component';
import {WaitingRoomComponent} from "./waiting-room/waiting-room.component";

export const routes: Routes = [
  { path: '', component: StartPageComponent },
  { path: 'multiplayer', component: MultiplayerComponent },
  { path: 'singleplayer', component: SingleplayerComponent },
  { path: 'room', component: WaitingRoomComponent },
  { path: 'game', component: GameplayComponent },
  { path: '**', redirectTo: '' }
];
