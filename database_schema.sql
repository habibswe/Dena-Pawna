-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Enums
create type transaction_type as enum ('GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED');

-- 2. Create Profiles Table
create table public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    full_name text,
    email text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create People Table
create table public.people (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    phone text,
    email text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Transactions Table
create table public.transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade not null,
    person_id uuid references public.people on delete cascade not null,
    type transaction_type not null,
    amount numeric(12, 2) not null check (amount > 0),
    transaction_date date not null default current_date,
    note text,
    due_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.people enable row level security;
alter table public.transactions enable row level security;

-- 6. Create RLS Policies

-- Profiles Policies
create policy "Users can view own profile" 
on public.profiles for select 
using (auth.uid() = id);

create policy "Users can insert own profile" 
on public.profiles for insert 
with check (auth.uid() = id);

create policy "Users can update own profile" 
on public.profiles for update 
using (auth.uid() = id);

-- People Policies
create policy "Users can view own people" 
on public.people for select 
using (auth.uid() = user_id);

create policy "Users can insert own people" 
on public.people for insert 
with check (auth.uid() = user_id);

create policy "Users can update own people" 
on public.people for update 
using (auth.uid() = user_id);

create policy "Users can delete own people" 
on public.people for delete 
using (auth.uid() = user_id);

-- Transactions Policies
create policy "Users can view own transactions" 
on public.transactions for select 
using (auth.uid() = user_id);

create policy "Users can insert own transactions" 
on public.transactions for insert 
with check (auth.uid() = user_id);

create policy "Users can update own transactions" 
on public.transactions for update 
using (auth.uid() = user_id);

create policy "Users can delete own transactions" 
on public.transactions for delete 
using (auth.uid() = user_id);

-- 7. Functions & Triggers for updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at_profiles
before update on public.profiles
for each row execute procedure handle_updated_at();

create trigger handle_updated_at_people
before update on public.people
for each row execute procedure handle_updated_at();

create trigger handle_updated_at_transactions
before update on public.transactions
for each row execute procedure handle_updated_at();

-- 8. Trigger to create a profile automatically on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
