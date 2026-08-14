# Greenhouse Co-Op

Premium fruit-tree nursery website for Belize. Version 1 runs entirely in the browser with local JSON and LocalStorage — no database, no Stripe, no Supabase.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
