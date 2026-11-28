import {
  Component,
  computed,
  inject,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
import {
  CdkDragDrop,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TASK_REPOSITORY } from '@ng-play/angular/task-data';
import { Task, TASK_STATUSES, TaskStatus } from '@ng-play/shared/task-model';
import { BoardColumn } from './board-column';
import { BoardColumnView, groupByStatus, STATUS_LABELS } from './board.model';

type DropEvent = CdkDragDrop<TaskStatus, TaskStatus, Task>;

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

  /** Shown when a status change could not be saved. */
  protected readonly saveError = signal<string | null>(null);

  protected async onDropped(event: DropEvent): Promise<void> {
    if (event.previousContainer === event.container) {
      this.reorder(event);
    } else {
      await this.changeStatus(event);
    }
  }

  /** Same column: only the order changes. Nothing is stored yet (order has no field in the model). */
  private reorder(event: DropEvent): void {
    const status = event.container.data;
    // moveItemInArray mutates its array, so copy the array and the object before changing them.
    const groups = { ...this.tasksByStatus() };
    const column = [...groups[status]];
    moveItemInArray(column, event.previousIndex, event.currentIndex);
    groups[status] = column;
    this.tasksByStatus.set(groups);
  }

  /**
   * Different column: the status changes. The board updates first (optimistic), then the
   * repository is asked to save. If the save fails, the board goes back to its earlier state.
   */
  private async changeStatus(event: DropEvent): Promise<void> {
    const from = event.previousContainer.data;
    const to = event.container.data;
    const task = event.item.data;
    const before = this.tasksByStatus();

    const groups = {
      ...before,
      [from]: [...before[from]],
      [to]: [...before[to]],
    };
    transferArrayItem(
      groups[from],
      groups[to],
      event.previousIndex,
      event.currentIndex,
    );
    // Replace the moved object with a copy that carries the new status.
    groups[to][event.currentIndex] = { ...task, status: to };
    this.tasksByStatus.set(groups);
    this.saveError.set(null);

    try {
      await this.repo.updateTask(task.id, { status: to });
    } catch {
      this.tasksByStatus.set(before);
      this.saveError.set(
        `Could not move ${task.key}. The change was reverted.`,
      );
    }
  }
}
