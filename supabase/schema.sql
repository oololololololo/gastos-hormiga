-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for expenses
create table expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  amount numeric not null,
  description text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for expenses
alter table expenses enable row level security;

create policy "Individuals can view their own expenses." on expenses
  for select using (auth.uid() = user_id);

create policy "Individuals can create their own expenses." on expenses
  for insert with check (auth.uid() = user_id);

create policy "Individuals can update their own expenses." on expenses
  for update using (auth.uid() = user_id);

create policy "Individuals can delete their own expenses." on expenses
  for delete using (auth.uid() = user_id);

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'username', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();