"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/lib/api";
import {
  BookOpen,
  FileText,
  Users,
  Calendar,
  AlertCircle,
  Bell,
} from "lucide-react";
import { DashboardStats, UserRole, Activity } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface StatCardData {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const cardDefinitions = {
  courses: (count: number, title: string): StatCardData => ({
    title,
    value: count,
    icon: BookOpen,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  }),
  assignments: (count: number, title: string): StatCardData => ({
    title,
    value: count,
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  }),
  events: (count: number): StatCardData => ({
    title: "Today's Events",
    value: count,
    icon: Calendar,
    color: "text-green-600",
    bgColor: "bg-green-50",
  }),
  students: (count: number): StatCardData => ({
    title: "Total Students",
    value: count,
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  }),
};

const getStatsCards = (
  role: UserRole,
  stats: DashboardStats
): StatCardData[] => {
  if (role === UserRole.Student) {
    return [
      cardDefinitions.courses(stats.totalCourses, "Enrolled Courses"),
      cardDefinitions.assignments(
        stats.pendingAssignments,
        "Pending Assignments"
      ),
      cardDefinitions.events(stats.todayEvents),
    ];
  }
  // Teacher role
  return [
    cardDefinitions.courses(stats.totalCourses, "My Courses"),
    cardDefinitions.students(stats.totalStudents),
    cardDefinitions.assignments(
      stats.pendingAssignments,
      "Assignments Created"
    ),
  ];
};

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 bg-muted rounded w-24 animate-pulse" />
      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-muted rounded w-16 animate-pulse" />
    </CardContent>
  </Card>
);

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const serviceCall =
        user.role === "student"
          ? dashboardService.getStudentDashboardData(user.id)
          : dashboardService.getTeacherDashboardData(user.id);
      const { data, error } = await serviceCall;
      if (error) throw new Error(error.message);
      setStats(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to load dashboard data.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadActivities = useCallback(async () => {
    if (!user) return;
    setActivitiesLoading(true);
    try {
      // NOTE: This assumes a new service method `getRecentActivity` exists.
      const { data, error } = await dashboardService.getRecentActivity(user.id);
      if (error) throw new Error(error.message);
    } catch (err) {
      // For this card, we'll just log the error and show an empty state.
      console.error("Failed to load recent activity:", err);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
    loadActivities();
  }, [loadDashboardData, loadActivities]);

  const statsCards = useMemo(() => {
    if (!user || !stats) return [];
    return getStatsCards(user.role, stats);
  }, [user, stats]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s what&apos;s happening with your academic activities
            today.
          </p>
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="flex items-center space-x-2 p-4">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-destructive font-medium">
                  Error loading dashboard data
                </p>
                <p className="text-destructive/80 text-sm">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))
            : statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <div
                        className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center`}
                      >
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <ul className="space-y-4">
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-start space-x-4">
                    <div className="bg-secondary text-secondary-foreground rounded-full p-2">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-snug">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground pt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity to display.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
