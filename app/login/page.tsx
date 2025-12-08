import Link from 'next/link'
import { login, loginWithGoogle } from '../auth/actions'

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

                        <div className="relative flex items-center justify-center my-4">
                            <div className="border-t border-gray-200 w-full absolute"></div>
                            <span className="bg-[#F5F5F7] px-2 text-xs text-gray-500 relative z-10">O continuar con</span>
                        </div>

                        <button
                            formAction={loginWithGoogle}
                            formNoValidate
                            className="group relative flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-[#1D1D1F] border border-gray-200 hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-transform active:scale-95"
                        >
                            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
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
