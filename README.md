# Universal Billing Software

Cross-platform billing app for retail stores. Add products, create bills, and generate shareable receipts with cloud sync.

## Tech Stack

- **Web:** Angular 19
- **Backend:** Supabase (Auth, PostgreSQL, RLS)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
3. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Web App

```bash
cd web
npm install
```

Copy [`web/src/environments/environment.example.ts`](web/src/environments/environment.example.ts) values into [`web/src/environments/environment.ts`](web/src/environments/environment.ts) and add your Supabase URL and anon key.

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Features

- Login / Register
- Store setup (name, address, tax rate)
- Product management (add, edit, delete)
- POS billing with cart, discount, and tax
- Printable / downloadable receipts
- Sales history

## Project Structure

```
├── web/              Angular app
├── mobile/           Previous Expo (React Native) app
├── supabase/         SQL migrations
└── README.md
```
