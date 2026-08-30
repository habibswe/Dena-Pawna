<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Dena Pawna - Project Context

This is a personal finance tracker web application named "Dena Pawna".

## Tech Stack
- Next.js (App Router, Tailwind CSS, TypeScript, Server Actions)
- Supabase (PostgreSQL, Auth, RLS)
- UI: Radix UI, Base UI, Custom Glassmorphism Theme

## Core Functionality
- Track financial transactions (Given, Received, Borrowed, Returned) between the logged-in User and various "People".
- **People Table**: `id`, `user_id`, `name`, `phone`, `type` (customer, supplier, employee, other), `created_at`.
- **Transactions Table**: `id`, `user_id`, `person_id`, `type`, `amount`, `transaction_date`, `note`, `created_at`.
- **Profiles Table**: `id` (references auth.users), `full_name`.

## Architecture Rules & Patterns
1. **Glassmorphism Design**: Use the `.glass-panel` utility class for all cards, inputs, and modals.
2. **Icons**: Use `lucide-react` icons exclusively.
3. **Admin Panel**: An isolated admin area at `/admin` built to manage all users and global data. Uses `supabase.auth.admin` APIs and `createAdminClient()` (requires `SUPABASE_SERVICE_ROLE_KEY`).
4. **Pagination**: Uses Infinite Scroll for public data (`IntersectionObserver` with client components) and standard `AdminPagination` for the admin panel. Server queries use `.range(x, y)`.
5. **Caching**: Utilize `revalidatePath` after server actions to update Next.js App Router cache.

## Core UI & UX Guidelines (Crucial for AI Assistants)
1. **NEVER use `window.confirm`**: The app uses a custom, glassmorphic `<ConfirmDialog>` component (`@/components/ui/confirm-dialog.tsx`). Always use this for deletions or critical actions (including Logout). Control its state via standard React `useState` (`isOpen`, `onConfirm`, `onClose`, `isDeleting`).
2. **Modal Transparency Fixes**: All dialogs/modals (via `@base-ui/react/dialog` or `@/components/ui/dialog`) MUST have `!bg-background shadow-2xl` on their `DialogContent` to prevent underlying text from bleeding through the frosted glass.
3. **Theme & Localization Defaults**: The app defaults to **English (`en`)** and **Light Theme**. In `layout.tsx`, `enableSystem={false}` is explicitly set to prevent OS dark mode from overriding the default light mode. Do not change this unless requested.
4. **Mobile Responsive Settings Page**: The settings page (`/settings`) uses a single-page architecture for mobile. It conditionally renders sections (`profile`, `password`, `preferences`) using a local state (`mobileView`) to avoid unnecessary routing. Logout is triggered directly via popup.
5. **PWA Requirements**: The Progressive Web App relies on strict naming (`logo-green.svg`) and a solid white background (`#ffffff`) for the Android splash screen. Do not change manifest icons or colors without testing PWA installation behavior.
6. **Auth Layouts**: The Login and Signup pages use simplified layouts with a mobile header (Activity icon + title). They explicitly DO NOT include the global navbar, mode toggles, or old logos. Keep auth pages distraction-free.

## Current Project State & Warnings
- **Database Safety**: Be extremely cautious with raw SQL or migrations. A previous AI agent accidentally wiped production data. Always verify DELETE/DROP statements.
- **Dependencies**: The app uses `sonner` for toast notifications (`toast.success`, `toast.error`). Always provide feedback to the user after mutations.
