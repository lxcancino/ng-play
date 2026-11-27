import { InjectionToken } from '@angular/core';
import { Task, TaskDraft, User } from '@ng-play/shared/task-model';

/**
 * Port for task data. Components and services depend on this interface, never on
 * a concrete store, so the in-memory implementation can later be swapped for HTTP.
 * Every method is async: it matches HttpClient and resource(), so callers don't change.
 */
export interface TaskRepository {
  listUsers(): Promise<User[]>;
  listTasks(): Promise<Task[]>;
  /** Rejects when no task has this id. */
  getTask(id: string): Promise<Task>;
  createTask(draft: TaskDraft, reporterId: string): Promise<Task>;
  /** Rejects when the change would move a terminal task (e.g. closed) to another status. */
  updateTask(id: string, changes: Partial<TaskDraft>): Promise<Task>;
  /** Rejects when no task has this id. */
  deleteTask(id: string): Promise<void>;
}

export const TASK_REPOSITORY = new InjectionToken<TaskRepository>(
  'TASK_REPOSITORY',
);
