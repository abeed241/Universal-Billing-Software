# Universal Billing Software

Cross-platform mobile billing app for retail stores. Add products, create bills, and generate shareable receipts with cloud sync.

## Tech Stack

- **Mobile:** Expo (React Native) + Expo Router
- **Backend:** Supabase (Auth, PostgreSQL, RLS)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
3. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Mobile App

```bash
cd mobile
cp .env.example .env
# Edit .env with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator.

## Features

- Login / Register
- Store setup (name, address, tax rate)
- Product management (add, edit, delete)
- POS billing with cart, discount, and tax
- PDF receipt generation and share
- Sales history

## Project Structure

```
├── mobile/           Expo app
├── supabase/         SQL migrations
└── README.md
```

## Deploy as website

### GitHub Pages (recommended)

Live URL: `https://abeed241.github.io/Universal-Billing-Software/`

1. In GitHub repo **Settings → Secrets and variables → Actions**, add:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. **Settings → Pages → Source:** GitHub Actions
3. Push to `main` or `enhance-feature` — workflow deploys automatically
4. In Supabase **Authentication → URL Configuration**, set Site URL to your GitHub Pages URL

### Vercel (alternative)

| Setting | Value |
|---------|--------|
| Root Directory | `mobile` |
| Build Command | `npx expo export --platform web` |
| Output Directory | `dist` |

Add the same `EXPO_PUBLIC_*` environment variables in Vercel.

### Local production test

```bash
cd mobile
npx expo export --platform web
npx serve dist
```
