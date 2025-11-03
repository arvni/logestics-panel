import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Function to get CSRF token from meta tag
const getCsrfToken = () => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    if (token) {
        return token.content;
    }
    console.error('CSRF token not found');
    return null;
};

// Set CSRF token
const token = getCsrfToken();
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}

// Add request interceptor to ensure CSRF token is always included
window.axios.interceptors.request.use(
    (config) => {
        const currentToken = getCsrfToken();
        if (currentToken) {
            config.headers['X-CSRF-TOKEN'] = currentToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
