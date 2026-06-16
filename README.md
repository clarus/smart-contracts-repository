# Smart Contracts Repository

A TypeScript workspace for exploring curated deployed smart contracts.

The app contains:

- `apps/api`: NestJS API backed by Prisma and Postgres.
- `apps/web`: React explorer UI.
- `docker-compose.yml`: local Postgres for development.

## Features

- Browse deployed EVM contracts by chain, protocol, kind, and TVL.
- Open verified source links and repository/source-path links.
- View protocol-level aggregates and per-contract TVL snapshots.
- Explore curated contract relationships such as proxy, implementation, factory, vault, token, strategy, and dependency.
- Seed a realistic demo registry that can be replaced with real deployments.

## Local Development

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run prisma:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The API runs on `http://localhost:3000/api` and the web app runs on `http://localhost:5173`.

## Registry Data

V1 is read-only in the UI. Maintain deployments through `apps/api/prisma/seed.ts` and Prisma migrations.

TVL values prefer the latest snapshot, then fall back to a manual override. DeFiLlama metadata can be stored for protocols or contracts and refreshed through the local development admin endpoint.
