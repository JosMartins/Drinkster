import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { GameConfigComponent } from './app/game-config/game-config.component';

import { routes } from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Provide the router with routes
    importProvidersFrom(FormsModule), provideAnimationsAsync() // Import necessary modules
  ]
})
  .catch(err => console.error(err));
