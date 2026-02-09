# web3-course monorepo

This repo is managed with **pnpm workspaces** and **Turborepo**.

## Structure

- `frontend` – Next.js app
- `backend` – NestJS API
- `contracts` – Hardhat contracts

## Setup

```bash
pnpm install
```

## Common commands

- Start everything (parallel):

```bash
pnpm dev
```

- Frontend only:

```bash
pnpm dev:frontend
```

- Backend only:

```bash
pnpm dev:backend
```

- Local Hardhat node:

```bash
pnpm dev:contracts
```

## Contracts

- Compile:

```bash
pnpm contracts:compile
```

- Deploy to localhost:

```bash
pnpm contracts:deploy:local
```

- Export ABI (localhost):

```bash
pnpm contracts:export:abi:local
```

## Build / Lint

```bash
pnpm build
pnpm lint
```

## Notes

- `turbo` runs tasks based on each package's own `scripts`.
- The pipeline config is in `turbo.json`.
