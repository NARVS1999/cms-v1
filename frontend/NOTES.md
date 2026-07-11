# Prototype Notes

## Question Being Answered

**"What should the admin panel look like?"**

This prototype explores 6 pages with 3 structurally different UI variations each, allowing visual comparison before committing to a design direction.

## Prototype Structure

- **Location:** `frontend/app/prototype/`
- **Run command:** `npm run prototype` (from `frontend/`)
- **URL:** `http://localhost:3000`

## Pages & Variants

### 1. Dashboard (`/prototype/dashboard`)
| Variant | Layout | Key Features |
|---------|--------|--------------|
| A | Stat Cards Grid | 4 equal stat cards + recent activity list with sidebar |
| B | Metrics Column | Trend indicators + quick actions panel with top nav |
| C | Bento Grid | Mixed card sizes + quick stats sidebar |

### 2. Posts List (`/prototype/posts`)
| Variant | Layout | Key Features |
|---------|--------|--------------|
| A | Full-width Table | Traditional table with inline actions + sidebar |
| B | Card Grid | Card-based layout with thumbnails + top nav |
| C | Kanban Board | Drag-drop columns (Draft/Published/Archived) + sidebar |

### 3. Post Editor (`/prototype/posts/new`)
| Variant | Layout | Key Features |
|---------|--------|--------------|
| A | Two Column | Editor + settings sidebar with sidebar nav |
| B | Single Column | Linear form with floating toolbar + top nav |
| C | Split Preview | Edit + live preview side-by-side with sidebar nav |

### 4. Media Library (`/prototype/media`)
| Variant | Layout | Key Features |
|---------|--------|--------------|
| A | Thumbnail Grid | Grid with hover actions + sidebar nav |
| B | List View | Table with details + top nav |
| C | Masonry Layout | Pinterest-style columns + sidebar nav |

### 5. Login Page (`/prototype/login`)
| Variant | Layout | Key Features |
|---------|--------|--------------|
| A | Centered Card | Traditional centered form with gradient background |
| B | Split Layout | Left branding panel + right form |
| C | Minimal Float | Floating card with glassmorphism + demo credentials |

## Variant Switcher

- **Component:** `components/prototype-switcher.tsx`
- **Behavior:** Floating bottom bar, keyboard arrows (←/→), URL search param `?variant=`
- **Hidden in production:** Gated by `NODE_ENV` check

## Mock Data

- **Location:** `lib/mock-data.ts`
- **Users:** 2 (admin, editor)
- **Posts:** 8 (5 published, 3 drafts)
- **Media:** 6 files (various types/sizes)

## Pending Decision

**Which variant(s) should be promoted to production?**

Fill in the verdict below after reviewing the prototype:

- [ ] Dashboard: Variant ___
- [ ] Posts List: Variant ___
- [ ] Post Editor: Variant ___
- [ ] Media Library: Variant ___
- [ ] Login Page: Variant ___

## Next Steps

1. Review each page with `?variant=A`, `?variant=B`, `?variant=C`
2. Note which elements from each variant work best
3. Mix and match: take the header from B, the sidebar from C, etc.
4. Delete losing variants and fold winner into real code
5. Delete this prototype directory

---

*Prototype created: 2026-07-12*
*Question: "What should the admin panel look like?"*
*Status: variant=C*
