import { describe, expect, it } from 'vitest';
import { TASK_STATUSES, TERMINAL_TASK_STATUSES, TaskDraft } from './task.model';

describe('task model', () => {
  it('lists every terminal status among the workflow statuses', () => {
    for (const status of TERMINAL_TASK_STATUSES) {
      expect(TASK_STATUSES).toContain(status);
    }
  });

  it('keeps closed as the only terminal status', () => {
    expect(TERMINAL_TASK_STATUSES).toEqual(['closed']);
  });

  it('builds a draft without server-owned fields', () => {
    const draft: TaskDraft = {
      title: 'Write the model',
      description: '',
      type: 'task',
      status: 'todo',
      priority: 'medium',
      assigneeId: null,
    };
    expect(Object.keys(draft)).not.toContain('id');
    expect(Object.keys(draft)).not.toContain('createdAt');
  });
});
