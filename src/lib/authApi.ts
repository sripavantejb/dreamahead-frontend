import { API_BASE } from "./api";

const getToken = () => localStorage.getItem("auth_token");

function getHeaders(includeAuth = false): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (includeAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export type AuthUser = {
  id: string;
  email: string;
  phone: string;
  full_name: string | null;
  role: "user" | "admin";
  createdAt: string;
};

export type HeroLead = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  source: string;
  createdAt: string;
};

export type TestingUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string;
  role: string;
  created_at: string;
};

export type TestingData = {
  heroLeads: HeroLead[];
  users: TestingUser[];
};

export const authApi = {
  async signup(body: { email: string; phone: string; password: string; full_name?: string }) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Sign up failed");
    return data as { token: string; user: AuthUser };
  },

  async login(body: { emailOrPhone: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data as { token: string; user: AuthUser };
  },

  async me(): Promise<AuthUser | null> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(true),
    });
    if (res.status === 401) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to get user");
    return (data as { user: AuthUser }).user;
  },

  async listUsers(): Promise<{ id: string; full_name: string | null; email: string | null; phone: string; created_at: string }[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(true),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to load users");
    return (data as { users: { id: string; full_name: string | null; email: string | null; phone: string; created_at: string }[] }).users;
  },

  /** Public API – no JWT or authentication required. */
  async getTestingData(): Promise<TestingData> {
    const res = await fetch(`${API_BASE}/testing`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = (await res.json().catch(() => ({}))) as TestingData & { error?: string };
    if (!res.ok) {
      return { heroLeads: data?.heroLeads ?? [], users: data?.users ?? [] };
    }
    return { heroLeads: data?.heroLeads ?? [], users: data?.users ?? [] };
  },

  getToken,
  setToken(token: string) {
    localStorage.setItem("auth_token", token);
  },
  clearToken() {
    localStorage.removeItem("auth_token");
  },
};
