// Object model for the task-skeleton exercise: a small Jira-like tracker.
// Plain interfaces and string-literal unions (no `enum`): they serialize
// cleanly to the local JSON files we'll add later, and tree-shake to nothing.

/** Fixed set of work item types. Add here, and the compiler finds every switch that needs updating. */
export const TASK_TYPES = ['bug', 'story', 'task'] as const;
export type TaskType = (typeof TASK_TYPES)[number];

/** Fixed set of priorities, highest first. */
export const TASK_PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/** Fixed set of workflow states, in board order. */
export const TASK_STATUSES = ['todo', 'in-progress', 'in-review', 'done', 'closed'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/**
 * Statuses with no outgoing transitions: once a task is here, it stays here.
 * The types can't express this on their own; the workflow/service layer must enforce it.
 */
export const TERMINAL_TASK_STATUSES = ['closed'] as const satisfies readonly TaskStatus[];

/** A person who can be assigned or can report a task. */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

/** A work item, like a Jira issue. Relations are stored as ids (normalized), not nested objects. */
export interface Task {
  id: string;
  /** Human-readable key, e.g. "TSK-12". Unique per project. */
  key: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  /** Null when unassigned. */
  assigneeId: string | null;
  reporterId: string;
  /** ISO 8601 strings, so they round-trip through JSON. */
  createdAt: string;
  updatedAt: string;
}

/** Fields a user supplies when creating or editing a task. Server-owned fields are omitted. */
export type TaskDraft = Pick<
  Task,
  'title' | 'description' | 'type' | 'status' | 'priority' | 'assigneeId'
>;
