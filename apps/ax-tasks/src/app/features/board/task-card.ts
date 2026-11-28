import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Task } from '@ng-play/shared/task-model';

/**
 * Presentational card: shows one task and knows nothing about drag and drop.
 * The header has a content slot, so the parent can place a drag handle there.
 */
@Component({
  selector: 'app-task-card',
  imports: [RouterLink],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  readonly task = input.required<Task>();
}
