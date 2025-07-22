"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courseService } from "@/lib/api";
import { Course } from "@/types";
import { Plus, Search, Filter, BookOpen } from "lucide-react";

function CoursesContent() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;

    try {
      let data: Course[] = [];
      if (user.role === "student") {
        data = await courseService.getEnrolledCourses(user.id);
      } else if (user.role === "teacher") {
        data = await courseService.getTeacherCourses(user.id);
      }
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester =
      filterSemester === "all" || course.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  // Fix for null values in semester filtering
  const semesters = [
    ...new Set(
      courses
        .map((c) => c.semester)
        .filter((semester): semester is string => semester !== null)
    ),
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-muted rounded w-48 animate-pulse" />
            <div className="h-10 bg-muted rounded w-32 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {user?.role === "student" ? "My Courses" : "Teaching Courses"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === "student"
                ? "Access your enrolled courses and assignments"
                : "Manage your courses and create assignments"}
            </p>
          </div>

          {user?.role === "teacher" && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              type="search"
              placeholder="Search courses by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All Semesters</option>
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchTerm
                  ? "No courses match your search criteria. Try adjusting your search terms."
                  : user?.role === "student"
                    ? "You haven't enrolled in any courses yet. Contact your advisor to get started."
                    : "You haven't created any courses yet. Click 'Create Course' to get started."}
              </p>
              {user?.role === "teacher" && !searchTerm && (
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={(course) => {
                  // Handle edit course
                  console.log("Edit course:", course);
                }}
                onDelete={(courseId) => {
                  // Handle delete course
                  console.log("Delete course:", courseId);
                }}
              />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredCourses.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredCourses.reduce(
                    (sum, course) => sum + course.credits,
                    0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Semesters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{semesters.length}</div>
              </CardContent>
            </Card>
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
