import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';

import { routes } from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // Provide the HttpClient
    provideRouter(routes), // Provide the router with routes
    importProvidersFrom(FormsModule), provideAnimationsAsync() // Import necessary modules
  ]
})
  .catch(err => console.error(err));
