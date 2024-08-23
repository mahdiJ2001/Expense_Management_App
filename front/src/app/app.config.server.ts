import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { ServerModule } from '@angular/platform-server';

export const config: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    importProvidersFrom(ServerModule),
    provideClientHydration()
  ]
};

export default config;
