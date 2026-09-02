-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Enums (Idempotent)
do $$ begin
  create type category_type as enum ('INCOME', 'EXPENSE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type account_type as enum ('CASH', 'BANK', 'BKASH', 'NAGAD', 'CARD', 'SAVINGS');
exception when duplicate_object then null; end $$;

do $$ begin
  create type recurrence_interval as enum ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED', 'INCOME', 'EXPENSE', 'TRANSFER', 'SAVING');
exception when duplicate_object then null; end $$;

-- 2. Create Profiles Table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    full_name text,
    email text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create People Table
create table if not exists public.people (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    phone text,
    email text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Categories Table
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    type category_type not null,
    icon text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Accounts Table
create table if not exists public.accounts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    type account_type not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Budgets Table
create table if not exists public.budgets (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade not null,
    category_id uuid references public.categories on delete cascade not null,
    amount numeric(12, 2) not null check (amount > 0),
    month text not null, -- Format: YYYY-MM
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, category_id, month)
);

-- 7. Create Transactions Table
create table if not exists public.transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade not null,
    person_id uuid references public.people on delete set null,
    category_id uuid references public.categories on delete set null,
    account_id uuid references public.accounts on delete set null,
    to_account_id uuid references public.accounts on delete set null,
    type transaction_type not null,
    amount numeric(12, 2) not null check (amount > 0),
    transaction_date date not null default current_date,
    note text,
    due_date date,
    is_recurring boolean default false,
    recurrence recurrence_interval,
    parent_transaction_id uuid references public.transactions on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.people enable row level security;
alter table public.categories enable row level security;
alter table public.accounts enable row level security;
alter table public.budgets enable row level security;
alter table public.transactions enable row level security;

-- 9. Create RLS Policies (Idempotent)

-- Profiles Policies
do $$ begin create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id); exception when duplicate_object then null; end $$;

-- People Policies
do $$ begin create policy "Users can view own people" on public.people for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can insert own people" on public.people for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can update own people" on public.people for update using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can delete own people" on public.people for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;

-- Categories Policies
do $$ begin create policy "Users can view own categories" on public.categories for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can insert own categories" on public.categories for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can update own categories" on public.categories for update using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can delete own categories" on public.categories for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;

-- Accounts Policies
do $$ begin create policy "Users can view own accounts" on public.accounts for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can insert own accounts" on public.accounts for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can update own accounts" on public.accounts for update using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can delete own accounts" on public.accounts for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;

-- Budgets Policies
do $$ begin create policy "Users can view own budgets" on public.budgets for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can insert own budgets" on public.budgets for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can update own budgets" on public.budgets for update using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can delete own budgets" on public.budgets for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;

-- Transactions Policies
do $$ begin create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;

-- 10. Functions & Triggers for updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_updated_at_profiles on public.profiles;
create trigger handle_updated_at_profiles before update on public.profiles for each row execute procedure handle_updated_at();

drop trigger if exists handle_updated_at_people on public.people;
create trigger handle_updated_at_people before update on public.people for each row execute procedure handle_updated_at();

drop trigger if exists handle_updated_at_categories on public.categories;
create trigger handle_updated_at_categories before update on public.categories for each row execute procedure handle_updated_at();

drop trigger if exists handle_updated_at_accounts on public.accounts;
create trigger handle_updated_at_accounts before update on public.accounts for each row execute procedure handle_updated_at();

drop trigger if exists handle_updated_at_budgets on public.budgets;
create trigger handle_updated_at_budgets before update on public.budgets for each row execute procedure handle_updated_at();

drop trigger if exists handle_updated_at_transactions on public.transactions;
create trigger handle_updated_at_transactions before update on public.transactions for each row execute procedure handle_updated_at();

-- 11. Trigger to create a profile automatically on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- 12. Create Indexes for Performance & Query Optimization
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_person_id on public.transactions(person_id);
create index if not exists idx_transactions_category_id on public.transactions(category_id);
create index if not exists idx_transactions_account_id on public.transactions(account_id);
create index if not exists idx_transactions_to_account_id on public.transactions(to_account_id);
create index if not exists idx_transactions_date on public.transactions(transaction_date desc);

create index if not exists idx_people_user_id on public.people(user_id);
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_budgets_user_id on public.budgets(user_id);
create index if not exists idx_budgets_category_month on public.budgets(category_id, month);

-- 13. System Audit Logs Table (For Super Admin Backups & Restores)
create table if not exists public.system_logs (
    id uuid default uuid_generate_v4() primary key,
    action text not null,
    details jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.system_logs enable row level security;
do $$ begin create policy "Allow service role access on system_logs" on public.system_logs for all using (true); exception when duplicate_object then null; end $$;
create index if not exists idx_system_logs_created_at on public.system_logs(created_at desc);
