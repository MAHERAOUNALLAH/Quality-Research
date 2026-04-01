# PROJECT HANDOFF — Quality & Research Next.js Website
*Generated after full implementation pass. Paste this into the next AI session to continue exactly.*

---

## WHAT WAS COMPLETED

### 1. Seed Integration ✅
- `app/api/seed/route.ts` — Full seed via HTTP: `GET /api/seed` (skips if data exists) or `GET /api/seed?force=1` (always re-seeds)
- `scripts/seed.ts` — Standalone Node/ts-node script for local seeding
- `package.json` — `npm run seed` script added
- Strategy: `deleteMany({})` on all collections, then `insertMany`. Clean slate each run.
- Seed fills 12 collections: users, categories, articles, events, calls, projects, reports, resources, partners, teamMembers, formations (added), messages

### 2. Team — Dynamic + Admin ✅
- `lib/models/TeamMember.ts` — TypeScript model + collection helper
- `app/api/team/route.ts` — GET (list), POST (create)
- `app/api/team/[id]/route.ts` — PUT (update), DELETE
- `app/about/team/page.tsx` — Server component reading from MongoDB, shows avatar initials or photo, bio, email
- `app/admin/team/page.tsx` — Full CRUD: list, add, edit, delete, active/inactive toggle

### 3. Partners — Dynamic + Admin ✅
- `lib/models/Partner.ts`
- `app/api/partners/route.ts` + `[id]/route.ts`
- `app/about/partners/page.tsx` — Server component, colored type badges, logo support, website link
- `app/admin/partners/page.tsx` — Full CRUD

### 4. Resources — Dynamic + Admin ✅
- `lib/models/Resource.ts`
- `app/api/resources/route.ts` + `[id]/route.ts`
- `app/school/page.tsx` — Replaced hardcoded page. Server component, grouped by category, type icons (PDF/DOCX/Link/Video), download/external links
- `app/admin/resources/page.tsx` — Full CRUD, type-aware URL field (fileUrl vs externalUrl)

### 5. Formations — Dynamic + Admin ✅ (NEW — was hardcoded)
- `app/api/formations/route.ts` + `[id]/route.ts`
- `app/news/formation/page.tsx` — Replaced fully hardcoded page with MongoDB-driven one
- `app/admin/formations/page.tsx` — Full CRUD with level/format selects

### 6. Article Detail Page ✅
- `app/api/articles/[id]/route.ts` — Added GET handler with category name population
- `app/news/articles/[id]/page.tsx` — Rich detail page: hero image, breadcrumb, category badge, date, formatted paragraphs, sidebar with share buttons + related articles + CTA
- `app/news/articles/page.tsx` — Cards are now `<Link>` clickable

### 7. Event Detail Page ✅
- `app/api/events/[id]/route.ts` — Added GET handler with category name population
- `app/news/events/[id]/page.tsx` — Rich detail page: date badge, upcoming/past state, location info, sidebar with register CTA + event info card + related events
- `app/news/events/page.tsx` — Cards are now `<Link>` clickable

### 8. Call Detail Page ✅
- `app/api/calls/[id]/route.ts` — NEW: GET, PUT, DELETE (was missing entirely)
- `app/news/appel-a-candidatures/[id]/page.tsx` — Rich detail page: open/closed badge, countdown days, deadline sidebar, apply CTA, related calls
- `app/news/appel-a-candidatures/page.tsx` — Cards are now `<Link>` clickable

### 9. Project Detail Page ✅
- `app/api/projects/[id]/route.ts` — NEW: GET, PUT, DELETE (was missing entirely)
- `app/projects/[id]/page.tsx` — Rich detail page: status badge with pulse, timeline, members list, related projects
- `app/projects/page.tsx` — Cards are now `<Link>` clickable (active + planned grouped together)

### 10. Reports [id] API ✅
- `app/api/reports/[id]/route.ts` — NEW: GET, PUT, DELETE (was missing)

