# jari-front

Frontend for **Jari** — Bun + Next.js (App Router) + TypeScript + **daisyUI** + lucide-react.

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
                 →  services/*.service.ts  (domain logic, returns app types)
                 →  lib/mock/data.ts  (TEMP — replace with jari-back fetch)
types/app/jira   ·  components/ui (daisyUI badges) · components/common · components/layout
```

All imports use the `@/*` alias. daisyUI **theme tokens** only (`base-100`, `primary`, `success`,
`warning`, `error`, …) — no raw Tailwind colors. Theme switcher persists to `localStorage`.

## Pages → features (see ../docs/01-product.md)

| Route | Feature |
|---|---|
| `/` | #1 Dashboard — sprint health & performance |
| `/create` | #2 Create Story/Sub-task (+ #6 AI rewrite & suggest) |
| `/work` | #3 One-click "Done" on my Stories/Sub-tasks |
| `/worklog` | #4 Log time on Done sub-tasks (+ #6 AI auto-fill to 8h) |
| `/daily` | #5 Per-person daily 8h roll-up |
