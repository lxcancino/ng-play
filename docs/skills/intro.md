# Skills: ideas and plan

Status: **idea only.** No skills, skeletons, or generators have been created yet.
Revisit when the user asks to start building them.

## Goal

Stop repeating the same setup for each practice scenario. Reusable skills generate
the common parts, so each exercise only has to cover the new Angular API being practiced.

## Layers

1. **Base skeleton** (`ng-skeleton`, working name): creates an app or feature with
   Nx generators. Standalone components, CSS, Vitest, layout shell, nav, and routing.
   Parameters: `name`, `routing=lazy|eager`, `scope`.
2. **Data layer** (`mock-data`, working name): local JSON files under `public/data/`
   plus a typed service over `HttpClient` or `resource()`. Parameters:
   `entities=users,tasks,status`, `latencyMs`, `source=json|memory`.
3. **Scenarios** (thin, compose the layers above):
   - `todo-tasks-skeleton`: User, Task, and Status CRUD with signals, forms, and routes.
     Parameters: `state=signals|resource`, `data=memory|json`.
   - `users-drilldown`: user list plus profile page with `withComponentInputBinding`
     and route params. The existing `apps/ax-tasks/src/app/features/users` is a starting point.
4. **API drills** (later, optional): one skill per API area, e.g. `resource`, `@defer`,
   control flow, signal forms. Each generates a small playground for one feature.

## Design decisions

- **Location:** project-level `.claude/skills/`, versioned with the code. Use the personal
  skills folder only for skills that should apply to every repo.
- **Scope split:**
  - *Shared skills* (used across apps): base skeleton, data layer. Their output goes to
    `libs/*` or a new app.
  - *Feature skills* (one feature or exercise): scenarios and API drills. Their output goes
    to an app's `features/` or a `libs/<scope>/<feature>` lib.
- **One conventions file** (e.g. `docs/skills/conventions.md`) referenced by every skill,
  so naming, folder layout, and `pnpm nx` commands aren't repeated inside each `SKILL.md`.
- **Exact commands for deterministic steps:** Nx generators and `pnpm nx` invocations are
  written verbatim in the skill. The model decides content, not flags.
- **Extract, don't invent:** build each scenario by hand first, then turn the working result
  into the skill. Skills written from scratch drift from what compiles.
- **Rule of three:** add a skill only after the same steps have been repeated for a third time.

## Suggested order

1. `ng-skeleton`
2. `mock-data`
3. `todo-tasks-skeleton`
4. `users-drilldown`
5. API drills, as needed

## Open questions

- Each new scenario gets its own app (isolated), or a lib inside a shared app? Leaning
  toward a new app per scenario, with shared code in libs.
- Which Angular APIs should the first drills cover?