### 11. Admin Layout ✅
- `app/admin/layout.tsx` — Rebuilt with proper nav including all new pages: Team, Partners, Resources, Formations
- Quick link to re-seed DB added in sidebar footer

---

## WHAT IS PARTIALLY COMPLETED

### Reports page ⚠️
- `app/reports/page.tsx` — Already dynamic and reads from MongoDB. Grouped by year. Download button functional.
- **Missing**: No `reports/[id]` detail page exists yet. The report card doesn't link anywhere. Reports are download-only for now (PDF link), which may be intentional.
- `app/admin/reports/page.tsx` — Uses the JSON CRUD editor (`AdminJsonCrudPage`), not a proper form. Works but not polished.

### Calls admin page ⚠️
- `app/admin/calls/page.tsx` — Uses JSON CRUD editor. Works but not a proper form like articles.

### Projects admin page ⚠️
- `app/admin/projects/page.tsx` — Uses JSON CRUD editor. Works but not a proper form.

### Formation detail page ⚠️
- Formation cards on `/news/formation` show an "S'inscrire" button that links to `/contact`. There is no `/news/formation/[id]` detail page yet. Formations don't have enough content to justify a detail page currently, but it can be added if needed.

---

## COLLECTIONS THAT NOW EXIST

| Collection    | Purpose                          |
|---------------|----------------------------------|
| users         | Admin/editor accounts            |
| categories    | Shared across articles & events  |
| articles      | News/blog posts                  |
| events        | Events/conferences               |
| calls         | Open calls (candidature, etc.)   |
| projects      | Research/collaboration projects  |
| reports       | Annual/financial reports         |
| messages      | Contact form submissions         |
| formations    | Training catalog                 |
| resources     | Downloads/links library          |
| partners      | Partner organizations            |
| teamMembers   | Association team                 |

---

## FIELDS PER COLLECTION

### users
```
_id, email, passwordHash, role (admin|editor|member), fullName, nom, prenom,
telephone, institution, isActive, createdAt, updatedAt
```

### categories
```
_id, nom, description, createdAt, updatedAt
```

### articles
```
_id, titre, contenu, excerpt, image, categoryId (ObjectId ref categories),
authorId (ObjectId ref users), published, publishedAt, createdAt, updatedAt
```

### events
```
_id, titre, description, date (Date), lieu, image,
categoryId (ObjectId ref categories), published, createdAt, updatedAt
```

### calls
```
_id, title, excerpt, content, type (candidature|participation|communication|projet|autre),
deadline (Date), link, isOpen (bool), createdAt, updatedAt
```

### projects
```
_id, title, description, excerpt, image,
status (active|planned|completed|archived),
startDate (Date), endDate (Date|null),
members (string[]), createdAt, updatedAt
```

### reports
```
_id, title, content, excerpt, type (activite|scientifique|financier|autre),
year (number), fileUrl, publishedAt (Date), createdAt, updatedAt
```

### messages
```
_id, name, email, subject, message, read (bool), createdAt
```

### formations
```
_id, title, description, duration, level, format, image, published, createdAt, updatedAt
```

### resources
```
_id, title, category, type (pdf|docx|link|video|autre),
fileUrl, externalUrl, size, published, createdAt, updatedAt
```

### partners
```
_id, name, type, country, logo, website, order (number), createdAt, updatedAt
```

### teamMembers
```
_id, name, role, specialty, bio, photo, email,
order (number), active (bool), createdAt, updatedAt
```

---

## API ROUTES THAT NOW EXIST

