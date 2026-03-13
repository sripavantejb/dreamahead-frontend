/**
 * API base URL for the backend. Uses deployed backend (dreamahead-backend.vercel.app) by default.
 * Set VITE_API_URL to override (e.g. "http://localhost:3002/api" for local backend).
 */
const DEPLOYED_BACKEND = "https://dreamahead-backend.vercel.app/api";
const envUrl = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, "");
export const API_BASE =
  envUrl || (import.meta.env.DEV ? "/api" : DEPLOYED_BACKEND);
