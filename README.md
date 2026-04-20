# keel

A batteries-included TypeScript monorepo template. Clone it, rename a couple of placeholders, and you have a working API + web app + database package with CI, Docker, linting, and type-checking already wired up.

## What's Included

- **Runtime / package manager:** [Bun](https://bun.sh) `1.3.12`
- **Monorepo:** [Turborepo](https://turbo.build/repo) with Bun workspaces
- **API (`apps/api`):** [Hono](https://hono.dev) on Bun, structured logging with `pino`, Zod validation
- **Web (`apps/web`):** React 19 + Vite + Tailwind v4
- **Database (`packages/db`):** [Drizzle ORM](https://orm.drizzle.team) + Postgres
- **Shared TS config (`packages/typescript-config`):** base / bundler / react presets
- **Tooling:** [Biome](https://biomejs.dev) for lint + format, `bun test` for the API
- **Infra:** Multi-stage Bun Dockerfile for the API, Compose stack (API + Postgres) under `infra/docker/`
- **CI:** GitHub Actions workflow (lint, type-check, build, test, Docker build)
- **Repo hygiene:** PR template, issue templates, CODEOWNERS, LICENSE (MIT)

## Repo Layout

```
apps/
  api/                 # Hono API on Bun
  web/                 # React + Vite + Tailwind
packages/
  db/                  # Drizzle schema, client, migrations
  typescript-config/   # Shared tsconfig presets
infra/
  docker/              # docker-compose for API + Postgres
.github/               # CI, PR/issue templates, CODEOWNERS
```

## Using This Template

### 1. Replace the `app_name` placeholder

The string `app_name` is used as a placeholder anywhere the project name needs to appear. Before doing anything else, rename it to your project:

- `package.json` → `"name": "app_name"` (root)
- `package.json` → `docker:build:api`, `docker:run:api`, `docker:shell:api` scripts (image tag `app_name-api:local`)
- `infra/docker/docker-compose.yml` → top-level `name: app_name`
- `.github/workflows/ci.yml` → `tags: app_name-api:ci`

A one-shot find/replace across those files is enough — there are no other references.

### 2. Update metadata

- `LICENSE` — update the copyright holder
- `.github/CODEOWNERS` — replace `@vessbon` with your GitHub handle/team
- `README.md` — this file. Rewrite it for your project.

### 3. What's not yet included

These are intentionally left open so you can pick what fits your project:

- **Web test integration.** `apps/web` has no test runner configured. Add [Vitest](https://vitest.dev) (pairs well with Vite) or `bun test` with a jsdom setup, wire a `test` script into `apps/web/package.json`, and extend the root `test` script / CI job accordingly.
- **Deployment targets.** The API Dockerfile is production-ready, but there's no deploy workflow (Fly, Railway, ECS, etc.).
- **Auth, sessions, error reporting, observability** — add as needed.

## Requirements

- `bun@1.3.12`
- Docker (for the local Compose stack and the production API image)
- A Postgres database for the API and the `@repo/db` package (the Compose stack provides one)

## Getting Started

Install dependencies:

```bash
bun install
```

Create the API `.env` and `.env.development` files and set `DATABASE_URL` for the `.env.development`:

```bash
cp apps/api/.env.example apps/api/.env
```

`DATABASE_URL` is required by the API and by Drizzle tooling. For local development against the Compose Postgres, the default is:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/example
```

## Common Commands

Run the full workspace in dev mode:

```bash
bun run dev          # everything
bun run dev:api      # API only
bun run dev:web      # web only
```

Type-check the workspace:

```bash
bun run check-types
```

Lint and format with Biome:

```bash
bun run format-and-lint        # check
bun run format-and-lint:fix    # auto-fix
```

Run tests (currently API only — see [What's not yet included](#3-whats-not-yet-included)):

```bash
bun run test
```

## Database Commands

All database commands are exposed from the repo root and target `packages/db`. They require `DATABASE_URL`:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/example bun run db:push
```

As an alternative, create a temporary `.env` at the repo root with `DATABASE_URL` set.

```bash
bun run db:generate    # generate a migration from schema changes
bun run db:migrate     # apply migrations
bun run db:push        # push schema directly (dev)
bun run db:studio      # open Drizzle Studio
```

## Docker

The API ships as a multi-stage Bun image. A Compose stack under `infra/docker/` runs the API together with Postgres for local, production-shaped runs.

### Compose stack (API + Postgres)

Copy the example env file and adjust as needed:

```bash
cp infra/docker/.env.example infra/docker/.env
```

Available knobs (see `infra/docker/.env.example`):

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` — database credentials
- `POSTGRES_PORT` — host-side port for Postgres (container always listens on 5432)
- `API_PORT` — host-side port for the API (container always listens on 3000)

Bring the stack up:

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

Tear it down (preserving the `db-data` volume):

```bash
docker compose -f infra/docker/docker-compose.yml down
```

The `api` service waits for the `db` healthcheck before starting and connects over the internal Docker network using `DATABASE_URL=postgres://<user>:<pass>@db:5432/<db>`.

### Building and running the API image directly

Root-level helpers are available for the API image alone (remember to swap `app_name` for your project name first):

```bash
bun run docker:build:api   # build app_name-api:local
bun run docker:run:api     # run it, loading apps/api/.env
bun run docker:shell:api   # open a shell in the image
```

`docker:run:api` expects `apps/api/.env` to exist and to contain a reachable `DATABASE_URL`.

## License

[MIT](./LICENSE)
