import {
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TASK_REPOSITORY } from '@ng-play/angular/task-data';
import { TASK_STATUSES, TaskStatus } from '@ng-play/shared/task-model';

@Component({
  selector: 'app-task-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail {
  private readonly repo = inject(TASK_REPOSITORY);

  /** Bound from the `:id` route segment (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly statuses = TASK_STATUSES;
  protected readonly actionError = signal<string | null>(null);

  /** Resource with params: every change of `id()` re-runs the loader. */
  protected readonly task = resource({
    params: () => this.id(),
    loader: ({ params }) => this.repo.getTask(params),
  });

  protected readonly users = resource({
    loader: () => this.repo.listUsers(),
  });

  protected readonly assigneeName = computed(() => {
    const assigneeId = this.task.value()?.assigneeId;
    if (!assigneeId) {
      return 'Unassigned';
    }
    return (
      this.users.value()?.find((u) => u.id === assigneeId)?.name ?? 'Unknown'
    );
  });

  protected async onStatusChange(event: Event): Promise<void> {
    // The DOM gives a string; the repository rejects any value outside TASK_STATUSES.
    const status = (event.target as HTMLSelectElement).value as TaskStatus;
    this.actionError.set(null);
    try {
      await this.repo.updateTask(this.id(), { status });
      this.task.reload();
    } catch (error) {
      this.actionError.set((error as Error).message);
      this.task.reload(); // reset the select to the stored status
    }
  }
}