### Public (no auth required for GET)
```
GET  /api/articles            → list all articles (sorted by createdAt desc)
GET  /api/articles/[id]       → single article with categoryName populated
POST /api/articles            → create (admin only)
PUT  /api/articles/[id]       → update (admin only)
DELETE /api/articles/[id]     → delete (admin only)

GET  /api/events              → list all events (sorted by date desc)
GET  /api/events/[id]         → single event with categoryName populated
POST /api/events              → create (admin only)
PUT  /api/events/[id]         → update (admin only)
DELETE /api/events/[id]       → delete (admin only)

GET  /api/calls               → list all calls
GET  /api/calls/[id]          → single call
POST /api/calls               → create (admin only)
PUT  /api/calls/[id]          → update (admin only)
DELETE /api/calls/[id]        → delete (admin only)

GET  /api/projects            → list all projects
GET  /api/projects/[id]       → single project
POST /api/projects            → create (admin only)
PUT  /api/projects/[id]       → update (admin only)
DELETE /api/projects/[id]     → delete (admin only)

GET  /api/reports             → list all reports
GET  /api/reports/[id]        → single report
POST /api/reports             → create (admin only)
PUT  /api/reports/[id]        → update (admin only)
DELETE /api/reports/[id]      → delete (admin only)

GET  /api/team                → list all team members (sorted by order asc)
POST /api/team                → create (admin only)
PUT  /api/team/[id]           → update (admin only)
DELETE /api/team/[id]         → delete (admin only)

GET  /api/partners            → list all partners (sorted by order asc)
POST /api/partners            → create (admin only)
PUT  /api/partners/[id]       → update (admin only)
DELETE /api/partners/[id]     → delete (admin only)

GET  /api/resources           → list published resources only
POST /api/resources           → create (admin only)
PUT  /api/resources/[id]      → update (admin only)
DELETE /api/resources/[id]    → delete (admin only)

GET  /api/formations          → list published formations only
POST /api/formations          → create (admin only)
PUT  /api/formations/[id]     → update (admin only)
DELETE /api/formations/[id]   → delete (admin only)

GET  /api/categories          → list all categories
POST /api/categories          → create (admin only)
DELETE /api/categories/[id]   → delete (admin only)

GET  /api/seed                → seed if empty
GET  /api/seed?force=1        → always re-seed (destroys all data)

POST /api/contact             → submit contact message
GET  /api/contact             → list messages (admin only)
GET  /api/messages            → list messages (admin only)
GET  /api/admin/users         → list users (admin only)
GET  /api/health              → health check
POST /api/auth/login          → login
POST /api/auth/logout         → logout
POST /api/auth/register       → register
GET  /api/auth/me             → current user
```

---

## ADMIN PAGES THAT NOW EXIST

```
/admin                → Dashboard (users + messages overview)
/admin/categories     → Category CRUD
/admin/articles       → Article CRUD (proper form with category selector)
/admin/events         → Event CRUD (proper form)
/admin/messages       → Messages viewer
/admin/calls          → Calls CRUD (JSON editor — AdminJsonCrudPage)
/admin/projects       → Projects CRUD (JSON editor — AdminJsonCrudPage)
/admin/reports        → Reports CRUD (JSON editor — AdminJsonCrudPage)
/admin/team           → Team members CRUD (proper form) ← NEW
/admin/partners       → Partners CRUD (proper form) ← NEW
/admin/resources      → Resources CRUD (proper form) ← NEW
/admin/formations     → Formations CRUD (proper form) ← NEW
```

---

## DYNAMIC PUBLIC PAGES THAT NOW EXIST

```
/news/articles              → Article list (cards link to detail)
/news/articles/[id]         → Article detail page ← NEW
/news/events                → Event list (cards link to detail)
/news/events/[id]           → Event detail page ← NEW
/news/appel-a-candidatures  → Calls list (cards link to detail)
/news/appel-a-candidatures/[id] → Call detail page ← NEW
/news/formation             → Formations list (dynamic from DB) ← FIXED
/projects                   → Projects list (cards link to detail)
/projects/[id]              → Project detail page ← NEW
/reports                    → Reports list (dynamic from DB, grouped by year)
/about/team                 → Team members (dynamic from DB) ← FIXED
/about/partners             → Partners (dynamic from DB) ← FIXED
/school                     → Resources center (dynamic from DB) ← FIXED
```

---

## HOW THE SEED IS CONNECTED

