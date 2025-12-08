'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- ANALYTICS ---

export async function getGroupAnalytics() {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_group_analytics')
    if (error) {
        console.error(error)
        return null
    }
    return data
}

// --- MEMBER MANAGEMENT ---

export async function kickMember(targetUserId: string, groupId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('remove_group_member', {
        target_user_id: targetUserId,
        target_group_id: groupId
    })

    if (error) return { error: error.message }
    if (data && data.error) return { error: data.error }

    revalidatePath('/')
    revalidatePath('/group')
    return { success: true }
}

// --- CUSTOM CATEGORIES ---

export async function createCategory(icon: string, label: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('categories')
        .insert({ user_id: user.id, icon, label })

    if (error) return { error: error.message }

    revalidatePath('/')
    return { success: true }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/')
    return { success: true }
}

export async function getCategories() {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('*').order('created_at')
    return data || []
}

// --- USER PREFERENCES ---

export async function updateUserCurrency(currency: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('profiles')
        .update({ preference_currency: currency })
        .eq('id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/')
    return { success: true }
}
