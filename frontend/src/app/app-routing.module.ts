import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameConfigComponent } from './game-config/game-config.component';
import {StartPageComponent} from "./start-page/start-page.component";
import {HttpClientModule} from "@angular/common/http";
import { ChallengeComponent} from "./challenge/challenge.component";
import { ChalAddComponent } from './chaladd/chaladd.component';

const routes: Routes = [
  { path: '', component: StartPageComponent }, // Route for start page
  { path: 'config', component: GameConfigComponent }, // Route for game config
  { path: 'game', component: ChallengeComponent }, //Route for game
  { path: 'chaladd', component: ChalAddComponent}
  // Add other routes as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  providers: [HttpClientModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
