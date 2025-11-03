import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';

const appName = import.meta.env.VITE_APP_NAME || 'Logistics Panel';

// Force clear old service workers and caches - VERSION 1.0.1
// This will run once to clear old cached API responses
const APP_VERSION = '1.0.1';
const VERSION_KEY = 'app_version';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        const currentVersion = localStorage.getItem(VERSION_KEY);

        // Force clear if version changed
        if (currentVersion !== APP_VERSION) {
            console.log('Version changed, clearing caches...');

            // Unregister all old service workers
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }

            // Clear all caches
            const cacheNames = await caches.keys();
            for (const cacheName of cacheNames) {
                await caches.delete(cacheName);
            }

            // Update version
            localStorage.setItem(VERSION_KEY, APP_VERSION);
            console.log('Caches cleared, reloading...');

            // Reload to ensure fresh content
            window.location.reload(true);
            return;
        }

        // Register new service worker
        const swPath = import.meta.env.PROD ? '/build/sw.js' : '/sw.js';

        navigator.serviceWorker.register(swPath, { scope: '/' })
            .then(registration => {
                console.log('SW registered:', registration);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            if (confirm('New version available. Reload to update?')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                localStorage.removeItem(VERSION_KEY); // Force cache clear on next load
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch(error => {
                console.error('SW registration failed:', error);
            });

        // Handle controller change
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    });
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <App {...props} />
            </ThemeProvider>
        );
    },
    progress: {
        color: '#1976d2',
    },
});