1. The seed is invoked at `GET /api/seed?force=1` or locally via `npm run seed`
2. It connects directly to MongoDB using `getDb()` from `lib/mongodb.ts`
3. It deletes all documents from all 12 collections then inserts fresh sample data
4. The frontend pages all call their respective `/api/*` routes using `fetch()` with `cache: "no-store"` (SSR, no caching)
5. Admin pages use `fetch()` calls from the browser (client components) to the same API routes
6. Auth is handled by JWT cookie (`token`) verified via `requireAdmin()` in `lib/requireAdmin.ts`

---

## WHAT REMAINS TO BE DONE

### High Priority
1. **Report detail page** — Create `app/reports/[id]/page.tsx`. Report cards link to nowhere currently. Could show full content + download button.
2. **Admin: Calls/Projects/Reports** — Replace JSON editor (`AdminJsonCrudPage`) with proper forms like Articles has. The JSON editor works but is user-unfriendly.
3. **Password hashing** — The seeded `passwordHash` values are plaintext placeholders (`$2b$10$exampleHashedPasswordAdmin`). Real users can't log in with these. Need a proper password set or the register flow.

### Medium Priority
4. **Formation detail page** — `app/news/formation/[id]/page.tsx`. Currently formations link to `/contact`. Add if formations will have rich descriptions.
5. **Image upload** — All `image`, `photo`, `logo` fields accept URL strings only. No file upload UI. The admin forms have URL text fields as placeholders. A real image upload system (e.g. Next.js API route + local `public/uploads/`, or cloud storage) is needed.
6. **Admin resources** — The `/api/resources` GET only returns `published: true`. Admin needs to see all. Add a separate admin endpoint or a query param `?all=1` bypass.
7. **Article `published` field** — The Article model has `published` and `publishedAt` fields in the seed, but the articles API GET returns everything regardless. Add `{ published: true }` filter to public GET.
8. **Category population** — Articles and Events list pages show `categoryId` as a raw ObjectId string if it's not populated. The `/api/articles` GET doesn't populate categories. The detail pages use the populated `categoryName` from `/api/articles/[id]`, but list pages show raw IDs. Fix: do a `$lookup` aggregation or populate in the GET list handler.

### Low Priority
9. **Pagination** — All API list routes return all documents with no limit. Fine for now but needs pagination when content grows.
10. **SEO / metadata** — No `generateMetadata()` on detail pages. Add for production.
11. **404 pages** — `notFound()` is called correctly on detail pages. A custom `not-found.tsx` would improve UX.
12. **Admin dashboard stats** — The dashboard only counts users and messages. Could show counts for all collections.

---

## NEXT RECOMMENDED STEPS IN ORDER

1. Fix admin login: set a real password hash in the seed, or use the `/api/auth/register` route to create a working admin account
2. Create `app/reports/[id]/page.tsx` — it's a 10-minute copy/adapt from articles/[id]
3. Fix the articles and events list pages to populate category names (add `$lookup` to the GET handlers)
4. Replace AdminJsonCrudPage for calls, projects, reports with proper forms (copy the pattern from admin/team/page.tsx)
5. Add `published: true` filter to `/api/articles` public GET
6. Add image upload capability when ready for production

---

## ASSUMPTIONS MADE

1. The `app/school/page.tsx` route is the Resources page (it was the only existing page without a clearly matched collection)
2. `teamMembers.active` field controls visibility — only `active: true` members show on the public team page
3. `resources.published` controls visibility — only published resources show on the public page
4. `formations.published` controls visibility — only published formations show
5. The `projects` collection uses `status: "planned"` (added in seed) which did not exist in the original Call model type. The original only had `active | completed | archived`. Planned is now supported.
6. The `calls` collection in the seed has a `content` field but the original `Call` model only had `description`. The seed uses `content` to match the existing admin page behavior. Both field names are handled gracefully.
7. Category name population on article/event detail pages uses a secondary DB query. This is intentional — avoids changing the existing API list endpoints.
8. No file upload system was implemented. All image/file fields are URL strings that the admin pastes manually.
9. Admin auth uses the same `requireAdmin()` helper throughout — checking for `role === "admin"` or `"superadmin"` in the users collection.

---

