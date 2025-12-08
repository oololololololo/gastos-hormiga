-- 1. FIX: Expenses Privacy
-- Previous policy accidentally made all personal expenses (group_id is null) public.
-- We replace it with a stricter check.

drop policy if exists "Members can view group expenses" on public.expenses;

create policy "Users can view valid expenses"
  on public.expenses for select
  using (
    user_id = auth.uid() -- You own the expense
    or
    (group_id is not null and public.is_group_member(group_id)) -- Or it belongs to your group
  );

-- 2. FIX: Joining Group
-- Users couldn't find groups by code because standard RLS hid them.
-- We create a secure function to find and join by code.

create or replace function public.join_group_by_code(
  code_input text
) returns json as $$
declare
  target_group_id uuid;
begin
  -- Find group ID by code (Security Definer allows reading table)
  select id into target_group_id
  from public.groups
  where code = code_input;

  if target_group_id is null then
    return json_build_object('error', 'Grupo no encontrado');
  end if;

  -- Check if already member to avoid unique constraint error
  if exists (select 1 from public.group_members where group_id = target_group_id and user_id = auth.uid()) then
     return json_build_object('error', 'Ya eres miembro de este grupo');
  end if;

  -- Insert member
  insert into public.group_members (group_id, user_id)
  values (target_group_id, auth.uid());

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;
