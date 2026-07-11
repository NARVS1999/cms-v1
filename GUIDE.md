# Product Requirements Document (PRD)
## MVP Content Management System (CMS)

**Project:** CMS (Content Management System)  
**Version:** 1.0 (MVP)  
**Date:** [Current Date]  
**Authors:** [Your Name/Team]

---

## 1. Introduction

### 1.1 Purpose
This document outlines the requirements for a Minimum Viable Product (MVP) of a Content Management System (CMS). The CMS is designed to be a self‑hosted, lightweight solution that can be developed locally with zero licensing costs, using **Laravel** (backend), **Next.js** (frontend admin panel), and **MySQL** (database). It targets individuals, small teams, and developers who need a simple yet extensible platform to manage digital content. The admin interface is built with **shadcn/ui** (component library) and Tailwind CSS, ensuring a modern, accessible, and responsive UI.

### 1.2 Scope
The MVP will include:
- User authentication and basic role‑based access (Admin / Editor).
- CRUD operations for content items (pages/posts).
- Media management (upload, list, delete images and documents).
- A clean, responsive admin dashboard.
- A RESTful API to serve content to any frontend (the Next.js admin consumes this API).
- Fully local development environment with simple setup instructions.

Out of scope for MVP:
- Multi‑language support.
- Advanced user management (invitations, password reset via email – only basic reset).
- Content versioning or revision history.
- Categories, tags, or custom fields.
- Public frontend (the CMS provides an API; a separate Next.js frontend can be built later).

### 1.3 Definitions / Acronyms
- **MVP:** Minimum Viable Product.
- **CMS:** Content Management System.
- **API:** Application Programming Interface (RESTful).
- **CRUD:** Create, Read, Update, Delete.
- **Admin:** User with full rights (manage content, media, and users).
- **Editor:** User with rights to create/edit content but not delete or manage users.

---

## 2. Project Overview

### 2.1 Objectives
- Deliver a functional CMS that can be set up and run on a local machine in under 10 minutes.
- Use only free, open‑source tools (Laravel, Next.js, MySQL, Composer, NPM, shadcn/ui).
- Provide a clean, intuitive admin interface for non‑technical content managers.
- Expose a well‑documented API to allow integration with any frontend.
- Ensure the codebase is modular and follows best practices for future enhancements.

### 2.2 Target Users
- **Administrators:** Manage the entire system – users, content, and media.
- **Editors:** Create, edit, and publish content; upload media; but cannot delete users or perform administrative tasks.
- **Developers:** Set up, extend, or deploy the CMS locally or on a server.

---

## 3. User Stories (Epics)

| ID  | As a…       | I want to…                                            | So that…                                                   |
|-----|-------------|-------------------------------------------------------|------------------------------------------------------------|
| US1 | Administrator | Log in securely with email and password.             | I can access the admin dashboard.                          |
| US2 | Administrator | View a dashboard with key metrics.                   | I get an overview of content and system status.            |
| US3 | Administrator | Create, edit, and delete content posts/pages.        | I can manage the website’s content.                        |
| US4 | Administrator | Upload, view, and delete media files.                | I can manage images and documents used in content.         |
| US5 | Administrator | See a list of all content with status (draft/published). | I can quickly find and act on content.                     |
| US6 | Editor       | Log in with limited permissions.                     | I can contribute content without risking system settings.  |
| US7 | Editor       | Create and edit content, but not delete it.          | I can help produce content under admin supervision.        |
| US8 | Any user     | Have a responsive admin interface.                   | I can manage content from any device.                      |
| US9 | Developer    | Set up the project locally with a single command.    | I can start development quickly.                           |

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization
- **Login:** Email and password authentication (via Laravel Sanctum or JWT).
- **Logout:** Invalidate the current token/session.
- **User Roles:** `admin` and `editor` stored in `users.role`.
  - **Admin:** Full access to all resources.
  - **Editor:** Can create, edit, and publish content; can upload media; cannot delete content or users.
- **Protected Routes:** All admin routes require authentication; API endpoints are protected by token.

