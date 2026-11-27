import { describe, expect, it } from 'vitest';
import { InMemoryTaskRepository } from './in-memory-task-repository';
import seedTasks from './seed/tasks.json';
import seedUsers from './seed/users.json';

const repo = () => new InMemoryTaskRepository(seedUsers, seedTasks);

describe('InMemoryTaskRepository', () => {
  it('lists seeded users and tasks', async () => {
    const r = repo();
    expect(await r.listUsers()).toHaveLength(3);
    expect(await r.listTasks()).toHaveLength(6);
  });

  it('creates a task with the next key and the given reporter', async () => {
    const r = repo();
    const task = await r.createTask(
      {
        title: 'New',
        description: '',
        type: 'task',
        status: 'todo',
        priority: 'low',
        assigneeId: null,
      },
      'u-2',
    );
    expect(task.key).toBe('TSK-7');
    expect(task.reporterId).toBe('u-2');
    expect(await r.listTasks()).toHaveLength(7);
  });

  it('updates a task', async () => {
    const r = repo();
    const updated = await r.updateTask('t-3', {
      status: 'in-progress',
      assigneeId: 'u-3',
    });
    expect(updated.status).toBe('in-progress');
    expect(updated.assigneeId).toBe('u-3');
  });

  it('rejects leaving the terminal closed status', async () => {
    const r = repo();
    await expect(r.updateTask('t-5', { status: 'todo' })).rejects.toThrow(
      /cannot change/,
    );
  });

  it('allows edits to a closed task that keep its status', async () => {
    const r = repo();
    const updated = await r.updateTask('t-5', { title: 'Renamed' });
    expect(updated.status).toBe('closed');
    expect(updated.title).toBe('Renamed');
  });

  it('returns copies, so mutating a result does not change the store', async () => {
    const r = repo();
    const task = await r.getTask('t-1');
    task.title = 'mutated';
    expect((await r.getTask('t-1')).title).not.toBe('mutated');
  });

  it('deletes a task and rejects unknown ids', async () => {
    const r = repo();
    await r.deleteTask('t-1');
    await expect(r.getTask('t-1')).rejects.toThrow(/not found/);
    await expect(r.deleteTask('missing')).rejects.toThrow(/not found/);
  });

  it('rejects seed data with an unknown status', () => {
    const bad = [{ ...seedTasks[0], status: 'archived' }];
    expect(() => new InMemoryTaskRepository(seedUsers, bad)).toThrow(
      /task.status/,
    );
  });
});
