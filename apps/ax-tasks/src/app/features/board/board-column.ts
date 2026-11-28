import { Component, input, output } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { TaskStatus } from '@ng-play/shared/task-model';
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
  readonly dropped = output<CdkDragDrop<TaskStatus>>();
}
