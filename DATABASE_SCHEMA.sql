-- Next Up: Database Reconstruction Script
-- Run this in the Supabase SQL Editor to restore your database schema.

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create PROFILES Table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    phone text,
    updated_at timestamp with time zone default now()
);

-- 3. Create PRODUCTS Table
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    price numeric default 0,
    images text[],
    "imageUrl" text,
    condition text,
    location text,
    description text,
    created_at timestamp with time zone default now()
);

-- 4. Create CONVERSATIONS Table
create table if not exists public.conversations (
    id uuid default uuid_generate_v4() primary key,
    user1 uuid references public.profiles(id) on delete cascade not null,
    user2 uuid references public.profiles(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    created_at timestamp with time zone default now(),
    
    -- Ensure user1 and user2 are different
    constraint distinct_users check (user1 <> user2)
);

-- 5. Create MESSAGES Table
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    conversation_id uuid references public.conversations(id) on delete cascade not null,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    receiver_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    product_id uuid references public.products(id) on delete set null,
    created_at timestamp with time zone default now()
);

-- 6. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- 7. RLS Policies for PROFILES
create policy "Public profiles are viewable by everyone" on public.profiles
    for select using (true);

create policy "Users can update their own profile" on public.profiles
    for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
    for insert with check (auth.uid() = id);

-- 8. RLS Policies for PRODUCTS
create policy "Products are viewable by everyone" on public.products
    for select using (true);

create policy "Users can insert their own products" on public.products
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own products" on public.products
    for update using (auth.uid() = user_id);

create policy "Users can delete their own products" on public.products
    for delete using (auth.uid() = user_id);

-- 9. RLS Policies for CONVERSATIONS
create policy "Users can view their own conversations" on public.conversations
    for select using (auth.uid() = user1 or auth.uid() = user2);

create policy "Users can start conversations" on public.conversations
    for insert with check (auth.uid() = user1 or auth.uid() = user2);

-- 10. RLS Policies for MESSAGES
create policy "Users can view messages in their conversations" on public.messages
    for select using (
        exists (
            select 1 from public.conversations 
            where id = conversation_id 
            and (user1 = auth.uid() or user2 = auth.uid())
        )
    );

create policy "Users can send messages" on public.messages
    for insert with check (auth.uid() = sender_id);

-- 11. Enable Realtime
-- Note: In Supabase, you must also enable the "Realtime" check for these tables in the dashboard UI.
-- However, we can add them to the publishing list here:
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.conversations, public.messages;

-- 12. Profile Trigger (Optional but recommended)
-- This creates a profile entry automatically when a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger should only be created if it doesn't exist, safely:
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- END OF SCRIPT
