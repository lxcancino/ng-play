import { Component, computed, inject, resource, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TASK_REPOSITORY } from '@ng-play/angular/task-data';
import { from, map, switchMap, timer } from 'rxjs';

@Component({
  selector: 'app-task-list',
  imports: [RouterLink],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  private readonly repo = inject(TASK_REPOSITORY);

  protected readonly query = signal('');

  /** Bare resource: no params, runs once. `reload()` re-runs the loader. */
  protected readonly users = resource({
    loader: () => this.repo.listUsers(),
  });

  /**
   * rxResource: `stream` returns an Observable (note: `stream`, not `loader`). When `query`
   * changes, the previous subscription is cancelled and the 250 ms timer restarts: a debounced search.
   */
  protected readonly tasks = rxResource({
    params: () => this.query().trim().toLowerCase(),
    stream: ({ params }) =>
      timer(250).pipe(
        switchMap(() => from(this.repo.listTasks())),
        map((all) => all.filter((t) => t.title.toLowerCase().includes(params))),
      ),
  });

  protected readonly userNames = computed(
    () => new Map((this.users.value() ?? []).map((u) => [u.id, u.name])),
  );

  protected nameOf(id: string | null): string {
    return id === null ? 'Unassigned' : (this.userNames().get(id) ?? 'Unknown');
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
