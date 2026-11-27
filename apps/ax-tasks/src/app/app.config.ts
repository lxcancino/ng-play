import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideInMemoryTasks } from '@ng-play/angular/task-data';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideInMemoryTasks(),
    provideRouter(appRoutes, withComponentInputBinding()),
  ],
};
