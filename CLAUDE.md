<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- The Nx MCP server (`nx-mcp`, pinned in `package.json`, configured in `.mcp.json`) only exposes `nx_docs`. Use it for Nx documentation. For workspace information (projects, targets, tags, graph), use the CLI: `pnpm nx show projects`, `pnpm nx show project <name>`, `pnpm nx graph`
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->

# Project guidelines (ng-play)

This is a personal learning workspace for modern Angular APIs. Sections below are
ours, not Nx's: keep them outside the `nx configuration` markers so Nx updates
don't overwrite them.

## Who we're working with and how

- The user is an experienced Angular and full-stack developer. Keep explanations
  concise, skip basics, and go straight to the Angular detail that matters
  (change detection, signals, DI, router lifecycle, etc.).
- Act as an Angular architect and a teacher. When explaining a fix, give the
  root cause first, then the change.
- Three request types:
  1. **Setup/scaffold** ("create a demo with a users list and profile page"): build it,
     and name the generator and options used.
  2. **Specific questions / "why doesn't this work"**: diagnose and explain, then fix.
  3. **Exercise finish**: only when the user says the exercise is good. Complete it
     and tighten the code.
- Don't commit unless asked. Show changes and ask first (personal `CLAUDE.md` rule).
- Use `pnpm`, not npm or yarn. The lockfile is `pnpm-lock.yaml` and pnpm 12 is installed.
  Run Nx through pnpm: `pnpm nx <target> <project>`.
- Don't remove the `allowBuilds` list in `pnpm-workspace.yaml`. It is needed for native
  builds (`nx`, `esbuild`, `lmdb`, and others).

## Stack

- Nx 23, Angular 22 (standalone components, signals, modern routing, `resource` APIs), Vitest
  via `@analogjs/vitest-angular`, ESLint flat config.
- Styles: plain CSS (`style: css` in `nx.json` generator defaults).

## Workspace structure and conventions

Current layout:

| Path | Tags | Path alias |
| --- | --- | --- |
| `apps/ax-tasks` | `type:app`, `framework:angular` | - |
| `libs/angular/ui` | `type:lib`, `framework:angular` | `@ng-play/angular/ui` |
| `libs/shared/util` | `type:lib`, `framework:agnostic` | `@ng-play/shared/util` |

Rules we follow:

- **Apps are thin shells.** They compose routes and providers. Feature code lives in libs, or
  in an app's `features/` folder while it has only one consumer.
- **Tags describe scope and type.** Each project should have one `scope:*` tag (domain or
  audience, e.g. `scope:shared`, `scope:users`) and one `type:*` tag (`type:app`,
  `type:feature`, `type:ui`, `type:data-access`, `type:util`). The existing `framework:*`
  tag stays. Add new tags only when the rules below need them.
- **Boundaries are enforced by lint.** `@nx/enforce-module-boundaries` in `eslint.config.mjs`
  has the current `depConstraints`:
  - `type:app` may depend only on `type:lib`.
  - `type:lib` may depend only on `type:lib`.
  - `framework:agnostic` may depend only on `framework:agnostic`.
  When a new tag is added, update these constraints too.
- **Shared vs. feature skills and libs:**
  - Code reused across apps goes to `libs/shared/*` (framework-agnostic) or `libs/angular/*`
    (Angular-specific), named by role.
  - Code for one feature goes to `libs/<scope>/<feature>` (e.g. `libs/users/feature-list`),
    or stays in the app's `features/` folder until a second consumer appears. Then promote it
    to a lib.
- **Library role names** follow Nx's folder conventions: `feature-*` (smart, routed),
  `ui-*` (presentational), `data-access-*` (state and HTTP), `util-*` (pure helpers).
- **Path aliases** are maintained in `tsconfig.base.json`. Add one when you create a lib.
- Before creating an app or lib, use the `nx-generate` skill, then run `pnpm nx show projects`
  and `pnpm nx graph` to check the result.
- Nx MCP: `nx_docs` only. Don't assume other `nx_*` workspace tools exist; use the CLI above
  for workspace queries.

## Planned skills (not created yet)

Skill ideas are recorded in [`docs/skills/intro.md`](docs/skills/intro.md). Don't create skills
or skeletons until the user asks for them.