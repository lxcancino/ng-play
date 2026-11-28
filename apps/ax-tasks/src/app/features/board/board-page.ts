import { Component, computed, inject, resource } from '@angular/core';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { TASK_REPOSITORY } from '@ng-play/angular/task-data';
import { TASK_STATUSES } from '@ng-play/shared/task-model';
import { BoardColumn } from './board-column';
import { BoardColumnView, STATUS_LABELS } from './board.model';

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

  /** One column per status, in workflow order. Each task lands in exactly one column. */
  protected readonly columns = computed<BoardColumnView[]>(() => {
    const all = this.tasks.value() ?? [];
    return TASK_STATUSES.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      tasks: all.filter((t) => t.status === status),
    }));
  });
}
