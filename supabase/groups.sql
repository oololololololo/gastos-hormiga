-- Create Groups Table
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text unique not null, -- Simple code like "A7B2" for sharing
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Group Members Table (Many-to-Many)
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (group_id, user_id)
);

-- Add group_id to expenses (optional: if you want expenses to belong to a group)
alter table public.expenses 
add column group_id uuid references public.groups(id) on delete set null;

-- Enable RLS
alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- Policies

-- 1. Everyone can create a group
create policy "Users can create groups"
  on public.groups for insert
  with check (true);

-- 2. Members can view their groups
create policy "Members can view their groups"
  on public.groups for select
  using (
    auth.uid() in (
      select user_id from public.group_members where group_id = id
    )
  );

-- 3. Members can view other members of their group
create policy "Members can view other members"
  on public.group_members for select
  using (
    group_id in (
      select group_id from public.group_members where user_id = auth.uid()
    )
  );

-- 4. Users can join (insert themselves) if they know the exact code? 
-- Actually, usually we fetch the group by code (public read on code?) then insert into members.
-- Let's allow inserting into group_members if you are the authenticated user.
create policy "Users can join groups"
  on public.group_members for insert
  with check (auth.uid() = user_id);

-- 5. Update expenses policy to allow viewing group expenses
create policy "Members can view group expenses"
  on public.expenses for select
  using (
    group_id in (
      select group_id from public.group_members where user_id = auth.uid()
    )
  );

-- Helper function to generate a random code (Optional, can be done in JS, but nice in SQL)
-- We will handle code generation in Frontend/JS for simplicity to avoid complex PL/pgSQL for now.
