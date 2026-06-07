# AGENTS.md — AI Agent Context & Instruction Guide

> This file is the **single source of truth** for any AI coding agent working on the Kumpulink project.
> Read this file **in full** before writing any code or answering any question about this project.
> When instructions here conflict with general best practices, **this file wins**.

---

## 1. Project Context

**Kumpulink** is a personal link-saving and bookmarking web application. Think of it as a private, self-hosted alternative to services like Pocket or Raindrop.io.

### Core Value Proposition
- **Frictionless saving:** Add a URL, get it organized automatically.
- **Auto-grouping:** Links are grouped by domain with no manual categorization required.
- **Dead link awareness:** The app periodically pings saved links and visually flags broken ones.
- **Personal & isolated:** Each user sees only their own links. Authentication is mandatory.

### Reference Documents (Always Read These First)
| Document | Path | Purpose |
|---|---|---|
| This file | `AGENTS.md` | Agent instructions & coding conventions |
| Design System | `DESIGN.md` | UI tokens, components, and visual rules |
| Implementation Plan | `IMPLEMENTATION_PLAN.md` | Architecture, schema, and dev phases |

---

## 2. Technology Stack — Quick Reference

| Layer | Technology | Key Details |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Use `app/` directory, RSC by default, Server Actions for mutations |
| Language | TypeScript (strict mode) | `tsconfig.json` with `"strict": true` — no `any` shortcuts |
| Database | PostgreSQL 16 (via Docker) | Local only; `docker compose up -d` to start |
| ORM | Prisma 5.x | All DB access goes through Prisma — no raw SQL |
| Auth | Auth.js v5 (`next-auth@beta`) | Credentials provider, JWT sessions |
| Validation | Zod 3.x | Define schemas in `src/schemas/`; reuse on client and server |
| Styling | CSS Modules + CSS Custom Properties | Follow `DESIGN.md` — no inline styles, no Tailwind |
| HTTP (dead links) | Native `fetch` (Node 18+) | HEAD requests only; use `p-limit` for concurrency |
| Cron | `node-cron` | Initialized in `src/instrumentation.ts` |

---

## 3. Coding Standards & Conventions

### 3.1 TypeScript

- **No `any`** — ever. Use `unknown` and narrow it, or define a proper type.
- All exported functions must have explicit return type annotations.
- Use `type` for object shapes; use `interface` only when extension is needed.
- Use Zod schemas as the single source of truth for input types; derive TypeScript types from them with `z.infer<typeof schema>`.

```typescript
// ✅ Correct
import { z } from 'zod'
export const CreateLinkSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1).max(255),
})
export type CreateLinkInput = z.infer<typeof CreateLinkSchema>

// ❌ Wrong
export const createLink = async (data: any) => { ... }
```

### 3.2 File & Folder Naming

| Thing | Convention | Example |
|---|---|---|
| Directories | `kebab-case` | `add-link-modal/` |
| React components | `PascalCase.tsx` | `LinkCard.tsx` |
| Non-component TS files | `camelCase.ts` | `deadLinkChecker.ts` |
| CSS Modules | `ComponentName.module.css` | `LinkCard.module.css` |
| Server Actions files | `*.actions.ts` | `link.actions.ts` |
| Zod schema files | `*.schema.ts` | `link.schema.ts` |

### 3.3 React Component Rules

- **Prefer React Server Components (RSC)** by default. Only add `'use client'` when you need browser APIs, event handlers, or `useState`/`useEffect`.
- Keep `'use client'` components as **leaf nodes** in the component tree. Do not push the client boundary up unnecessarily.
- Never `fetch` data inside a Client Component. Fetch in RSC and pass data as props, or use SWR on the client.
- Co-locate component styles: `src/components/links/LinkCard/LinkCard.tsx` + `LinkCard.module.css`.

