# PRD: CMS MVP

**Status:** ready-for-agent
**Created:** 2026-07-12
**Source:** GUIDE.md (original PRD)

---

## Problem Statement

Content creators, small teams, and developers need a self-hosted, lightweight content management system that can be set up locally in under 10 minutes with zero licensing costs. Existing solutions are either too complex (WordPress, Drupal), too expensive (hosted CMS platforms), or lack essential features (static site generators). The core problem is: **there is no simple, free, extensible CMS that non-technical users can operate and developers can customize.**

## Solution

Build a headless CMS with:
- **Backend:** Laravel 10/11 exposing a RESTful API with Sanctum token auth
- **Frontend:** Next.js 14 admin panel using shadcn/ui + Tailwind CSS
- **Database:** MySQL 8.0 for persistent storage

The system provides a clean admin interface for content management (posts, media) with role-based access (Admin/Editor), while exposing an API that any frontend can consume.

## User Stories

### Authentication & Session

1. As an Administrator, I want to log in with email and password, so that I can access the admin dashboard
2. As an Editor, I want to log in with limited permissions, so that I can contribute content without risking system settings
3. As any user, I want to log out securely, so that my session is invalidated
4. As an authenticated user, I want to see my profile info in the top bar, so that I know who I'm logged in as

### Dashboard

5. As an Administrator, I want to see total posts count, so that I can gauge content volume
6. As an Administrator, I want to see published vs draft post counts, so that I can track publishing progress
7. As an Administrator, I want to see total media count, so that I can monitor storage usage
8. As an Administrator, I want to see recent activity (recently created/updated posts), so that I can stay informed about team work

### Posts Management

9. As an Administrator, I want to create a new post with title, slug, content, status, featured image, and meta description, so that I can publish content
10. As an Editor, I want to create a new post, so that I can contribute content
11. As an Administrator, I want to edit an existing post, so that I can update content
12. As an Editor, I want to edit an existing post, so that I can fix errors or add information
13. As an Administrator, I want to delete a post, so that I can remove unwanted content
14. As an Administrator, I want to publish/unpublish a post (toggle status), so that I can control content visibility
15. As an Editor, I want to save posts as drafts, so that I can work on content before publishing
16. As any user, I want to see a list of all posts with pagination, so that I can browse content
17. As any user, I want to filter posts by status (draft/published), so that I can find specific content
18. As any user, I want to search posts by title, so that I can locate specific content quickly
19. As a user, I want the slug to auto-generate from the title, so that I don't have to manually create URLs
20. As a user, I want to set a featured image from the media library, so that posts have visual appeal
21. As a user, I want to add meta descriptions, so that content is SEO-friendly

### Media Management

22. As an Administrator, I want to upload images and documents, so that I can use them in content
23. As an Editor, I want to upload media files, so that I can attach them to posts
24. As any user, I want to see a grid/list of all media with thumbnails, so that I can browse my library
25. As an Administrator, I want to delete a media file, so that I can remove unused assets
26. As a user, I want file validation (max 5MB, allowed types: jpg, png, gif, svg, pdf, docx), so that the system stays clean
27. As a user, I want alt text on media, so that images are accessible

### Roles & Permissions

28. As an Administrator, I want full access to all resources (create, read, update, delete), so that I can manage the entire system
29. As an Editor, I want to create and edit content, so that I can contribute
30. As an Editor, I want to upload media, so that I can use assets in my posts
31. As an Editor, I should NOT be able to delete content or users, so that critical data is protected
32. As an Administrator, I want only admins to delete posts, so that content isn't accidentally removed
33. As an Administrator, I want only admins to delete media, so that assets aren't accidentally removed

### UI/UX

34. As any user, I want a responsive admin interface, so that I can manage content from any device
35. As a user, I want a sidebar navigation with links to Dashboard, Posts, Media, so that I can navigate easily
36. As a user, I want form validation with clear error messages, so that I know what to fix
37. As a user, I want toast notifications for success/error after actions, so that I get feedback
38. As a user, I want a rich text editor for post content, so that I can format text easily

### Developer Experience

39. As a developer, I want to set up the project locally with simple commands, so that I can start development quickly
40. As a developer, I want a `.env.example` with default values, so that configuration is straightforward
41. As a developer, I want database seeding with faker data, so that I can test without manual data entry
42. As a developer, I want hot-reload in the frontend, so that I can iterate quickly

## Implementation Decisions

### Modules to Build/Modify

1. **Auth Module** — Laravel Sanctum token-based authentication
   - Login endpoint returns Bearer token
   - Token stored in frontend (localStorage or cookies)
   - All API routes protected except `/api/login`

2. **Posts Module** — CRUD operations with soft-delete
   - Model: `Post` with fields: id, title, slug, content, status (draft/published), featured_image_id, meta_description, published_at, created_by, updated_by, timestamps, deleted_at
   - Soft-delete enabled for safety
   - Slug auto-generated from title, unique

3. **Media Module** — File upload and management
   - Model: `Media` with fields: id, file_name, file_path, mime_type, size, alt_text, uploaded_by, timestamps
   - Storage: Laravel Filesystem (local disk for MVP)
   - Validation: max 5MB, types: jpg, png, gif, svg, pdf, docx

4. **Dashboard Module** — Stats aggregation
   - Single endpoint returning: total_posts, published_posts, draft_posts, total_media
   - Recent activity: last 10 posts with created/updated timestamps

