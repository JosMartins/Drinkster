import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {RouterModule} from '@angular/router';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  standalone: true, // Mark as standalone
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule, FormsModule]
})
export class AppComponent implements OnInit {
  title = 'Drinkster';

  constructor(private readonly socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.setupReconnection();
  }
  
}
