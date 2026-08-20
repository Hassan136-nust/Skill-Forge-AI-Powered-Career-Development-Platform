// Centralized API Configuration for Local Dev & Production (Vercel/Render)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '')
export const API_URL = `${API_BASE_URL}/api`
