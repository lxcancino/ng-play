# task-data

Angular data layer for tasks. Exposes a `TaskRepository` port and an in-memory implementation seeded from JSON, so apps can run without a backend.

Import path: `@ng-play/angular/task-data`

Tags: `scope:shared`, `type:lib`, `framework:angular`.

## Usage

```ts
// app.config.ts
import { provideInMemoryTasks } from '@ng-play/angular/task-data';

export const appConfig: ApplicationConfig = {
  providers: [provideInMemoryTasks()],
};
```

```ts
// any component or service
import { inject } from '@angular/core';
import { TASK_REPOSITORY } from '@ng-play/angular/task-data';

const repo = inject(TASK_REPOSITORY);
const tasks = await repo.listTasks();
```

## Design notes

- **Port and adapter.** `TASK_REPOSITORY` is an injection token typed as the `TaskRepository` interface. Consumers never import the in-memory class. Swapping in an HTTP implementation changes one provider line.
- **Async everywhere.** Methods return promises, which match `HttpClient` and `resource()`. Callers don't change when the data source does.
- **Copies, not references.** Results are `structuredClone`d, so a caller can't mutate the store without calling an update method.
- **Seed data is validated on load.** JSON imports are typed loosely, so `parseTask` and `parseUser` check every enum and field. A bad seed file fails at startup, not on a random page.
- **Workflow rule enforced here.** Tasks in a terminal status (`closed`, from `task-model`) can't change status. The rule lives in the repository because it's the only place that writes.

## Seed data

- `src/lib/seed/users.json`: three users.
- `src/lib/seed/tasks.json`: six tasks covering every status, type, and priority, plus one unassigned task and one closed task.

## Commands

- Unit tests: `pnpm nx test task-data`
- Lint: `pnpm nx lint task-data`
