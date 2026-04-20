FROM oven/bun:1.3.12-slim AS base
WORKDIR /app

# Prune the monorepo down to just `api` and its workspace deps
FROM base AS prune
COPY . .
RUN bunx turbo prune api --docker

# Install deps using the pruned package.json + lockfile (cached layer)
FROM base AS install
COPY --from=prune /app/out/json ./
RUN bun install --frozen-lockfile

# Copy the rest of the application
FROM base AS build
ENV NODE_ENV=production
COPY --from=install /app/node_modules ./node_modules
COPY --from=prune /app/out/full/ ./
RUN bun run --filter=api build

# Runtime
FROM base AS runtime
WORKDIR /app/apps/api
ENV NODE_ENV=production

# Copy only what is needed from the build
COPY --from=build /app/apps/api/dist ./dist
COPY --from=prune /app/apps/api/favicon.ico ./favicon.ico

# Run the app
USER bun
EXPOSE 3000/tcp
CMD ["bun", "run", "dist/index.js"]
