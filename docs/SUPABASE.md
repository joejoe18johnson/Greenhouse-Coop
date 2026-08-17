# Supabase Backend Setup

Greenhouse Co-Op can run in two modes:

- **Local mode** (default): data in browser LocalStorage — no env vars needed.
- **Supabase mode**: Postgres + Auth + RLS — set the env vars below.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Copy your **Project URL** and **anon public key** from **Settings → API**.

## 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Restart the dev server after changing env vars.

## 3. Run the database migration

In the Supabase dashboard, open **SQL Editor** and run:

`supabase/migrations/20250817000000_initial_schema.sql`

Or, if you use the Supabase CLI:

```bash
supabase db push
```

## 4. Seed catalog and admin account

```bash
npm run seed:supabase
```

This loads products, shipping, couriers, IDS rates, bank details, and creates the admin user.

Default admin login:

- Email: `admin@greenhousecoop.com`
- Password: `admin123`

## Database schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (linked to Supabase Auth) |
| `addresses` | Customer delivery addresses |
| `products` | Nursery catalog |
| `orders` | Orders with JSON line items, shipping, payment, timeline |
| `app_settings` | Shipping, couriers, IDS rates, bank details |
| `carts` | Persisted carts for logged-in customers |

Row Level Security is enabled on all tables. Customers can read/write their own data; admins can manage products, orders, and settings.

## What changes in Supabase mode

- **Auth**: Supabase Auth replaces client-side password hashing.
- **Products & orders**: Stored in Postgres instead of LocalStorage.
- **Admin settings**: Shipping, couriers, and rates persist in `app_settings`.
- **Cart**: Synced to Supabase for logged-in users.
- **Guest browsing**: Still works; cart stays local until login.

## Troubleshooting

- **Blank catalog after enabling Supabase**: Run the seed script — products must be inserted into Postgres.
- **Admin can't access `/admin`**: Confirm the profile `role` is `admin` in the `profiles` table.
- **Auth errors on register**: Disable email confirmation in Supabase **Auth → Providers → Email** for development, or confirm via email link.