### Schema Changes

**users table:**
- `role` ENUM('admin', 'editor') DEFAULT 'editor'

**posts table:**
- `featured_image_id` FK to media(id) ON DELETE SET NULL
- `created_by` FK to users(id)
- `updated_by` FK to users(id)
- `deleted_at` TIMESTAMP for soft-delete

**media table:**
- `uploaded_by` FK to users(id)

### API Contracts

All endpoints return JSON, prefixed with `/api`:

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| POST | `/api/login` | Authenticate, return token | Public |
| POST | `/api/logout` | Invalidate token | Authenticated |
| GET | `/api/user` | Get authenticated user | Authenticated |
| GET | `/api/dashboard/stats` | Get dashboard stats | Admin/Editor |
| GET | `/api/posts` | List posts (paginated, filterable) | Admin/Editor |
| POST | `/api/posts` | Create post | Admin/Editor |
| GET | `/api/posts/{id}` | Get single post | Admin/Editor |
| PUT | `/api/posts/{id}` | Update post | Admin/Editor |
| DELETE | `/api/posts/{id}` | Delete post | Admin only |
| GET | `/api/media` | List media (paginated) | Admin/Editor |
| POST | `/api/media` | Upload media | Admin/Editor |
| DELETE | `/api/media/{id}` | Delete media | Admin only |

### Specific Interactions

- Editor attempting DELETE returns 403 Forbidden
- Post slug auto-generation: slugify title, check uniqueness, append suffix if needed
- Media upload: validate MIME type and size before storing outside public root
- Dashboard stats: computed on-demand (no caching for MVP)

### UI Decisions (Pending Prototype Review)

- **Component Library:** shadcn/ui (Radix UI primitives + Tailwind)
- **Icons:** Lucide React
- **Rich Text:** TipTap or Editor.js (headless)
- **Forms:** react-hook-form + zod validation
- **Toasts:** sonner or react-hot-toast
- **Layout:** Sidebar navigation (shadcn sidebar or custom)
- **Responsive:** Tailwind breakpoints, hamburger menu on mobile

> **Note:** A prototype exists at `frontend/app/prototype/` with 5 pages × 3 UI variants each. Awaiting variant selection before finalizing UI implementation decisions.

## Testing Decisions

### What Makes a Good Test

- Test external behavior (API responses, UI state) not implementation details
- Each test should be independent and idempotent
- Use realistic data, not mocked internals
- Test the happy path AND error cases (401, 403, 404, 422 validation)

### Modules to Test

1. **Auth Module (PHPUnit)**
   - Login with valid credentials returns token
   - Login with invalid credentials returns 401
   - Protected routes return 401 without token
   - Logout invalidates token

2. **Posts Module (PHPUnit)**
   - Admin can create, read, update, delete posts
   - Editor can create and edit but NOT delete
   - Posts filterable by status, searchable by title
   - Pagination works correctly
   - Slug uniqueness enforced
   - Soft-deleted posts not returned in list

3. **Media Module (PHPUnit)**
   - Upload valid file succeeds
   - Upload oversized file fails (422)
   - Upload invalid MIME type fails (422)
   - Admin can delete media, Editor cannot
   - Deleted file removed from disk

4. **Dashboard Module (PHPUnit)**
   - Stats endpoint returns correct counts
   - Works with empty database

5. **Frontend (Cypress/Vitest)**
   - Login flow works end-to-end
   - Posts CRUD operations in UI
   - Media upload and display
   - Responsive layout on mobile viewport
   - Form validation displays errors

### Prior Art

- Laravel's default PHPUnit setup with `RefreshDatabase` trait
- Cypress E2E testing patterns for Next.js
- Vitest for component testing with React Testing Library

## Out of Scope

### MVP Exclusions

- Multi-language / translation support
- Advanced user management (invitations, email-based password reset)
- Content versioning or revision history
- Categories, tags, or custom fields
- Public frontend (CMS is API-only; separate frontend built later)
- User management UI (create/delete users, change roles)
- Granular permissions beyond admin/editor
- Content revisions and audit logs
- GraphQL API
- Deployment scripts for production
- SEO auto-generated meta tags
- Webhooks for content updates
- Caching layer (stats computed on-demand)

## Further Notes

### Development Setup

**Prerequisites:** PHP ≥ 8.1, Composer, Node.js ≥ 18, NPM, MySQL (or Docker with Laravel Sail)

**Backend:**
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve  # Runs at http://localhost:8000
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
npm install
npm run dev  # Runs at http://localhost:3000
```

**Default Users (from seeder):**
- Admin: `admin@example.com` / `password`
- Editor: `editor@example.com` / `password`

### Future Enhancements (Post-MVP)

- User management (create/delete users, change roles)
- Granular permissions using policy system
- Content revisions and audit logs
- Categories, tags, custom fields
- Public REST API for content consumption
- GraphQL support
- Multi-language/translation support
- Production deployment scripts (Forge, Vercel)
- SEO meta tags auto-generation
- Webhooks for content updates

### Security Considerations

- Passwords hashed with bcrypt
- API tokens (Sanctum) expire after configurable time
- All inputs validated and sanitized; XSS protection
- File uploads validated by MIME type and size; stored outside public root
- CORS configured for local development

---

*Generated from GUIDE.md using to-prd skill*
*Issue tracker: .scratch/cms-mvp/PRD.md*
*Triage label: ready-for-agent*
