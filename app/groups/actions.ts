'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGroup(groupName: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Generate simple code (e.g. 6 chars uppercase)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Use RPC to create group and join in one atomic transaction (bypasses RLS issues)
    const { data: group, error } = await supabase
        .rpc('create_group_and_join', {
            name_input: groupName,
            code_input: code
        })

    if (error) {
        console.error('Group creation error:', error)
        return { error: error.message }
    }

    // RPC returns JSON, so we handle it as the group object
    const newGroup = group as any;

    revalidatePath('/')
    return { success: true, code: newGroup.code }
}

export async function joinGroup(code: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // 1. Find group
    const { data: group, error: findError } = await supabase
        .from('groups')
        .select('id')
        .eq('code', code.toUpperCase())
        .single()

    if (findError || !group) return { error: 'Group not found' }

    // 2. Add user to group
    const { error: joinError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: user.id })

    if (joinError) {
        if (joinError.code === '23505') return { error: 'Already a member' } // Unique violation
        return { error: joinError.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function getUserGroup() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from('group_members')
        .select('group_id, groups(name, code)')
        .eq('user_id', user.id)
        .single()

    if (!data || !data.groups) return null

    // @ts-ignore
    return { id: data.group_id, ...data.groups }
}