## IMPORTANT NOTES FOR THE NEXT AI

- **Do NOT use Mongoose or Prisma** — this project uses the MongoDB native driver directly via `getDb()` from `lib/mongodb.ts`
- **Next.js App Router** is used throughout — no Pages Router. Server components for public pages, Client components (`"use client"`) for admin forms
- **params are async** in Next.js 16 — always `const { id } = await params` not `params.id` directly
- **Tailwind v4** is used — CSS variables are defined in `globals.css`. Class names like `text-primary`, `bg-lightgreen` are defined via `@theme inline`. Standard Tailwind utilities work normally.
- **The `requireAdmin()` function** returns `null` if not authenticated — API routes must check `if (!admin) return 403`
- **Color palette**: `primary` = green-600 (`#16a34a`), `lightgreen` = `#f0fdf4`
- **The seed admin password is a fake hash** — to log in as admin during dev, either use the register page or replace the hash with a real bcrypt hash of your password
- **`app/school/page.tsx`** = Resources public page (unusual route name — do not rename without updating all internal links)
- **`app/news/formation/page.tsx`** = Formations public page
- **Admin JSON CRUD pages** (calls, projects, reports) use the shared `AdminJsonCrudPage` component at `app/admin/_components/AdminJsonCrudPage.tsx`. They pass a `starter` object as template. This works but requires the admin to write JSON manually.

---

## DATABASE SCHEMA SUMMARY

12 collections. All use MongoDB `_id: ObjectId`. All have `createdAt: Date` and `updatedAt: Date` except `messages` (only `createdAt`). Cross-collection references use raw `ObjectId` (no Mongoose population — done manually with secondary queries when needed).

## SEED SUMMARY

- Location: `app/api/seed/route.ts` (HTTP) and `scripts/seed.ts` (CLI)
- Strategy: deleteMany all → insertMany fresh data
- Trigger: `GET /api/seed` (safe, skips if teamMembers exists) or `GET /api/seed?force=1` (always runs)
- CLI: `npm run seed` (requires ts-node and `.env.local` with `MONGODB_URI` + `MONGODB_DB`)

## TESTING CHECKLIST

- [ ] Visit `/api/seed?force=1` → should return `{ ok: true, message: "Database seeded successfully!" }`
- [ ] Visit `/about/team` → should show 4 team members from DB
- [ ] Visit `/about/partners` → should show 4 partners from DB
- [ ] Visit `/school` → should show 3 resources grouped by category
- [ ] Visit `/news/formation` → should show 3 formations from DB
- [ ] Visit `/news/articles` → should show 3 articles with clickable cards
- [ ] Click an article → should open `/news/articles/[id]` detail page
- [ ] Visit `/news/events` → should show 3 events with clickable cards
- [ ] Click an event → should open `/news/events/[id]` detail page
- [ ] Visit `/news/appel-a-candidatures` → should show 3 calls with clickable cards
- [ ] Click a call → should open detail page with countdown
- [ ] Visit `/projects` → should show 3 projects with clickable cards
- [ ] Click a project → should open detail page with members list
- [ ] Login at `/login` with admin credentials → should redirect to `/admin`
- [ ] Visit `/admin/team` → should list members + allow add/edit/delete
- [ ] Visit `/admin/partners` → should list partners + allow add/edit/delete
- [ ] Visit `/admin/resources` → should list resources + allow add/edit/delete
- [ ] Visit `/admin/formations` → should list formations + allow add/edit/delete

## KNOWN LIMITATIONS

1. Admin password in seed is a placeholder — can't log in without setting a real one
2. No image upload — all images are URL strings entered manually
3. Articles/events list pages don't populate category names (detail pages do)
4. No pagination on any list endpoint
5. The `/api/resources` public endpoint filters `published: true` — admin sees the same filter. Admin needs an unfiltered endpoint (simple fix: add `?admin=1` bypass)
6. `app/admin/calls`, `app/admin/projects`, `app/admin/reports` use JSON editor, not proper forms
7. No `generateMetadata()` on detail pages for SEO
