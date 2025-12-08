-- Fix infinite recursion by using a security definer function

-- First, drop the problematic policies
drop policy if exists "Members can view their groups" on public.groups;
drop policy if exists "Members can view other members" on public.group_members;
drop policy if exists "Members can view group expenses" on public.expenses;

-- Create a secure function to check membership (Bypasses RLS to avoid recursion)
create or replace function public.is_group_member(_group_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from public.group_members
    where group_id = _group_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Re-create policies using the secure function

-- 1. Groups: View if member
create policy "Members can view their groups"
  on public.groups for select
  using (
    public.is_group_member(id)
  );

-- 2. Group Members: View neighbors if in same group
create policy "Members can view group members"
  on public.group_members for select
  using (
    public.is_group_member(group_id)
  );

-- 3. Expenses: View if in same group
create policy "Members can view group expenses"
  on public.expenses for select
  using (
    group_id is null -- Own private expenses (handled by owner policy usually, but let's be safe)
    or
    public.is_group_member(group_id) -- Group expenses
  );
