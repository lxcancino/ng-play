import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import seedTasks from './seed/tasks.json';
import seedUsers from './seed/users.json';
import { InMemoryTaskRepository } from './in-memory-task-repository';
import { TASK_REPOSITORY } from './task-repository';

/** Registers the in-memory repository with demo data. Call it in the app's providers. */
export function provideInMemoryTasks(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: TASK_REPOSITORY,
      useFactory: () => new InMemoryTaskRepository(seedUsers, seedTasks),
    },
  ]);
}
