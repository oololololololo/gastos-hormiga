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
        try {
            // Fallback if RPC fails or not exists (though we created it)
            // This is just a safety for existing code logic, but rpc should work.
            return { error: error.message }
        } catch (e) {
            return { error: 'Unknown error creating group' }
        }
    }

    // RPC returns JSON, so we handle it as the group object
    const newGroup = group as any;

    revalidatePath('/')
    return { success: true, code: newGroup.code }
}

export async function joinGroup(code: string) {
    const supabase = await createClient()

    const { data: result, error } = await supabase
        .rpc('join_group_by_code', {
            code_input: code.toUpperCase()
        })

    if (error) {
        return { error: error.message }
    }

    // RPC returns a JSON object with success or error
    if (result && result.error) {
        return { error: result.error }
    }

    revalidatePath('/')
    return { success: true }
}

// Get full group details with members
// Get full group details with members using secure RPC
export async function getUserGroup() {
    const supabase = await createClient()

    // Use the secure function we just created
    const { data, error } = await supabase
        .rpc('get_my_group_details')

    if (error || !data) {
        if (error) console.error('Error fetching group:', error)
        return null
    }

    return data
}

export async function updateGroupCurrency(groupId: string, currency: string) {
    const supabase = await createClient()

    // Check if admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const { data: member } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

    if (member?.role !== 'admin') {
        return { error: 'Solo el administrador puede cambiar la moneda' }
    }

    const { error } = await supabase
        .from('groups')
        .update({ currency })
        .eq('id', groupId)

    if (error) return { error: error.message }

    revalidatePath('/')
    return { success: true }
}
