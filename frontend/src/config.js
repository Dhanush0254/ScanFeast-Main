// You will update this URL after deploying the backend in Phase 2
const PROD_API_URL = import.meta.env.VITE_API_URL || "https://scanfeast-main.onrender.com"; 
const PROD_SOCKET_URL = import.meta.env.VITE_API_URL || "https://scanfeast-main.onrender.com";;

// Development URLs (localhost)
const DEV_API_URL = 'http://localhost:5000';
const DEV_SOCKET_URL = 'http://localhost:5000';

// Auto-detect environment based on hostname
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

export const API_URL = isProduction ? PROD_API_URL : DEV_API_URL;
export const SOCKET_URL = isProduction ? PROD_SOCKET_URL : DEV_SOCKET_URL;
