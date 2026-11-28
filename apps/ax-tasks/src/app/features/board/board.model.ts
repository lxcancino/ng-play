import { Task, TASK_STATUSES, TaskStatus } from '@ng-play/shared/task-model';

/** One board column: a status plus the tasks currently in it. Derived from the task list, never stored. */
export interface BoardColumnView {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}

export type TasksByStatus = Record<TaskStatus, Task[]>;

/** Keyboard alternatives to dragging. Each one is a button on a card. */
export type MoveAction = 'previous-column' | 'next-column' | 'up' | 'down';

export interface KeyboardMove {
  task: Task;
  action: MoveAction;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  done: 'Done',
  closed: 'Closed',
};

/** Groups tasks by status. Every status gets a key, even when it has no tasks. */
export function groupByStatus(tasks: Task[]): TasksByStatus {
  const groups = Object.fromEntries(
    TASK_STATUSES.map((status) => [status, [] as Task[]]),
  ) as TasksByStatus;
  for (const task of tasks) {
    groups[task.status].push(task);
  }
  return groups;
}
