import Link from 'next/link'
import { login } from '../auth/actions'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string; error: string }>
}) {
    const params = await searchParams;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F7] p-6 text-[#1D1D1F]">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-light tracking-tight">GastosHormiga</h1>
                    <p className="mt-2 text-sm text-gray-500">Inicia sesión para sincronizar tus gastos</p>
                </div>

                {params?.message && (
                    <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded relative text-center text-sm" role="alert">
                        <span className="block sm:inline">{params.message}</span>
                    </div>
                )}

                {params?.error && (
                    <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative text-center text-sm" role="alert">
                        <span className="block sm:inline">{params.error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full rounded-lg border-0 bg-gray-50 p-3 text-sm text-[#1D1D1F] ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-black focus:outline-hidden"
                                placeholder="Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full rounded-lg border-0 bg-gray-50 p-3 text-sm text-[#1D1D1F] ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-black focus:outline-hidden"
                                placeholder="Contraseña"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            formAction={login}
                            className="group relative flex w-full justify-center rounded-full bg-[#1D1D1F] px-4 py-3 text-sm font-medium text-white hover:bg-black focus:outline-hidden focus:ring-2 focus:ring-black focus:ring-offset-2 transition-transform active:scale-95"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        ¿No tienes cuenta?{' '}
                        <Link href="/signup" className="font-semibold text-[#1D1D1F] hover:text-black">
                            Registrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
