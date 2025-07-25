"use client";

import {
  createContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types";
import { rolePermissions } from "@/lib/permissions";

interface AuthError {
  message: string;
  code?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) {
        if (error.code === "PGRST116") {
          setError({
            message:
              "User profile not found. Please complete your registration.",
          });
        } else {
          throw error;
        }
        return;
      }
      setUser(data as User);
      setError(null);
    } catch (error: unknown) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String((error as { code: string }).code)
          : "unknown";

      setError({ message: "Failed to load user Profile", code });
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (err: unknown) {
        setError({ message: "Authentication initialization failed" });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      const errorMessage =
        {
          "Invalid login credentials": "Invalid email or password.",
          "Email not confirmed": "Please confirm your email before logging in.",
        }[error.message] || "Sign in failed.";
      setError({ message: errorMessage, code: error.code });
      return { error: { message: errorMessage, code: error.code } };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, userData: Partial<User>) => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setLoading(false);
        setError({ message: error.message, code: error.code });
        return { error: { message: error.message, code: error.code } };
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from("users")
          .insert({ id: data.user.id, email, ...userData });

        if (profileError) {
          setError({ message: profileError.message, code: profileError.code });
          return {
            error: { message: profileError.message, code: profileError.code },
          };
        }
      }
      setLoading(false);
      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const hasRole = useCallback((role: UserRole) => user?.role === role, [user]);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      const permissions = rolePermissions[user.role] ?? [];
      return permissions.includes(permission);
    },
    [user]
  );

  const clearError = () => setError(null);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      hasRole,
      hasPermission,
      clearError,
    }),
    [user, loading, error, signIn, signUp, signOut, hasRole, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
