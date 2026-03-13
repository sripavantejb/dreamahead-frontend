/**
 * Stub client – Supabase has been removed.
 * All methods return empty data so existing code continues to run without the dependency.
 */
import type { Database } from "./types";

const empty = { data: null as unknown, error: null as Error | null };
const emptyList = { data: [] as unknown[], error: null as Error | null };

function thenable<T>(result: { data: T; error: Error | null }) {
  const t = {
    then: (onfulfilled: (v: typeof result) => unknown) => Promise.resolve(result).then(onfulfilled),
    eq: () => t,
    neq: () => t,
    order: () => t,
    single: () => thenable({ ...result, data: result.data instanceof Array ? result.data[0] ?? null : result.data }),
    maybeSingle: () => thenable({ ...result, data: result.data instanceof Array ? result.data[0] ?? null : result.data }),
  };
  return t;
}

const stubTable = () => ({
  select: (_cols?: string) => thenable(emptyList),
  insert: (_row: unknown) => thenable(empty),
  update: (_row: unknown) => ({ eq: () => thenable(empty) }),
  delete: () => ({ eq: () => thenable(empty), neq: () => thenable(empty) }),
  upsert: (_row: unknown) => thenable(empty),
});

const stubAuth = {
  getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  signInAnonymously: () => Promise.resolve({ data: { user: null }, error: null }),
  signInWithOtp: (_opts: unknown) => Promise.resolve({ data: {}, error: null }),
  verifyOtp: (_opts: unknown) => Promise.resolve({ data: { user: null }, error: null }),
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
};

const stubStorage = {
  from: (_bucket: string) => ({
    upload: (_path: string, _file: unknown) => Promise.resolve({ data: { path: "" }, error: null }),
    getPublicUrl: (_path: string) => ({ data: { publicUrl: "" } }),
    remove: (_paths: string[]) => Promise.resolve({ data: null, error: null }),
  }),
};

function createStubClient(): Database & {
  auth: typeof stubAuth;
  from: (table: string) => ReturnType<typeof stubTable>;
  storage: typeof stubStorage;
  rpc: (fn: string, _args?: object) => Promise<{ data: unknown; error: Error | null }>;
} {
  return {
    auth: stubAuth,
    from: () => stubTable(),
    storage: stubStorage,
    rpc: () => Promise.resolve(empty),
  } as unknown as ReturnType<typeof createStubClient>;
}

export const supabase = createStubClient();
