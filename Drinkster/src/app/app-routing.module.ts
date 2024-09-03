import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameConfigComponent } from './game-config/game-config.component';
import {StartPageComponent} from "./start-page/start-page.component";
import {HttpClientModule} from "@angular/common/http";

const routes: Routes = [
  { path: '', component: StartPageComponent }, // Route for start page
  { path: 'config', component: GameConfigComponent }, // Route for game config
  // Add other routes as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  providers: [HttpClientModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
