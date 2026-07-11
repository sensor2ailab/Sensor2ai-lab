"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser } from "@/lib/api-types";

const API = "/api/v1";

type Status = "loading" | "authed" | "anon";

interface LoginResult {
  user: SessionUser;
}

interface AuthContextValue {
  user: SessionUser | null;
  status: Status;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  // Fetch against the API with the in-memory access token; retries once after a
  // silent refresh if the token has expired.
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Reads the error envelope and throws a plain Error with the server message.
async function failFrom(res: Response): Promise<never> {
  let message = `Request failed (${res.status})`;
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    if (body?.error?.message) message = body.error.message;
  } catch {
    // non-JSON body, keep the default message
  }
  throw new Error(message);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  // Access token lives only in memory (never localStorage) to limit XSS exposure;
  // the httpOnly refresh cookie is what survives reloads.
  const tokenRef = useRef<string | null>(null);

  const setSession = useCallback((token: string, nextUser: SessionUser) => {
    tokenRef.current = token;
    setUser(nextUser);
    setStatus("authed");
  }, []);

  const clearSession = useCallback(() => {
    tokenRef.current = null;
    setUser(null);
    setStatus("anon");
  }, []);

  // Try to mint a fresh access token from the refresh cookie. Returns the token
  // or null when there is no valid session.
  const refresh = useCallback(async (): Promise<string | null> => {
    const res = await fetch(`${API}/auth/refresh`, { method: "POST" });
    if (!res.ok) return null;
    // Anonymous visitors get a 200 with a null user (no session to restore).
    const body = (await res.json()) as { accessToken?: string; user: SessionUser | null };
    if (!body.user || !body.accessToken) return null;
    setSession(body.accessToken, body.user);
    return body.accessToken;
  }, [setSession]);

  // Restore the session once on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      const token = await refresh();
      if (active && !token) setStatus("anon");
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  const authFetch = useCallback(
    async (path: string, init: RequestInit = {}): Promise<Response> => {
      const withAuth = (token: string | null): RequestInit => ({
        ...init,
        headers: {
          ...(init.headers ?? {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let res = await fetch(`${API}${path}`, withAuth(tokenRef.current));
      if (res.status === 401) {
        const token = await refresh();
        if (token) res = await fetch(`${API}${path}`, withAuth(token));
        else clearSession();
      }
      return res;
    },
    [refresh, clearSession],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) await failFrom(res);
      const body = (await res.json()) as { accessToken: string; user: SessionUser };
      setSession(body.accessToken, body.user);
      return { user: body.user };
    },
    [setSession],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      const res = await authFetch("/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) await failFrom(res);
      const body = (await res.json()) as { accessToken: string; user: SessionUser };
      setSession(body.accessToken, body.user);
    },
    [authFetch, setSession],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST" });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAdmin: user?.role === "admin",
      login,
      changePassword,
      logout,
      authFetch,
    }),
    [user, status, login, changePassword, logout, authFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
