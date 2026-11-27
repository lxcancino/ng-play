# task-model

Framework-agnostic object model for a small Jira-style task tracker: tasks, users, and their fixed sets of types, priorities, and statuses.

Import path: `@ng-play/shared/task-model`

Tags: `scope:shared`, `type:lib`, `framework:agnostic`. Pure TypeScript, so any Angular, NestJS, or other TypeScript app can use it. Don't add Angular, DOM, or Node-only APIs here.

## Contents

| Export | Kind | Purpose |
| --- | --- | --- |
| `TASK_TYPES` / `TaskType` | const array / union | `bug`, `story`, `task` |
| `TASK_PRIORITIES` / `TaskPriority` | const array / union | `critical`, `high`, `medium`, `low` (highest first) |
| `TASK_STATUSES` / `TaskStatus` | const array / union | `todo`, `in-progress`, `in-review`, `done`, `closed` (board order) |
| `TERMINAL_TASK_STATUSES` | const array | Statuses with no outgoing transitions: `closed` |
| `User` | interface | A person who can be an assignee or reporter |
| `Task` | interface | A work item; relations are ids |
| `TaskDraft` | type | Fields a form sends on create or edit |

## Design notes

- **Fixed sets are `as const` arrays.** Each union type is derived from its array, so the runtime list and the compile-time type can't drift apart. Adding a value to an array makes it valid everywhere the type is used.
- **No `enum`.** String-literal unions serialize cleanly to JSON and emit no runtime code.
- **Relations are ids.** `Task.assigneeId` and `Task.reporterId` point to `User.id`. Resolve names at display time. This keeps data normalized, as it would be in a database.
- **Dates are ISO 8601 strings**, so they round-trip through JSON without conversion.
- **`TaskDraft` omits server-owned fields** (`id`, `key`, `reporterId`, timestamps), so forms can't set them.
- **Terminal statuses are a rule, not a type.** TypeScript can't stop a transition out of `closed`. The workflow or service layer must enforce `TERMINAL_TASK_STATUSES`.

## Usage

```ts
import { TASK_STATUSES, TaskDraft, TaskStatus } from '@ng-play/shared/task-model';

const draft: TaskDraft = {
  title: 'Write the model',
  description: '',
  type: 'task',
  status: 'todo',
  priority: 'medium',
  assigneeId: null,
};

const columns: TaskStatus[] = [...TASK_STATUSES]; // board order
```

## Commands

- Build: `pnpm nx build task-model`
- Unit tests: `pnpm nx test task-model`
- Lint: `pnpm nx lint task-model`
