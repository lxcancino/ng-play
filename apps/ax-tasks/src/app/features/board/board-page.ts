import {
  Component,
  computed,
  inject,
  linkedSignal,
  resource,
} from '@angular/core';
import {
  CdkDragDrop,
  CdkDropListGroup,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { TASK_REPOSITORY } from '@ng-play/angular/task-data';
import { TASK_STATUSES, TaskStatus } from '@ng-play/shared/task-model';
import { BoardColumn } from './board-column';
import { BoardColumnView, groupByStatus, STATUS_LABELS } from './board.model';

@Component({
  selector: 'app-board-page',
  imports: [CdkDropListGroup, BoardColumn],
  templateUrl: './board-page.html',
  styleUrl: './board-page.css',
})
export class BoardPage {
  private readonly repo = inject(TASK_REPOSITORY);

  protected readonly tasks = resource({
    loader: () => this.repo.listTasks(),
  });

  /**
   * The order of tasks inside each column. It's writable, because a drop changes it.
   * linkedSignal starts from the grouped server data and resets whenever `tasks` gets a new value.
   */
  private readonly tasksByStatus = linkedSignal(() =>
    groupByStatus(this.tasks.value() ?? []),
  );

  /** One column per status, in workflow order. */
  protected readonly columns = computed<BoardColumnView[]>(() => {
    const groups = this.tasksByStatus();
    return TASK_STATUSES.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      tasks: groups[status],
    }));
  });

  /**
   * Reorders a card inside its column. The CDK has already moved the ghost and the gap;
   * this is where the data changes. Cross-column drops are handled in Stage 5.
   */
  protected onDropped(event: CdkDragDrop<TaskStatus>): void {
    if (event.previousContainer !== event.container) {
      return;
    }

    const status = event.container.data;
    // moveItemInArray mutates its array, so copy the array and the object before changing them.
    const groups = { ...this.tasksByStatus() };
    const column = [...groups[status]];
    moveItemInArray(column, event.previousIndex, event.currentIndex);
    groups[status] = column;
    this.tasksByStatus.set(groups);
  }
}
