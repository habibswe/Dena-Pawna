# Hishab - Simple Money Ledger

A clean, modern, and trustworthy visual identity for tracking money you've lent and borrowed. Built for mobile-first with a premium aesthetic.

## Tech Stack
- Next.js (App Router)
- Supabase (Postgres, Auth, RLS)
- Tailwind CSS v4 & shadcn/ui
- React Hook Form & Zod (via Server Actions)

## Local Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Supabase Setup:**
   - Create a new project on [Supabase](https://supabase.com).
   - Go to **SQL Editor** in your Supabase dashboard.
   - Copy the contents of `database_schema.sql` (found in the root directory of this repo).
   - Paste and run the SQL script to create all tables, policies, and triggers.

3. **Environment Variables:**
   - Copy the `.env.example` file to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project settings (Project Settings > API).

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Deployment (Vercel)

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. In the environment variables section on Vercel, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. The app is PWA-ready and handles metadata out of the box.

## Testing

The core balance calculation logic is covered by unit tests. To run them:
```bash
npm run test
```

## Features Implemented
- Authentication (Login, Signup, Logout)
- Dashboard Overview (Net Balance, Who owes you, Who you owe)
- Person Management (Add, View Details)
- Transaction Management (Given, Received, Borrowed, Returned)
- Dark Mode support (via Tailwind variants & OS preference)
- Premium UI with Shadcn and Tailwind V4
- Row Level Security (RLS) to ensure user data isolation.
