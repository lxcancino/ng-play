import { Component, computed, input, output } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import {
  Task,
  TASK_STATUSES,
  TERMINAL_TASK_STATUSES,
  TaskStatus,
} from '@ng-play/shared/task-model';
import { TaskCard } from './task-card';
import { BoardColumnView, KeyboardMove } from './board.model';

@Component({
  selector: 'app-board-column',
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
    TaskCard,
  ],
  templateUrl: './board-column.html',
  styleUrl: './board-column.css',
})
export class BoardColumn {
  readonly column = input.required<BoardColumnView>();

  /** Emitted when a card is dropped on this column's list. The parent decides what the drop means. */
  readonly dropped = output<CdkDragDrop<TaskStatus, TaskStatus, Task>>();

  /** Emitted when a card's move button is pressed. */
  readonly keyboardMove = output<KeyboardMove>();

  /** Cards in a terminal status can't leave it, so every move is switched off for them. */
  protected readonly isTerminal = computed(() =>
    (TERMINAL_TASK_STATUSES as readonly TaskStatus[]).includes(
      this.column().status,
    ),
  );

  private readonly statusIndex = computed(() =>
    TASK_STATUSES.indexOf(this.column().status),
  );

  protected readonly canGoBack = computed(() => this.statusIndex() > 0);
  protected readonly canGoForward = computed(
    () => this.statusIndex() < TASK_STATUSES.length - 1,
  );
}
