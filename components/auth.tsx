"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { cloud } from "@/lib/cloud";
import { isCloudEnabled } from "@/lib/supabase";
import { syncAfterLogin } from "@/lib/sync";
import { login as doLogin, register as doRegister, type AuthResult, type User } from "@/lib/users";

const SESSION_KEY = "pf:session";

let session: User | null = null;
const listeners = new Set<() => void>();

function read(): User | null {
  if (typeof window === "undefined") return null;
  if (session) return session;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    session = JSON.parse(raw);
  } catch {
    session = null;
  }
  return session;
}

function commit(u: User | null) {
  session = u;
  if (typeof window !== "undefined") {
    if (u) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      store.setProfile({ name: u.name, email: u.email });
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const AuthCtx = createContext<{
  user: User | null;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (data: Parameters<typeof doRegister>[0]) => Promise<AuthResult>;
  logout: () => void;
}>({ user: null, login: async () => ({ ok: false }), register: async () => ({ ok: false }), logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, read, () => null);

  async function login(username: string, password: string): Promise<AuthResult> {
    const res = doLogin(username, password);
    if (!res.ok || !res.user) return res;

    if (isCloudEnabled()) {
      const cloudRes = await cloud.login(res.user.email, password);
      if (!cloudRes.ok) return { ok: false, error: `Could not reach the cloud. ${cloudRes.error || ""}` };
      try {
        await syncAfterLogin(res.user.name);
      } catch (e) {
        console.warn("[auth] sync failed", e);
      }
    }

    commit(res.user);
    return res;
  }

  async function register(data: Parameters<typeof doRegister>[0]): Promise<AuthResult> {
    const res = doRegister(data);
    if (!res.ok || !res.user) return res;

    if (isCloudEnabled()) {
      const cloudRes = await cloud.register(res.user.email, data.password);
      if (!cloudRes.ok) return { ok: false, error: `Could not create cloud account. ${cloudRes.error || ""}` };
      try {
        await syncAfterLogin(res.user.name);
      } catch (e) {
        console.warn("[auth] sync failed", e);
      }
    }

    commit(res.user);
    return res;
  }

  function logout() {
    if (isCloudEnabled()) cloud.signOut().catch(() => {});
    commit(null);
  }

  return <AuthCtx.Provider value={{ user, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;
  return <>{children}</>;
}
