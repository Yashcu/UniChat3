"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";
import { courseService } from "@/lib/api";
import { Course } from "@/types";

function CoursesContent() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher";

  const loadCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response =
        user.role === "student"
          ? await courseService.getEnrolledCourses(user.id)
          : await courseService.getTeacherCourses(user.id);
      if (response.error) throw new Error(response.error.message);
      setCourses(response.data ?? []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  if (loading) {
    return (
      <MainLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {user?.role === "student" ? "My Courses" : "Courses You Teach"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === "student"
                ? "Browse and manage your enrolled courses"
                : "Manage the courses you are teaching"}
            </p>
          </div>
          {user?.role === "teacher" && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          )}
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="flex items-center space-x-2 p-4">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-destructive font-medium">
                  Error loading courses
                </p>
                <p className="text-destructive/80 text-sm">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadCourses}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {!error && courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No courses found</h3>
              <p className="text-muted-foreground max-w-sm">
                {user?.role === "student"
                  ? "You are not enrolled in any courses yet."
                  : "You have not created any courses yet."}
              </p>
              {user?.role === "teacher" && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function CoursesPage() {
  return (
    <ProtectedRoute>
      <CoursesContent />
    </ProtectedRoute>
  );
}
