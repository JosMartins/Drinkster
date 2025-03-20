import { Component } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.css'
})
export class StartPageComponent {

  constructor(private readonly router: Router) { }


  configGame() {
    // Navigate to the game configuration page
    this.router.navigate(['/multiplayer']);
  }

  multiplayer() {
    // Navigate to the multiplayer page
    this.router.navigate(['/multiplayer']);
  }
}