### 4.2 Content Management
- **Model:** `Post` with fields:
  - `id` (auto‑increment)
  - `title` (string, required)
  - `slug` (string, unique, auto‑generated from title or editable)
  - `content` (long text, rich HTML – can be stored as raw or sanitised)
  - `status` (enum: `draft`, `published`)
  - `featured_image` (nullable, foreign key to `media.id` or stored path)
  - `meta_description` (string, nullable)
  - `published_at` (timestamp, nullable – if status is published, set to now)
  - `created_by` (foreign key to `users.id`)
  - `updated_by` (foreign key to `users.id`)
  - `created_at`, `updated_at`
- **Operations:**
  - List all posts with pagination, filtering by status and search by title.
  - Create a new post (title, slug, content, status, featured image, meta description).
  - Edit an existing post.
  - Delete a post (soft‑delete is optional; for MVP, hard delete is acceptable, but we’ll use soft‑delete for safety).
  - Publish/Unpublish (toggle status).

### 4.3 Media Management
- **Model:** `Media` with fields:
  - `id`
  - `file_name` (original filename)
  - `file_path` (storage path, e.g., `uploads/images/...`)
  - `mime_type`
  - `size` (in bytes)
  - `alt_text` (nullable)
  - `uploaded_by` (foreign key to `users.id`)
  - `created_at`, `updated_at`
- **Operations:**
  - Upload a file (validation: max size 5MB, allowed types: jpg, png, gif, svg, pdf, docx).
  - List all media with thumbnails.
  - Delete a media file (also remove from disk).

### 4.4 Dashboard
- **Metrics:** Total posts, published posts, draft posts, total media count.
- **Recent Activity:** List of recently created/updated posts.

### 4.5 API Endpoints (RESTful)
All endpoints return JSON and are prefixed with `/api`. Authentication is required for all except login.

| Method | Endpoint                | Description                           | Permissions          |
|--------|-------------------------|---------------------------------------|----------------------|
| POST   | `/api/login`            | Authenticate user, return token.      | Public               |
| POST   | `/api/logout`           | Invalidate token.                     | Authenticated        |
| GET    | `/api/user`             | Get authenticated user info.          | Authenticated        |
| GET    | `/api/dashboard/stats`  | Get dashboard statistics.             | Admin / Editor       |
| GET    | `/api/posts`            | List posts (paginated, filterable).   | Admin / Editor       |
| POST   | `/api/posts`            | Create a new post.                    | Admin / Editor       |
| GET    | `/api/posts/{id}`       | Get a single post.                    | Admin / Editor       |
| PUT    | `/api/posts/{id}`       | Update a post.                        | Admin / Editor       |
| DELETE | `/api/posts/{id}`       | Delete a post.                        | Admin only           |
| GET    | `/api/media`            | List media files (paginated).         | Admin / Editor       |
| POST   | `/api/media`            | Upload a media file.                  | Admin / Editor       |
| DELETE | `/api/media/{id}`       | Delete a media file.                  | Admin only           |

**Note:** Editor cannot delete content or media; these endpoints will return a 403 Forbidden if attempted by an editor.

---

## 5. Non‑Functional Requirements

### 5.1 Security
- Passwords hashed using Laravel’s `bcrypt`.
- API tokens (Sanctum) expire after a configurable time.
- All inputs validated and sanitised; XSS protection (e.g., HTML Purifier for content).
- File uploads validated by MIME type and size; stored outside public root.
- CORS configured for local development (adjustable for production).

### 5.2 Performance
- Admin panel should load within 2 seconds on a local machine.
- API responses should be under 200ms for typical requests.
- Use database indexes on `slug`, `status`, `created_at`.

### 5.3 Usability
- Responsive design using Tailwind CSS and shadcn/ui components.
- Intuitive navigation with a sidebar (using shadcn’s sidebar or custom).
- Form validation with clear error messages (using react-hook-form and zod).
- Rich text editor (e.g., TipTap or Editor.js) for content editing.

### 5.4 Local Development Friendliness
- **Zero Cost:** All tools and libraries are free and open‑source.
- **Simple Setup:**
  - Provide `.env.example` with default values.
  - Database seeding with faker data for testing.
  - Docker‑based environment (Laravel Sail) or manual instructions.
  - One‑click setup via Composer and NPM scripts (e.g., `composer install && npm install && php artisan migrate --seed`).
