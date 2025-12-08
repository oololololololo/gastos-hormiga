'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function submitName(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string

    if (!name || name.trim().length <= 1) {
        return { error: 'Por favor ingresa un nombre válido' }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { error } = await supabase
        .from('profiles')
        .update({ username: name.trim() })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile', error)
        return { error: 'Error al guardar el nombre' }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
