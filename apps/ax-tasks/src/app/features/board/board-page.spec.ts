import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TASK_REPOSITORY, TaskRepository } from '@ng-play/angular/task-data';
import { Task, TaskStatus } from '@ng-play/shared/task-model';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BoardPage } from './board-page';

function task(id: string, key: string, status: TaskStatus): Task {
  return {
    id,
    key,
    title: `Title ${key}`,
    description: '',
    type: 'task',
    status,
    priority: 'medium',
    assigneeId: null,
    reporterId: 'u-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

const TASKS: Task[] = [
  task('t1', 'TSK-1', 'todo'),
  task('t2', 'TSK-2', 'todo'),
  task('t3', 'TSK-3', 'in-progress'),
  task('t4', 'TSK-4', 'closed'),
];

let updateTask: ReturnType<typeof vi.fn>;

async function settle(fixture: ComponentFixture<BoardPage>): Promise<void> {
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

async function render(): Promise<ComponentFixture<BoardPage>> {
  const fixture = TestBed.createComponent(BoardPage);
  await settle(fixture);
  return fixture;
}

/** The titles of the columns, in order. */
function columnNames(fixture: ComponentFixture<BoardPage>): string[] {
  return columnElements(fixture).map(
    (c) => c.querySelector('h3')?.textContent?.trim() ?? '',
  );
}

function columnElements(fixture: ComponentFixture<BoardPage>): HTMLElement[] {
  return Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
      'section.column',
    ),
  );
}

/** The card keys shown in one column, in display order. */
function keysIn(
  fixture: ComponentFixture<BoardPage>,
  column: string,
): string[] {
  const el = columnElements(fixture).find(
    (c) => c.querySelector('h3')?.textContent?.trim() === column,
  );
  return Array.from(el?.querySelectorAll('.key') ?? []).map(
    (k) => k.textContent?.trim() ?? '',
  );
}

function moveButton(
  fixture: ComponentFixture<BoardPage>,
  key: string,
  direction: 'previous column' | 'up' | 'down' | 'next column',
): HTMLButtonElement {
  return (
    fixture.nativeElement as HTMLElement
  ).querySelector<HTMLButtonElement>(
    `button[aria-label="Move ${key} ${direction === 'up' || direction === 'down' ? direction : 'to ' + direction}"]`,
  ) as HTMLButtonElement;
}

function dragItem(
  fixture: ComponentFixture<BoardPage>,
  key: string,
): HTMLElement {
  return Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
      '.drag-item',
    ),
  ).find(
    (el) => el.querySelector('.key')?.textContent?.trim() === key,
  ) as HTMLElement;
}

beforeEach(async () => {
  updateTask = vi.fn().mockResolvedValue(undefined);
  await TestBed.configureTestingModule({
    imports: [BoardPage],
    providers: [
      provideRouter([]),
      {
        provide: TASK_REPOSITORY,
        useValue: {
          listTasks: async () => TASKS,
          updateTask,
        } as unknown as TaskRepository,
      },
    ],
  }).compileComponents();
});

describe('BoardPage', () => {
  it('shows one column per status, in workflow order, with each task in its own column', async () => {
    const fixture = await render();

    expect(columnNames(fixture)).toEqual([
      'To Do',
      'In Progress',
      'In Review',
      'Done',
      'Closed',
    ]);
    expect(keysIn(fixture, 'To Do')).toEqual(['TSK-1', 'TSK-2']);
    expect(keysIn(fixture, 'In Progress')).toEqual(['TSK-3']);
    expect(keysIn(fixture, 'Closed')).toEqual(['TSK-4']);
    expect(keysIn(fixture, 'In Review')).toEqual([]);
  });

  it('moves a card to the next column and saves the new status', async () => {
    const fixture = await render();

    moveButton(fixture, 'TSK-1', 'next column').click();
    await settle(fixture);

    expect(keysIn(fixture, 'To Do')).toEqual(['TSK-2']);
    expect(keysIn(fixture, 'In Progress')).toEqual(['TSK-3', 'TSK-1']);
    expect(updateTask).toHaveBeenCalledWith('t1', { status: 'in-progress' });
  });

  it('reverts the board and shows an error when the save fails', async () => {
    updateTask.mockRejectedValueOnce(new Error('network down'));
    const fixture = await render();

    moveButton(fixture, 'TSK-1', 'next column').click();
    await settle(fixture);

    expect(keysIn(fixture, 'To Do')).toEqual(['TSK-1', 'TSK-2']);
    expect(keysIn(fixture, 'In Progress')).toEqual(['TSK-3']);
    const error = (fixture.nativeElement as HTMLElement).querySelector(
      '.error',
    );
    expect(error?.textContent).toContain('reverted');
  });

  it('reorders within a column without saving anything', async () => {
    const fixture = await render();

    moveButton(fixture, 'TSK-2', 'up').click();
    await settle(fixture);

    expect(keysIn(fixture, 'To Do')).toEqual(['TSK-2', 'TSK-1']);
    expect(updateTask).not.toHaveBeenCalled();
  });

  it('disables the moves that would go past the edge of the board', async () => {
    const fixture = await render();

    // TSK-1 is first in To Do and To Do is the first column.
    expect(moveButton(fixture, 'TSK-1', 'previous column').disabled).toBe(true);
    expect(moveButton(fixture, 'TSK-1', 'up').disabled).toBe(true);
    expect(moveButton(fixture, 'TSK-2', 'down').disabled).toBe(true);
    expect(moveButton(fixture, 'TSK-1', 'next column').disabled).toBe(false);
  });

  it('switches off every move for a card in a terminal status', async () => {
    const fixture = await render();

    expect(dragItem(fixture, 'TSK-4').classList).toContain('cdk-drag-disabled');
    for (const direction of [
      'previous column',
      'up',
      'down',
      'next column',
    ] as const) {
      expect(moveButton(fixture, 'TSK-4', direction).disabled).toBe(true);
    }
    expect(dragItem(fixture, 'TSK-1').classList).not.toContain(
      'cdk-drag-disabled',
    );
  });
});