```
// ✅ Correct — RSC fetches, passes to client leaf
// DashboardPage.tsx (RSC)
const links = await db.link.findMany({ where: { userId } })
return <LinkGrid links={links} />

// ❌ Wrong — fetching in client component
'use client'
const [links, setLinks] = useState([])
useEffect(() => { fetch('/api/links').then(...) }, [])
```

### 3.4 Server Actions

- All mutations (create, update, delete) must be Server Actions in `src/actions/`.
- Every Server Action must:
  1. Get the session via `auth()` and throw/return an error if unauthenticated.
  2. Validate all inputs with the corresponding Zod schema.
  3. Verify ownership — check that the resource `userId` matches `session.user.id` before any mutation.
  4. Call `revalidatePath('/dashboard')` after successful mutations.
  5. Return a typed result object: `{ success: true, data: ... }` or `{ success: false, error: '...' }`.

```typescript
// src/actions/link.actions.ts
'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { CreateLinkSchema } from '@/schemas/link.schema'
import { revalidatePath } from 'next/cache'

export async function createLink(input: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthenticated' }

  const parsed = CreateLinkSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.flatten() }

  // ... business logic ...

  revalidatePath('/dashboard')
  return { success: true, data: link }
}
```

### 3.5 Database (Prisma)

- The Prisma client singleton lives in `src/lib/db.ts`. Import `db` from there — never instantiate `PrismaClient` elsewhere.
- Always scope queries to `userId` for user-owned resources. Never query `db.link.findMany()` without a `where: { userId }` clause.
- Use `select` to fetch only the fields needed. Avoid over-fetching full records.
- Use Prisma transactions (`db.$transaction`) when multiple DB writes must be atomic (e.g., creating a link + upserting a domain).

```typescript
// ✅ Correct — scoped, selective
const links = await db.link.findMany({
  where: { userId: session.user.id },
  select: { id: true, url: true, title: true, isDead: true, domain: { select: { name: true } } },
  orderBy: { createdAt: 'desc' },
})

// ❌ Wrong — no scope, over-fetches
const links = await db.link.findMany()
```

### 3.6 Error Handling

- Use `try/catch` in Server Actions and API routes. Never let unhandled errors bubble to the browser.
- Return user-friendly error messages. Log technical details to the console (or a logger), but never expose stack traces or DB errors to the client.
- For expected validation failures, return `{ success: false, error: string }`. For truly unexpected errors, return `{ success: false, error: 'Something went wrong. Please try again.' }`.

### 3.7 Environment Variables

- Access env vars only in server-side code (Server Actions, API routes, lib files).
- For client-accessible env vars, prefix with `NEXT_PUBLIC_` and add to `.env.example`.
- Never `console.log` env vars.
- Validate required env vars at startup. Add a `src/lib/env.ts` that uses Zod to parse `process.env`.

