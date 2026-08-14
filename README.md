# Greenhouse Co-Op

Premium fruit-tree nursery website for Belize. Version 1 runs entirely in the browser with local JSON and LocalStorage — no database, no Stripe, no Supabase.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin demo

- Email: `admin@greenhousecoop.com`
- Password: `admin123`

## Stack

Next.js 14, TypeScript, Tailwind CSS, shadcn/ui primitives, Framer Motion.

Product, shipping, courier, and catalog data live in `src/data`. Runtime edits (orders, accounts, admin changes) persist in LocalStorage under the `ghco.v1.` prefix so a future Supabase adapter can replace `src/lib/storage.ts` without rewriting the UI.
