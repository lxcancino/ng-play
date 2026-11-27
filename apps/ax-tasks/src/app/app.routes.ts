import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/task-list').then((m) => m.TaskList),
  },
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import('./features/tasks/task-detail').then((m) => m.TaskDetail),
  },
];
