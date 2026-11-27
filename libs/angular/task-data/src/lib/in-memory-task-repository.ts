import {
  Task,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  TaskDraft,
  TaskStatus,
  TERMINAL_TASK_STATUSES,
  User,
} from '@ng-play/shared/task-model';
import { TaskRepository } from './task-repository';

/**
 * Keeps tasks in memory and returns copies, so callers can't mutate the store
 * by accident. Seed data is validated on load: JSON imports bypass the type system.
 */
export class InMemoryTaskRepository implements TaskRepository {
  readonly #users: User[];
  #tasks: Task[];
  #nextNumber: number;

  constructor(users: readonly unknown[], tasks: readonly unknown[]) {
    this.#users = users.map(parseUser);
    this.#tasks = tasks.map(parseTask);
    this.#nextNumber = Math.max(0, ...this.#tasks.map(keyNumber)) + 1;
  }

  async listUsers(): Promise<User[]> {
    return structuredClone(this.#users);
  }

  async listTasks(): Promise<Task[]> {
    return structuredClone(this.#tasks);
  }

  async getTask(id: string): Promise<Task> {
    return structuredClone(this.#find(id));
  }

  async createTask(draft: TaskDraft, reporterId: string): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      ...draft,
      id: `t-${crypto.randomUUID()}`,
      key: `TSK-${this.#nextNumber++}`,
      reporterId,
      createdAt: now,
      updatedAt: now,
    };
    this.#tasks = [...this.#tasks, task];
    return structuredClone(task);
  }

  async updateTask(id: string, changes: Partial<TaskDraft>): Promise<Task> {
    const current = this.#find(id);
    const movesOutOfTerminal =
      changes.status !== undefined &&
      changes.status !== current.status &&
      (TERMINAL_TASK_STATUSES as readonly TaskStatus[]).includes(
        current.status,
      );
    if (movesOutOfTerminal) {
      throw new Error(
        `${current.key} is ${current.status} and its status cannot change`,
      );
    }
    const updated: Task = {
      ...current,
      ...changes,
      updatedAt: new Date().toISOString(),
    };
    this.#tasks = this.#tasks.map((t) => (t.id === id ? updated : t));
    return structuredClone(updated);
  }

  async deleteTask(id: string): Promise<void> {
    this.#find(id);
    this.#tasks = this.#tasks.filter((t) => t.id !== id);
  }

  #find(id: string): Task {
    const task = this.#tasks.find((t) => t.id === id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }
    return task;
  }
}

function keyNumber(task: Task): number {
  return Number(task.key.split('-')[1]) || 0;
}

function oneOf<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  field: string,
): T[number] {
  if (
    typeof value === 'string' &&
    (allowed as readonly string[]).includes(value)
  ) {
    return value as T[number];
  }
  throw new Error(`Invalid ${field}: ${JSON.stringify(value)}`);
}

function text(value: unknown, field: string): string {
  if (typeof value === 'string') {
    return value;
  }
  throw new Error(`Invalid ${field}: expected a string`);
}

function parseUser(raw: unknown): User {
  const u = raw as Record<string, unknown>;
  const user: User = {
    id: text(u['id'], 'user.id'),
    name: text(u['name'], 'user.name'),
    email: text(u['email'], 'user.email'),
  };
  if (typeof u['avatarUrl'] === 'string') {
    user.avatarUrl = u['avatarUrl'];
  }
  return user;
}

function parseTask(raw: unknown): Task {
  const t = raw as Record<string, unknown>;
  return {
    id: text(t['id'], 'task.id'),
    key: text(t['key'], 'task.key'),
    title: text(t['title'], 'task.title'),
    description: text(t['description'], 'task.description'),
    type: oneOf(t['type'], TASK_TYPES, 'task.type'),
    status: oneOf(t['status'], TASK_STATUSES, 'task.status'),
    priority: oneOf(t['priority'], TASK_PRIORITIES, 'task.priority'),
    assigneeId:
      t['assigneeId'] === null
        ? null
        : text(t['assigneeId'], 'task.assigneeId'),
    reporterId: text(t['reporterId'], 'task.reporterId'),
    createdAt: text(t['createdAt'], 'task.createdAt'),
    updatedAt: text(t['updatedAt'], 'task.updatedAt'),
  };
}
