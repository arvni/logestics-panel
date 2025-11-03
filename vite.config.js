import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: null, // Manual registration in app.jsx
            devOptions: {
                enabled: true,
                type: 'module'
            },
            includeAssets: ['favicon.ico', 'robots.txt', 'pwa-192x192.svg', 'pwa-512x512.svg'],
            manifest: {
                name: 'Logistics Panel - Sample Collection Management',
                short_name: 'Logistics',
                description: 'Biological sample collection management system with GPS tracking and temperature monitoring',
                version: '1.0.1',
                start_url: '/',
                scope: '/',
                theme_color: '#1976d2',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: '/pwa-192x192.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    },
                    {
                        src: '/pwa-512x512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    },
                    {
                        src: '/pwa-192x192.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'maskable'
                    },
                    {
                        src: '/pwa-512x512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'maskable'
                    }
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,ico,png,svg,jpg,jpeg}'], // Exclude HTML to prevent CSRF token caching
                navigateFallback: null, // Disable for Laravel server-side routing
                runtimeCaching: [
                    {
                        // Never cache HTML - always fetch fresh to get new CSRF tokens
                        urlPattern: ({ request }) => request.mode === 'navigate',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'pages-cache',
                            networkTimeoutSeconds: 5,
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 86400, // 24 hours
                            },
                        },
                    },
                    {
                        // Never cache API routes - always use network only to ensure CSRF tokens work
                        urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
                        handler: 'NetworkOnly',
                    },
                    {
                        urlPattern: /^https:\/\/api\./,
                        handler: 'NetworkOnly',
                    },
                ],
                // Don't cache anything that contains these patterns
                navigateFallbackDenylist: [/^\/api\//],
            },
        }),
    ],
});
