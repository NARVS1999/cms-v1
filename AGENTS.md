# CMS v1 — Agent Guide

## Project Structure

Monorepo with two apps:

```
cms-v1/
├── backend/          # Laravel 12 API (PHP 8.2+)
├── frontend/         # Next.js 16 admin + public blog (React 19)
├── GUIDE.md          # Original PRD / product requirements
├── .scratch/         # Working docs (PRD, etc.)
├── implement/        # Implement skill
├── to-prd/           # PRD generation skill
└── tdd/              # TDD skill
```

## Quick Start

**Backend** (port 8000):
```bash
cd backend
php artisan migrate --seed   # DB: cms_db on MySQL (XAMPP, root/, no password)
php artisan serve --port=8000
php artisan storage:link     # Required for media uploads
```

**Frontend** (port 3000):
```bash
cd frontend
npm install
npm run dev
```

**Default users:** `admin@example.com` / `password`, `editor@example.com` / `password`

## Tech Stack — Key Versions

| Layer | Version | Gotcha |
|-------|---------|--------|
| Next.js | **16.2.10** | Check `node_modules/next/dist/docs/` before writing Next.js code — breaking changes from prior versions |
| React | **19.2.4** | |
| Tailwind CSS | **v4** | **No `tailwind.config.js`** — config is CSS-first in `app/globals.css` via `@theme` |
| shadcn/ui | **v4 (base-nova)** | Uses `@base-ui/react` not Radix. Config in `components.json` |
| Laravel | **12.x** | Slim bootstrap in `bootstrap/app.php`, no kernel class |
| Sanctum | **4.3** | Bearer token auth (personal access tokens), NOT cookie/SPA auth |

## Architecture

- **Backend** exposes RESTful JSON API at `http://localhost:8000/api`
- **Frontend** consumes the API via `lib/api.ts` (singleton `ApiClient` class)
- Auth: Sanctum personal access tokens stored in `localStorage` as `auth_token`
- Public blog pages (`/` and `/blog/[slug]`) don't require login
- Admin pages use `<AdminLayout>` which redirects to `/login` if unauthenticated

## API Routes

**Public:** `POST /api/login`, `GET /api/public/posts`, `GET /api/public/posts/{slug}`
**Protected (Bearer token):** Everything else — logout, user, dashboard, posts CRUD, media CRUD

## Critical Gotchas

### Do NOT use `statefulApi()` with Bearer tokens
In `bootstrap/app.php`, `$middleware->statefulApi()` adds CSRF/session middleware that breaks Bearer token uploads. It was removed intentionally. Only use CORS middleware on the API stack.

### Tailwind v4 has no config file
Theme is defined in `frontend/app/globals.css` using `@theme inline { ... }` with oklch colors. Don't look for `tailwind.config.ts`.

### shadcn/ui components
Style: `base-nova`, base color: `neutral`. Components in `frontend/components/ui/`. Add new ones via `npx shadcn@latest add <component>`.

### lucide-react icons
**No `Github` icon** — use `Globe` or another available icon. Check lucide-react docs before importing.

### Media file paths
Backend returns relative paths like `/storage/uploads/filename.jpg`. Use `getMediaUrl()` from `lib/api.ts` to build full URLs: `http://localhost:8000/storage/uploads/...`. Requires `php artisan storage:link`.

### MySQL
XAMPP MySQL: `C:/xampp/mysql/bin/mysql.exe -u root`. Database: `cms_db`. No password.

### CORS
Config: `backend/config/cors.php`. Allowed origin: `http://localhost:3000`. Credentials: true.

## Frontend File Conventions

- All admin pages use `'use client'` and wrap in `<AdminLayout>`
- Public pages (`/`, `/blog/[slug]`) are client components but don't use AdminLayout
- API client: `frontend/lib/api.ts` — types exported alongside methods
- Auth state: `frontend/lib/auth-context.tsx` — `useAuth()` hook
- Path alias: `@/*` maps to project root

## Running Lint/Typecheck

```bash
cd frontend && npm run lint    # ESLint
cd frontend && npm run build   # TypeScript check + build (catches type errors)
```

No PHP linting configured. Backend follows PSR-12 by convention.
