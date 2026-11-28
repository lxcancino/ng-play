import { Component, input } from '@angular/core';
import { Task } from '@ng-play/shared/task-model';

/** Presentational card: shows one task, knows nothing about drag and drop. */
@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  readonly task = input.required<Task>();
}
