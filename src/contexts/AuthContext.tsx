"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    console.log("Auth state check:", { user: !!user, loading });
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("📱 Session check:", {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
      });
      if (session?.user) {
        console.log("👤 Fetching profile for:", session.user.id);
        fetchUserProfile(session.user.id);
      } else {
        console.log("❌ No session found");
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No user profile found - this is the likely issue
          console.error(
            "User profile not found. User needs to complete registration."
          );
          // Optionally redirect to profile completion page
          return;
        }
        throw error;
      }

      setUser(data as User);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Log more details for debugging
      console.error("User ID:", userId);
      console.error("Full error object:", JSON.stringify(error, null, 2));
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };

      // Only create profile if user is immediately confirmed
      if (data.user && data.session) {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          role: userData.role || "student",
          university_id: "00000000-0000-0000-0000-000000000001",
          first_name: userData.first_name,
          last_name: userData.last_name,
          student_id: userData.student_id,
          department: userData.department,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          return { error: profileError as Error };
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Define role hierarchy
    const rolePermissions = {
      administrator: [
        "read",
        "write",
        "delete",
        "manage_users",
        "view_analytics",
        "system_config",
      ],
      teacher: [
        "read",
        "write",
        "manage_courses",
        "grade_assignments",
        "view_student_progress",
      ],
      student: ["read", "submit_assignments", "join_courses", "view_grades"],
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
