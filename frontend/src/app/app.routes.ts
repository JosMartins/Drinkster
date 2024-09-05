import { Routes } from '@angular/router';
import { GameConfigComponent } from './game-config/game-config.component';
import { StartPageComponent } from './start-page/start-page.component';
import { ChallengeComponent} from "./challenge/challenge.component";
import { ChalAddComponent } from './chaladd/chaladd.component';

export const routes: Routes = [
  { path: '', component: StartPageComponent },
  { path: 'config', component: GameConfigComponent },
  { path: 'game', component: ChallengeComponent },
  { path: 'chaladd', component: ChalAddComponent }
];
