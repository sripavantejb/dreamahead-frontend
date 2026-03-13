/**
 * API base URL for the backend. In dev we use /api (Vite proxy) to avoid CORS.
 * In production we use the deployed backend (Vercel). Set VITE_API_URL to override.
 */
const PRODUCTION_BACKEND = "https://dreamahead-backend.vercel.app/api";
const envUrl = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, "");
export const API_BASE =
  envUrl || (import.meta.env.DEV ? "/api" : PRODUCTION_BACKEND);