```typescript
// src/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

---

## 4. Component Structure Guidelines

### 4.1 Component Categories

```
src/components/
├── ui/          # Primitive, design-system components (Button, Card, Input, Modal, Chip, Tooltip)
├── links/       # Feature components for the links domain (LinkCard, AddLinkModal, DeadLinkBadge)
├── dashboard/   # Dashboard-specific layout components (DashboardHeader, SearchBar, DomainFilter)
└── auth/        # Auth forms (LoginForm, RegisterForm)
```

### 4.2 UI Primitives (`src/components/ui/`)

These components are the building blocks. They:
- Accept explicit props (no implicit "catch-all" prop drilling).
- Have no business logic — purely presentational.
- Must exactly implement the component specs from `DESIGN.md` (sizes, colors, states).
- Export a single named export matching the folder name.

Example structure:
```
src/components/ui/Button/
├── Button.tsx          # Component implementation
├── Button.module.css   # Scoped styles using DESIGN.md tokens
└── index.ts            # Re-export: export { Button } from './Button'
```

### 4.3 Feature Components (`src/components/links/`, etc.)

These components:
- May contain local state and event handlers (they are `'use client'`).
- Compose UI primitives — they do not re-implement base styles from scratch.
- Receive data as props from RSC parents.
- Call Server Actions directly for mutations.

### 4.4 LinkCard Component — Key Behaviors

The `LinkCard` is the most important component. It must:
- Render an `<a>` tag with `href={link.url}`, `target="_blank"`, and `rel="noopener noreferrer"`.
- Show the link's favicon (from `link.faviconUrl`).
- Show the `DeadLinkBadge` if `link.isDead === true`.
- Have a kebab-menu (⋮) for Edit and Delete actions.
- Apply `scale(1.02)` and `shadow-md` on hover (per `DESIGN.md` Cards spec).

---

## 5. How to Read and Apply `DESIGN.md`

This is a critical instruction. When implementing any UI component, you **must** follow this workflow:

### Step 1 — Read the full `DESIGN.md` before touching CSS

Open and read the entire `DESIGN.md` file before writing a single line of CSS. Understand:
- The color palette (exact hex values)
- The typography scale (font families, sizes, weights, line heights)
- The spacing scale (8px base unit)
- The border radius scale
- The elevation/shadow system
- The specific component specs (Buttons, Cards, Inputs, Chips, etc.)

### Step 2 — Translate tokens to CSS Custom Properties

All `DESIGN.md` values must live as CSS Custom Properties in `src/styles/tokens.css`. **Never hardcode hex values or pixel values directly in component CSS.** Always use a variable.

```css
/* src/styles/tokens.css */
:root {
  /* Colors */
  --color-primary: #E11D48;
  --color-secondary: #2563EB;
  --color-tertiary: #FACC15;
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-error: #DC2626;
  --surface-base: #FFFFFF;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 48px;
  --space-8: 64px;
  --space-10: 80px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.15);
  --shadow-color: 0 8px 24px rgba(225, 29, 72, 0.25);
  --shadow-focus: 0 0 0 3px rgba(37, 99, 235, 0.35);

  /* Typography */
  --font-headline: 'Poppins', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'Fira Code', monospace;
}
```

### Step 3 — Implement components to spec

When implementing a UI primitive (e.g., `Button`), look up its exact spec in `DESIGN.md` and implement **all** states listed:
- For buttons: Primary, Secondary, Ghost, Destructive variants; Small, Medium, Large sizes; Disabled state.
- For inputs: Default, Hover, Focus, Error, Disabled states.
- For chips: All variants and states.

Do not skip states. An incomplete implementation is a broken implementation.

### Step 4 — Apply the Do's and Don'ts

The `DESIGN.md` includes a "Do's and Don'ts" section at the bottom. Re-read it before marking any UI work as done. Specifically:
- **Do** use bold color blocks and expressive typography.
- **Don't** use more than two brand colors in a single component.
- **Don't** over-animate — keep transitions at 150–300ms.
- **Do** add opaque fallbacks for glassmorphism effects in unsupported browsers.

### Step 5 — Verify against the checklist

Before considering a component done, verify:
- [ ] All color values come from `tokens.css` variables.
- [ ] All spacing values use `tokens.css` spacing variables.
- [ ] Typography uses the correct font family, size, and weight from the scale.
- [ ] All interactive states (hover, focus, active, disabled) are styled.
- [ ] Glassmorphism panels have `backdrop-filter: blur(16px)` AND an opaque fallback.
- [ ] Animations are 150–300ms.
- [ ] The component is keyboard-navigable and has a visible focus ring.

---

## 6. Feature-Specific Implementation Notes

### 6.1 Domain Extraction

The `extractDomain` utility is a critical function. It must:
- Accept any string (validate it's a valid URL first).
- Use `new URL(url).hostname` to extract the hostname.
- Strip the `www.` prefix: `hostname.replace(/^www\./, '')`.
- Return the normalized hostname string.

```typescript
// src/lib/utils.ts
export function extractDomain(url: string): string | null {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
```

### 6.2 Title Scraping

When a user adds a link, attempt to fetch its `<title>` tag server-side:
- Use a `fetch` with a reasonable timeout (e.g., 5 seconds via `AbortController`).
- Parse the response text with a lightweight regex: `/<title[^>]*>([^<]*)<\/title>/i`.
- Avoid using a full HTML parser like `cheerio` if the regex is sufficient — keep dependencies lean.
- **Always have a fallback:** if the fetch fails or title is empty, use the URL itself as the title.

### 6.3 Dead Link Checker

- Run as a `node-cron` job initialized in `src/instrumentation.ts` (App Router standard).
- Use `p-limit` to cap concurrent HTTP requests (default: 10).
- Use `HEAD` requests — never `GET` — to minimize bandwidth.
- Set a hard timeout via `AbortController` (default: 8 seconds).
- Treat all 4xx, 5xx, and network errors/timeouts as `isDead = true`.
- Treat 2xx and 3xx (redirect to 2xx) as `isDead = false`.
- After checking, always write `lastChecked = new Date()` regardless of outcome.

### 6.4 Authentication Rules

- Never store plaintext passwords. Always hash with `bcryptjs` (cost factor: 12).
- Session strategy: `jwt` (stateless, no DB session table required).
- Auth.js config lives in `src/auth.ts` (root of `src/`). Import `auth` from there everywhere.
- In Server Actions and API routes, always call `const session = await auth()` as the first line.
- If no session, return an error immediately — do not proceed to any DB query.

### 6.5 Ownership Verification Pattern

This pattern must be applied in EVERY Server Action that accesses user data:

```typescript
// After validating input and getting session:
const link = await db.link.findUnique({ where: { id: linkId }, select: { userId: true } })
if (!link) return { success: false, error: 'Link not found.' }
if (link.userId !== session.user.id) return { success: false, error: 'Forbidden.' }
// Now safe to mutate
```

---

## 7. What NOT to Do

These are hard prohibitions. If you are about to do any of these, stop and re-read the relevant section above.

1. **Do NOT use Tailwind CSS.** The project uses CSS Modules + CSS Custom Properties from `DESIGN.md`.
2. **Do NOT use raw SQL.** All database access must go through Prisma.
3. **Do NOT fetch data in `'use client'` components** (except via SWR for client-side revalidation).
4. **Do NOT use `any` in TypeScript.** Ever.
5. **Do NOT hardcode hex colors or pixel values** in CSS — always use a `tokens.css` variable.
6. **Do NOT write a Server Action without session validation** as the very first step.
7. **Do NOT query DB resources without scoping to `userId`.** This is a security boundary.
8. **Do NOT use `GET` requests in the dead link checker.** Use `HEAD` only.
9. **Do NOT initialize `PrismaClient` outside of `src/lib/db.ts`.**
10. **Do NOT skip any component state** (hover, focus, disabled) when implementing UI primitives.

---

## 8. Git & PR Conventions

- **Branch naming:** `feat/add-link-modal`, `fix/dead-link-timeout`, `chore/update-prisma`
- **Commit style:** Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- **Commit scope:** Use the feature area — `feat(links): add URL title scraping`
- Never commit `.env.local` or any file containing secrets.
- Run `npm run lint` and `npm run typecheck` before committing.

---

## 9. Checklist for Every Task

Before marking any task complete, verify:

- [ ] TypeScript compiles with no errors (`npm run typecheck`)
- [ ] ESLint passes with no warnings (`npm run lint`)
- [ ] All DB queries are scoped to `userId`
- [ ] All Server Actions validate session as step 1
- [ ] All new UI components use `tokens.css` variables only
- [ ] All interactive states are styled per `DESIGN.md`
- [ ] `DESIGN.md` Do's and Don'ts have been checked
- [ ] No `any` types introduced
- [ ] No raw SQL introduced
- [ ] `revalidatePath('/dashboard')` called after all mutations
