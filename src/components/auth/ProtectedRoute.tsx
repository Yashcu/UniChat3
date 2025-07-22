"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "student" | "teacher" | "administrator";
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  console.log("🛡️ ProtectedRoute check:", {
    hasUser: !!user,
    loading,
    userRole: user?.role,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("🔄 No user - redirecting to login");
        router.push(redirectTo);
        return;
      }
      console.log("✅ User authenticated:", user.email);

      if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        router.push("/dashboard");
        return;
      }
    }
  }, [user, loading, router, requiredRole, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
