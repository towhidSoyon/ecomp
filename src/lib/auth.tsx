"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  type AuthMode,
} from "@/lib/auth-config";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface AuthContextValue {
  user: UserSession | null;
  loading: boolean;
  signIn: (email: string, password: string, mode?: AuthMode) => Promise<UserSession>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (data: Partial<Pick<UserSession, "name" | "email">>) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

function getStoredSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("shopflow-auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredSession(session: UserSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    window.localStorage.setItem("shopflow-auth", JSON.stringify(session));
  } else {
    window.localStorage.removeItem("shopflow-auth");
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<UserSession | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setUser(getStoredSession());
    setLoading(false);
  }, []);

  const refreshSession = React.useCallback(async () => {
    setUser(getStoredSession());
  }, []);

  const updateProfile = React.useCallback(async (data: Partial<Pick<UserSession, "name" | "email">>) => {
    const current = getStoredSession();
    if (!current) return;
    const updated: UserSession = { ...current, ...data };
    setUser(updated);
    setStoredSession(updated);
    toast.success("Profile updated");
  }, []);

  const signIn = React.useCallback(
    async (email: string, password: string, mode: AuthMode = "login") => {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      if (
        normalizedEmail === DEFAULT_ADMIN_EMAIL &&
        normalizedPassword === DEFAULT_ADMIN_PASSWORD
      ) {
        const session: UserSession = {
          id: "admin-default",
          name: "Admin User",
          email: DEFAULT_ADMIN_EMAIL,
          role: "admin",
        };
        setUser(session);
        setStoredSession(session);
        toast.success("Signed in as admin");
        return session;
      }

      if (mode === "signup") {
        const session: UserSession = {
          id: `user-${Date.now()}`,
          name: normalizedEmail.split("@")[0],
          email: normalizedEmail,
          role: "user",
        };
        setUser(session);
        setStoredSession(session);
        toast.success("Account created");
        return session;
      }

      const storedSession = getStoredSession();
      if (storedSession?.email === normalizedEmail) {
        setUser(storedSession);
        setStoredSession(storedSession);
        toast.success("Welcome back");
        return storedSession;
      }

      throw new Error(
        "No account found. Please sign up first or use an existing account."
      );
    },
    []
  );

  const signOut = React.useCallback(async () => {
    setUser(null);
    setStoredSession(null);
    toast.success("Signed out");
    router.push("/");
  }, [router]);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signOut, refreshSession, updateProfile }),
    [user, loading, signIn, signOut, refreshSession, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
