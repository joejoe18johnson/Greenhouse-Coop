# Greenhouse Co-Op

Premium fruit-tree nursery website for Belize.

## Run locally (LocalStorage mode)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No database required — data persists in the browser.

## Supabase backend (optional)

To use Postgres + Supabase Auth instead of LocalStorage, see **[docs/SUPABASE.md](docs/SUPABASE.md)**.

Quick start:

1. Create a Supabase project
2. Copy `.env.example` → `.env.local` and add your keys
3. Run the SQL migration in `supabase/migrations/`
4. `npm run seed:supabase`
5. Restart `npm run dev`

## Demo accounts

Admin

- Email: `admin@greenhousecoop.com`
- Password: `admin123`

Customer

- Email: `customer@greenhousecoop.com`
- Password: `customer123`

Open `/admin` after signing in as admin. Demo orders cover payment pending through sent and completed. Confirming payment issues a branded invoice.

## Stack

Next.js 14, TypeScript, Tailwind CSS, shadcn/ui primitives, Framer Motion.

Product, shipping, courier, and catalog data live in `src/data`. Runtime edits (orders, accounts, admin changes) persist in LocalStorage under the `ghco.v1.` prefix so a future Supabase adapter can replace `src/lib/storage.ts` without rewriting the UI.
