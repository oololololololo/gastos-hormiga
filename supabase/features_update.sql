-- 1. Add Roles to Members
-- We add a role column, defaulting to 'member'. Creator will be 'admin'.
alter table public.group_members
add column if not exists role text not null default 'member' check (role in ('admin', 'member'));

-- 2. Add Currency to Groups
-- Default is '$' (USD), but can be changed to '€', 'ARS', etc.
alter table public.groups
add column if not exists currency text not null default '$';

-- 3. Update the Creation RPC to assign ADMIN role
create or replace function public.create_group_and_join(
  name_input text,
  code_input text
) returns json as $$
declare
  new_group_id uuid;
  result json;
begin
  -- 1. Create Group
  insert into public.groups (name, code)
  values (name_input, code_input)
  returning id into new_group_id;

  -- 2. Add creator as ADMIN
  insert into public.group_members (group_id, user_id, role)
  values (new_group_id, auth.uid(), 'admin');

  -- 3. Return result
  select row_to_json(g) into result
  from public.groups g
  where g.id = new_group_id;

  return result;
end;
$$ language plpgsql security definer;

-- 4. Allow reading profiles of group members
-- (So you can see the names of people in your group)
create policy "View group members profiles"
  on public.profiles for select
  using (
    id in (
      select user_id from public.group_members
      where group_id in (
        select group_id from public.group_members where user_id = auth.uid()
      )
    )
  );
