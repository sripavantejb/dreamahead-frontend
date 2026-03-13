/**
 * Reusable auth gate: if user is anonymous, show toast and redirect to login with return path.
 * Returns false if redirect happened; true if user is logged in and can proceed.
 */
import type { NavigateFunction } from "react-router-dom";

type ToastFn = (opts: {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}) => void;

export function requireLogin(
  isAnonymous: boolean,
  navigate: NavigateFunction,
  toast: ToastFn,
  fromPath: string
): boolean {
  if (isAnonymous) {
    toast({
      title: "Log in required",
      description: "Please log in to continue with the test.",
      variant: "destructive",
    });
    navigate("/login", { state: { from: fromPath } });
    return false;
  }
  return true;
}
