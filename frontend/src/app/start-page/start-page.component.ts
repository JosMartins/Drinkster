import { Component } from '@angular/core';
import {Router} from "@angular/router";
import { AddChallengeDialogComponent } from '../add-challenge-dialog/add-challenge-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-start-page',
  standalone: true,
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.css'
})
export class StartPageComponent {

  constructor(private readonly router: Router, private readonly dialog: MatDialog) { }


  singleplayer() {
    // Navigate to the game configuration page
    this.router.navigate(['/singleplayer']).then();
  }

  multiplayer() {
    // Navigate to the multiplayer page
    this.router.navigate(['/multiplayer']).then();
  }

  addChallenge() {
    const dialogRef = this.dialog.open(AddChallengeDialogComponent, {
        width: '600px',
        panelClass: ['custom-dialog', 'transparent-overlay'],
        hasBackdrop: false,
      });

      dialogRef.afterClosed().subscribe(result => {
          if (result) {
              console.log('New challenge added', result);
          }
      });
  }

}