- **Hot‑Reload:** Next.js dev server supports Fast Refresh for quick frontend development.
- **Logging:** Detailed logs for debugging (Laravel log, browser console).

### 5.5 Maintainability
- Follow PSR‑12 coding standards for PHP.
- Use React functional components with hooks, and TypeScript (optional but recommended).
- Document key components and API endpoints (Swagger/OpenAPI optional but recommended).

---

## 6. Technical Stack

| Layer        | Technology                                      | Version (latest LTS where applicable) |
|--------------|-------------------------------------------------|---------------------------------------|
| Backend      | Laravel                                         | 10.x (or 11.x)                        |
| Frontend     | Next.js (React)                                 | 14.x (App Router)                     |
| Database     | MySQL                                           | 8.0 or MariaDB                        |
| API Auth     | Laravel Sanctum (token‑based)                   | ~                                     |
| Media Storage| Laravel Filesystem (local disk for MVP)         | ~                                     |
| Rich Editor  | TipTap (headless) or Editor.js                  | Latest                                |
| CSS Framework| Tailwind CSS                                    | 3.x                                   |
| UI Library   | shadcn/ui (Radix UI primitives + Tailwind)      | Latest                                |
| Icons        | Lucide React (or Font Awesome)                  | Latest                                |
| HTTP Client  | Axios (frontend)                                | Latest                                |
| Dev Environment| Laravel Sail (Docker) or Homestead            | ~                                     |
| Package Manager | Composer (PHP), NPM (Node)                  | ~                                     |

---

## 7. System Architecture

The CMS follows a **headless** approach:
- **Backend (Laravel):** Exposes a RESTful API and serves as the data layer. It handles authentication, business logic, and database interactions.
- **Frontend (Next.js):** A server‑side rendered (or static) application that consumes the API. The admin panel is built with Next.js and uses the App Router. It can be run as a standalone SPA or with SSR – for MVP, we can use the client‑side approach with API calls, but Next.js offers flexibility.
- **Database (MySQL):** Stores users, posts, and media data.

```
[Browser] → (Next.js App) → (API calls) → [Laravel API] → [MySQL]
                 ↑
                 └─── (SSR optional) ──┘
```
- All API responses are JSON.
- Authentication via Bearer token stored in localStorage or cookies (Next.js can handle cookies for SSR).

**Directory Structure (simplified):**
```
project-root/
├── backend/          # Laravel application
│   ├── app/
│   ├── database/
│   ├── routes/api.php
│   └── ...
├── frontend/         # Next.js application
│   ├── app/          # App Router
│   ├── components/   # shadcn/ui components
│   ├── lib/          # utilities, API client
│   └── ...
└── docker-compose.yml (optional)
```

---

## 8. Data Model

