## Requirements

- `bun@1.3.12`
- Docker (for the local stack and production image)
- A Postgres database for API and database package work (the Docker stack provides one)

## Getting Started

Install dependencies:

```bash
bun install
```

Create the API env file from the example and set `DATABASE_URL`:

```bash
cp apps/api/.env.example apps/api/.env
```

Don't forget to create a .env.development file with a database url for local development.

`DATABASE_URL` is required by the API app and Drizzle tooling.

## Common Commands

Run the full workspace in dev mode:

```bash
bun run dev
```

Run type checks across the workspace:

```bash
bun run check-types
```

Run Biome formatting and linting:

```bash
bun run format-and-lint
```

Auto-fix Biome issues:

```bash
bun run format-and-lint:fix
```

## Database Commands

All database commands are exposed from the repo root and target `packages/db`.

You must provide `DATABASE_URL` when running them, for example:

```bash
DATABASE_URL=postgres://postgres:12345@localhost:5432/example bun run db:push
```

As an alternative, you can create a temporary .env file at the root.

Common commands:

```bash
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio
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

Root-level helpers are available for working with just the API image:

```bash
bun run docker:build:api   # build app_name-api:local
bun run docker:run:api     # run it, loading apps/api/.env
bun run docker:shell:api   # open a shell in the image
```

`docker:run:api` expects `apps/api/.env` to exist and to contain a reachable `DATABASE_URL`.
