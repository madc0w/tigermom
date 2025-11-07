# Nuxt 3 + MongoDB (TypeScript)

A minimal starter using Nuxt 3 (Vue 3) with a MongoDB backend via Nitro server routes, all in TypeScript. Includes basic email/password authentication.

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
- `pages/auth/signup.vue` / `signin.vue`: Basic auth forms (localStorage persistence)
- `server/api/auth/signup.post.ts` / `signin.post.ts`: Auth endpoints

## Build & deploy

```bash
npm run build
npm run start
```

Nitro outputs to `.output/` and can be deployed to many targets.

## Environment variables

- `MONGODB_URI` (required)
- `MONGODB_DB` (optional, defaults to `app`)

## Auth Endpoints

### Signup

`POST /api/auth/signup`
Body:

```json
{
	"email": "user@example.com",
	"firstName": "Ada",
	"lastName": "Lovelace",
	"password": "hunter42",
	"phone": "+15555555555" // optional
}
```

Rules: password min 8 chars. Email must be unique (stored lowercased).

### Signin

`POST /api/auth/signin`
Body:

```json
{
	"email": "user@example.com",
	"password": "hunter42"
}
```

### Response Shape

Both endpoints return:

```json
{
	"user": {
		"_id": "...",
		"email": "user@example.com",
		"firstName": "Ada",
		"lastName": "Lovelace",
		"phone": "+15555555555",
		"createdAt": "2025-11-07T00:00:00.000Z"
	},
	"token": "opaque.demo.token"
}
```

Token is a simple opaque string (NOT JWT) for demo only. Passwords hashed using Node `scrypt` with per-user salt (`salt:hexhash`).

## Client Persistence

`localStorage.setItem('auth', JSON.stringify(response))` on success (see auth pages). Use this for subsequent authenticated calls (future enhancement: send token as header).

## Users Collection Schema

```jsonc
{
	_id: ObjectId,
	email: string,
	firstName: string,
	lastName: string,
	phone?: string,
	passwordHash: string, // <salt>:<hex scrypt>
	createdAt: Date
}
```

## Notes

- This starter uses the official `mongodb` driver. If you prefer schemas/validation, you can swap to Mongoose or Zod validation in the routes.
- Authentication is minimal. Add: JWT signing, refresh tokens, email verification, logout endpoint, password reset.
- Add rate limiting & request validation (Zod or similar) before production.

# Nuxt Minimal Starter

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
