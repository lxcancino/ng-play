import { Component, computed, input, output } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import {
  Task,
  TERMINAL_TASK_STATUSES,
  TaskStatus,
} from '@ng-play/shared/task-model';
import { TaskCard } from './task-card';
import { BoardColumnView } from './board.model';

@Component({
  selector: 'app-board-column',
  imports: [CdkDropList, CdkDrag, CdkDragPreview, CdkDragPlaceholder, TaskCard],
  templateUrl: './board-column.html',
  styleUrl: './board-column.css',
})
export class BoardColumn {
  readonly column = input.required<BoardColumnView>();

  /** Emitted when a card is dropped on this column's list. The parent decides what the drop means. */
  readonly dropped = output<CdkDragDrop<TaskStatus, TaskStatus, Task>>();

  /** Cards in a terminal status can't leave it, so their drag is switched off. */
  protected readonly isTerminal = computed(() =>
    (TERMINAL_TASK_STATUSES as readonly TaskStatus[]).includes(
      this.column().status,
    ),
  );
}