### 8.1 Users Table
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor') DEFAULT 'editor',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### 8.2 Posts Table
```sql
CREATE TABLE posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content LONGTEXT NOT NULL,
    status ENUM('draft', 'published') DEFAULT 'draft',
    featured_image_id BIGINT UNSIGNED NULL,   -- foreign key to media
    meta_description VARCHAR(255) NULL,
    published_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NOT NULL,      -- users.id
    updated_by BIGINT UNSIGNED NOT NULL,      -- users.id
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,                -- soft delete
    FOREIGN KEY (featured_image_id) REFERENCES media(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### 8.3 Media Table
```sql
CREATE TABLE media (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT UNSIGNED NOT NULL,
    alt_text VARCHAR(255) NULL,
    uploaded_by BIGINT UNSIGNED NOT NULL,      -- users.id
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

### 8.4 Personal Access Tokens (Sanctum)
Laravel Sanctum will create its own `personal_access_tokens` table.

---

## 9. API Endpoints (Detailed)

All endpoints return JSON. A successful response typically includes `data`, `message`, and status code. Error responses follow Laravel’s validation format.

**Example Request (Login):**
```
POST /api/login
{
  "email": "admin@example.com",
  "password": "password"
}
```
**Response:**
```json
{
  "token": "1|abcdef...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Example Request (Create Post):**
```
POST /api/posts
Authorization: Bearer {token}
{
  "title": "My First Post",
  "slug": "my-first-post",
  "content": "<p>Hello world</p>",
  "status": "draft",
  "featured_image_id": 5,
  "meta_description": "A short description"
}
```

**List Posts (with filters):**
```
GET /api/posts?status=published&search=hello&page=1
```

**Upload Media:**
```
POST /api/media
Content-Type: multipart/form-data
{
  "file": <binary>,
  "alt_text": "Image description"
}
```

**Dashboard Stats:**
```
GET /api/dashboard/stats
Response:
{
  "total_posts": 42,
  "published_posts": 30,
  "draft_posts": 12,
  "total_media": 18
}
```

---

## 10. UI/UX Considerations

### 10.1 Admin Layout
- **Sidebar** with navigation links (Dashboard, Posts, Media, Profile, Logout). Uses shadcn/ui components like `Button`, `NavigationMenu`, or custom sidebar.
- **Top Bar** with user avatar and name (using shadcn `Avatar`).

### 10.2 Pages
- **Login Page:** Centered card with email, password, and login button (using shadcn `Card`, `Input`, `Button`).
- **Dashboard:** Stats cards (shadcn `Card` with icons) and recent activity list.
- **Posts List:** Table with columns: Title, Status, Published At, Actions (Edit, Delete). Filters and search above the table (shadcn `Table`, `Input`, `Select`).
- **Post Edit/Create:** Form with fields: Title, Slug (auto‑generated), Content (rich text editor), Status (toggle), Featured Image (select from media library or upload), Meta Description, Publish Date (optional). Use shadcn `Form` with react-hook-form and zod validation.
- **Media Library:** Grid of thumbnails, with upload button (shadcn `Dialog`) and delete option.

### 10.3 Responsiveness
- Use Tailwind’s responsive utilities to stack sidebar (hamburger menu on mobile) and adapt tables to cards.

### 10.4 Notifications
- Toast notifications (e.g., `sonner` or `react-hot-toast`) for success/error messages after API calls.

---

## 11. Development Setup (Local)

### 11.1 Prerequisites
- PHP ≥ 8.1, Composer, Node.js ≥ 18, NPM, MySQL.
- Or Docker with Laravel Sail (recommended for consistency).

### 11.2 Steps
1. **Clone** the repository.
2. **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with database credentials
   composer install
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```
   The API runs at `http://localhost:8000`.
3. **Frontend:**
   ```bash
   cd frontend
   cp .env.example .env
   # Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   npm install
   npm run dev
   ```
   The admin panel runs at `http://localhost:3000`.
4. **Database:** Run MySQL and create a database named `cms_db`.
5. **Default User:** The seeder creates an admin account:
   - Email: `admin@example.com`
   - Password: `password`
   - And an editor account: `editor@example.com` / `password`.

### 11.3 Alternative with Docker (Laravel Sail)
- Run `./vendor/bin/sail up -d` in the backend folder.
- Then `./vendor/bin/sail artisan migrate --seed`.
- The frontend can still run with `npm run dev` outside the container.

---

## 12. Testing (Recommended for MVP)

- **PHPUnit** for backend: test authentication, CRUD operations, and permissions.
- **Cypress** or **Vitest** for frontend: test UI components and API integration.

---

## 13. Future Enhancements (Post‑MVP)

- User management (create/delete users, change roles).
- Granular permissions using a policy system.
- Content revisions and audit logs.
- Categories, tags, and custom fields.
- Public REST API for content consumption.
- GraphQL support (optional).
- Multi‑language/translation support.
- Deployment scripts for production (e.g., Forge, Vercel for Next.js, Laravel Forge).
- SEO meta tags automatically generated.
- Webhooks for content updates.

---

## Appendix A: Sample `.env` Files

**Backend `.env` (excerpt):**
```
APP_NAME=CMS
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cms_db
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DRIVER=file
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

---

## Appendix B: Acceptance Criteria (Sample)

- Admin can log in and see the dashboard.
- Admin can create a post with all fields and it appears in the list.
- Admin can edit and delete a post.
- Editor can log in but sees no user management options.
- Editor can create and edit posts but delete button is disabled/hidden.
- Media upload works and displays in the library.
- Deleting media also removes the file from storage.
- All API endpoints return proper HTTP status codes.

---

*End of PRD*