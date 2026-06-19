# jari-front

Frontend for **Jari** — Bun + Next.js (App Router) + TypeScript + **Untitled UI** (Tailwind v4) + lucide-react.

UI primitives live in `src/components/ui` (Button, Badge, Card, Field, Spinner, ProgressBar,
RadialProgress, Dropdown, Avatar). Design tokens (gray / brand-purple / semantic scales, shadows,
Inter font) are in `src/app/globals.css` under `@theme`. Use token utilities like `bg-brand-600`,
`text-gray-700`, `border-gray-200`, `shadow-xs` — never raw Tailwind colors.

> Currently runs on **mock data**. The service layer (`src/services/*.service.ts`) is the only
> place that reads `src/lib/mock/data.ts`. To go live, swap each service function body for a
> `fetch` to the `jari-back` Hono API — the domain return types stay the same, so hooks and UI are
> untouched.

## Run

```bash
bun install
bun run dev      # http://localhost:3000
bun run build    # production build
```

## Architecture (per nextjs-pattern-generator)

```
page.tsx (thin)  →  partials/<Feature>/<Feature>Content.tsx ("use client")
                 →  hooks/jari/use*.ts  (React Query: useQuery / useMutation)
                 →  services/*.service.ts  (calls jari-back via lib/api/client.ts)
                 →  jari-back (Hono :4000)
types/app/jira   ·  components/ui (Untitled UI primitives) · components/common · components/layout
context/auth     ·  login + AuthGuard; identity (accountId) shared via useAuth
```

All imports use the `@/*` alias. Untitled UI **token utilities** only (`bg-brand-600`,
`text-gray-700`, `border-gray-200`, `shadow-xs`, …) — no raw Tailwind colors.

## Pages → features (see ../docs/01-product.md)

| Route | Feature |
|---|---|
| `/` | #1 Dashboard — sprint health & performance |
| `/create` | #2 Create Story/Sub-task (+ #6 AI rewrite & suggest) |
| `/work` | #3 One-click "Done" on my Stories/Sub-tasks |
| `/worklog` | #4 Log time on Done sub-tasks (+ #6 AI auto-fill to 8h) |
| `/daily` | #5 Per-person daily 8h roll-up |
