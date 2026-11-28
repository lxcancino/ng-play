import { Task, TaskStatus } from '@ng-play/shared/task-model';

/** One board column: a status plus the tasks currently in it. Derived from the task list, never stored. */
export interface BoardColumnView {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  done: 'Done',
  closed: 'Closed',
};
