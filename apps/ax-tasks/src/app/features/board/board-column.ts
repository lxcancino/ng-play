import { Component, input } from '@angular/core';
import {
  CdkDrag,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
} from '@angular/cdk/drag-drop';
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
}
