import {
  Component,
  computed,
  inject,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  CdkDragDrop,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TASK_REPOSITORY } from '@ng-play/angular/task-data';
import { Task, TASK_STATUSES, TaskStatus } from '@ng-play/shared/task-model';
import { BoardColumn } from './board-column';
import {
  BoardColumnView,
  groupByStatus,
  KeyboardMove,
  STATUS_LABELS,
} from './board.model';

type DropEvent = CdkDragDrop<TaskStatus, TaskStatus, Task>;

@Component({
  selector: 'app-board-page',
  imports: [CdkDropListGroup, BoardColumn],
  templateUrl: './board-page.html',
  styleUrl: './board-page.css',
})
export class BoardPage {
  private readonly repo = inject(TASK_REPOSITORY);
  private readonly announcer = inject(LiveAnnouncer);

  protected readonly tasks = resource({
    loader: () => this.repo.listTasks(),
  });

  /**
   * The order of tasks inside each column. It's writable, because a move changes it.
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

  /** Drag and drop ends here. The CDK tells us where the card came from and where it went. */
  protected onDropped(event: DropEvent): void {
    void this.moveTask(
      event.item.data,
      event.previousContainer.data,
      event.previousIndex,
      event.container.data,
      event.currentIndex,
    );
  }

  /** Keyboard alternative: the move buttons on each card. Same moveTask path as the drag. */
  protected onKeyboardMove({ task, action }: KeyboardMove): void {
    const from = task.status;
    const fromIndex = this.tasksByStatus()[from].findIndex(
      (t) => t.id === task.id,
    );

    switch (action) {
      case 'up':
        void this.moveTask(task, from, fromIndex, from, fromIndex - 1);
        return;
      case 'down':
        void this.moveTask(task, from, fromIndex, from, fromIndex + 1);
        return;
      case 'previous-column':
      case 'next-column': {
        const step = action === 'previous-column' ? -1 : 1;
        const to = TASK_STATUSES[TASK_STATUSES.indexOf(from) + step];
        if (!to) {
          return;
        }
        // Keyboard moves add the card at the bottom of the target column.
        const toIndex = this.tasksByStatus()[to].length;
        void this.moveTask(task, from, fromIndex, to, toIndex);
        return;
      }
    }
  }

  /**
   * The one place where a card changes position.
   * Same column: only the order changes, and nothing is saved (order has no field in the model).
   * Different column: the status changes. The board updates first (optimistic), then the
   * repository saves it. If the save fails, the board goes back to its earlier state.
   */
  private async moveTask(
    task: Task,
    from: TaskStatus,
    fromIndex: number,
    to: TaskStatus,
    toIndex: number,
  ): Promise<void> {
    const before = this.tasksByStatus();
    const groups = {
      ...before,
      [from]: [...before[from]],
      [to]: [...before[to]],
    };

    if (from === to) {
      moveItemInArray(groups[from], fromIndex, toIndex);
      this.tasksByStatus.set(groups);
      this.announcer.announce(
        `${task.key} moved to position ${toIndex + 1} in ${STATUS_LABELS[to]}`,
      );
      return;
    }

    transferArrayItem(groups[from], groups[to], fromIndex, toIndex);
    // Replace the moved object with a copy that carries the new status.
    groups[to][toIndex] = { ...task, status: to };
    this.tasksByStatus.set(groups);
    this.saveError.set(null);

    try {
      await this.repo.updateTask(task.id, { status: to });
      this.announcer.announce(`${task.key} moved to ${STATUS_LABELS[to]}`);
    } catch {
      this.tasksByStatus.set(before);
      this.saveError.set(
        `Could not move ${task.key}. The change was reverted.`,
      );
      this.announcer.announce(
        `Could not move ${task.key}. The change was reverted.`,
      );
    }
  }
}
