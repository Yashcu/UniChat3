"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/types";
import { BookOpen, Users, Calendar, MoreVertical } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CourseCardProps {
  course: Course & {
    teacher?: {
      first_name: string | null;
      last_name: string | null;
    };
    _count?: {
      enrollments: number;
      assignments: number;
    };
  };
  onEdit?: (course: Course) => void;
  onDelete?: (courseId: string) => void;
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const isOwnCourse = user?.id === course.teacher_id;

  const getStatusColor = (semester: string | null) => {
    if (!semester) return "bg-gray-100 text-gray-800";

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (semester?.includes(currentYear.toString())) {
      if (currentMonth >= 1 && currentMonth <= 5) {
        return semester.includes("Spring")
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800";
      } else if (currentMonth >= 8 && currentMonth <= 12) {
        return semester.includes("Fall")
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800";
      }
    }

    return "bg-blue-100 text-blue-800";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold leading-none">
              {course.name}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {course.code}
              </Badge>
              <Badge className={`text-xs ${getStatusColor(course.semester)}`}>
                {course.semester || "No Semester"}
              </Badge>
            </div>
          </div>

          {isTeacher && isOwnCourse && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>

        {course.description && (
          <CardDescription className="text-sm mt-2">
            {course.description.length > 100
              ? `${course.description.substring(0, 100)}...`
              : course.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Course Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course._count?.enrollments || 0} students</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>{course._count?.assignments || 0} assignments</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{course.credits} credits</span>
            </div>
          </div>

          {/* Teacher Info */}
          {course.teacher && !isOwnCourse && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Instructor:</span>{" "}
              {course.teacher.first_name} {course.teacher.last_name}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Link href={`/courses/${course.id}`} className="flex-1">
              <Button variant="default" size="sm" className="w-full">
                View Course
              </Button>
            </Link>

            {isTeacher && isOwnCourse && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(course)}
                >
                  Edit
                </Button>
                <Link href={`/courses/${course.id}/assignments/create`}>
                  <Button variant="secondary" size="sm">
                    New Assignment
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
