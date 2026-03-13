import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

const env = import.meta.env as Record<string, string | undefined>;
const missingVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"].filter(
  (key) => !env[key],
);

if (missingVars.length > 0) {
  console.error(
    `[Config] Missing required environment variables: ${missingVars.join(", ")}. ` +
      "Add them in your deployment provider and redeploy.",
  );
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,-apple-system,sans-serif;padding:24px;background:#f8fafc;color:#0f172a;">
      <div style="max-width:560px;background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 4px 20px rgba(2,6,23,.06);">
        <h1 style="font-size:20px;margin:0 0 10px 0;">Configuration error</h1>
        <p style="margin:0 0 10px 0;line-height:1.5;">
          Missing environment variables: <strong>${missingVars.join(", ")}</strong>.
        </p>
        <p style="margin:0;line-height:1.5;">
          Set these in your hosting dashboard (for example Vercel Project Settings → Environment Variables),
          then redeploy.
        </p>
      </div>
    </div>
  `;
} else {
  createRoot(root).render(<App />);
}
