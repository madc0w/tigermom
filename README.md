# Nuxt 3 + MongoDB (TypeScript)

A minimal starter using Nuxt 3 (Vue 3) with a MongoDB backend via Nitro server routes, all in TypeScript.

## Prerequisites

- Node.js 18+ (Nuxt 3 requires modern Node)
- npm (or pnpm/yarn)

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Ensure you have access to a MongoDB instance and connection string (local or hosted).

3. Create `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your connection string.

4. Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000 to view the app. Add tasks and see them saved to MongoDB.

## Project structure

- `server/utils/mongo.ts`: Reusable Mongo client + `getDb()` helper
- `server/api/tasks.*.ts`: Example GET/POST endpoints
- `pages/index.vue`: Minimal UI that calls the API

## Build & deploy

```bash
npm run build
npm run start
```

Nitro outputs to `.output/` and can be deployed to many targets.

## Environment variables

- `MONGODB_URI` (required)
- `MONGODB_DB` (optional, defaults to `app`)

## Notes

- This starter uses the official `mongodb` driver. If you prefer schemas/validation, you can swap to Mongoose or Zod validation in the routes.# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
