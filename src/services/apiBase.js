/**
 * Shared API base URL helper.
 * Dev: leave VITE_API_BASE_URL unset — Vite proxies /api → localhost:5000.
 * Prod: set VITE_API_BASE_URL=http://your-backend:5000
 */
const configured = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export const API_BASE = configured

export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return configured ? `${configured}${normalized}` : normalized
}
