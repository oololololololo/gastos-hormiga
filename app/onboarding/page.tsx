'use client'
import { useFormState } from 'react-dom'
import { submitName } from './actions'

const initialState = {
    error: '',
}

export default function OnboardingPage() {
    const [state, formAction] = useFormState(submitName, initialState)

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F7] p-6 text-[#1D1D1F]">
            <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                    <h1 className="text-3xl font-light tracking-tight">¡Hola!</h1>
                    <p className="mt-2 text-lg text-gray-500">¿Cómo te gustaría que te llamemos?</p>
                </div>

                <form action={formAction} className="mt-8 space-y-6">
                    <div className="rounded-2xl bg-white p-2 shadow-sm">
                        <label htmlFor="name" className="sr-only">
                            Nombre
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            autoFocus
                            minLength={2}
                            className="block w-full rounded-xl border-0 bg-transparent p-4 text-center text-xl font-medium text-[#1D1D1F] placeholder:text-gray-300 focus:ring-0 outline-none"
                            placeholder="Tu Nombre"
                        />
                    </div>
                    {state?.error && (
                        <p className="text-center text-red-500 text-sm">{state.error}</p>
                    )}

                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-full bg-[#1D1D1F] px-4 py-4 text-base font-medium text-white hover:bg-black focus:outline-hidden focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all active:scale-95"
                    >
                        Continuar
                    </button>
                </form>
            </div>
        </div>
    )
}
