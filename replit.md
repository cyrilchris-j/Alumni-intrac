# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Application: NEXORA Alumni Network

A React + Vite alumni management platform with Firebase auth and Firestore.

### Features
- Role-based authentication (Student, Alumni, Admin) via Firebase
- Google Sign-In support
- Alumni directory with search and filtering
- Job & internship portal
- Mentorship connections
- Admin dashboards for managing alumni, students, events, and donations

### Architecture
- **Frontend**: `artifacts/nexora-alumni/` — React + Vite app (served at `/`)
- **Auth**: Firebase Auth (email/password + Google) — project `onestopalumni`
- **Database**: Firebase Firestore (user profiles, role data)
- **API Server**: `artifacts/api-server/` — Express 5 backend (served at `/api`)

### Routes
- `/` — Entry page (login/signup)
- `/student/*` — Student dashboard (overview, find alumni, jobs, mentorship, webinars)
- `/alumni/*` — Alumni dashboard (overview, profile, connections, jobs, mentorship, stories)
- `/admin/*` — Admin dashboard (overview, alumni directory, students, jobs, events, donations)

### Firebase Config
- Project: `onestopalumni`
- Auth domain: `onestopalumni.firebaseapp.com`
- Config is hardcoded in `artifacts/nexora-alumni/src/services/firebase.js`
