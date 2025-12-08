import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Gastos Hormiga',
        short_name: 'Gastos',
        description: 'Zen Micro-expense Tracker',
        start_url: '/',
        display: 'standalone',
        background_color: '#FAFAFA',
        theme_color: '#FAFAFA',
        orientation: 'portrait',
        icons: [
            {
                src: '/icon',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/apple-icon',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
    }
}
