-- 1. Custom Categories Table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  icon text not null, -- Emoji
  label text not null, -- Name of the category
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Categories
alter table public.categories enable row level security;

create policy "Users can manage their own categories"
  on public.categories for all
  using (auth.uid() = user_id);

-- 2. User Preference: Currency
-- We add 'preference_currency' to profiles
alter table public.profiles
add column if not exists preference_currency text default '$';

-- 3. Function to Kick Member (Admin only)
create or replace function public.remove_group_member(
  target_user_id uuid,
  target_group_id uuid
) returns json as $$
declare
  requester_role text;
begin
  -- Check requester role
  select role into requester_role
  from public.group_members
  where user_id = auth.uid() and group_id = target_group_id;

  if requester_role != 'admin' then
    return json_build_object('error', 'Solo el administrador puede eliminar miembros');
  end if;

  -- Prevent deleting yourself (Admin leaving group is a different logic)
  if target_user_id = auth.uid() then
     return json_build_object('error', 'No puedes eliminarte a ti mismo aquí');
  end if;

  -- Perform deletion
  delete from public.group_members
  where user_id = target_user_id and group_id = target_group_id;

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;

-- 4. Function to get Group Analytics (Securely)
create or replace function public.get_group_analytics()
returns json as $$
declare
  my_group_id uuid;
  result json;
begin
  -- Get user group
  select group_id into my_group_id
  from public.group_members
  where user_id = auth.uid()
  limit 1;

  if my_group_id is null then return null; end if;

  -- Return aggregated data
  select json_build_object(
    'group_info', (select row_to_json(g) from public.groups g where id = my_group_id),
    'members_expenses', (
       select json_agg(stats)
       from (
          select 
            p.username as name,
            p.id as user_id,
            coalesce(sum(e.amount), 0) as total_spent,
            count(e.id) as transaction_count
          from public.group_members gm
          join public.profiles p on gm.user_id = p.id
          left join public.expenses e on e.user_id = p.id and e.group_id = my_group_id
          where gm.group_id = my_group_id
          group by p.id, p.username
          order by total_spent desc
       ) stats
    )
  ) into result;

  return result;
end;
$$ language plpgsql security definer;
