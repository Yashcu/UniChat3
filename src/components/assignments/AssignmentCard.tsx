"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Assignment } from "@/types";
import { Calendar, Clock, FileText, Users, CheckCircle } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface AssignmentCardProps {
  assignment: Assignment & {
    course?: {
      name: string;
      code: string;
    };
    submission?: {
      id: string;
      status: string;
      submitted_at: string;
      score: number | null;
    };
  };
  onSubmit?: (assignmentId: string) => void;
  onEdit?: (assignment: Assignment) => void;
}

export function AssignmentCard({
  assignment,
  onSubmit,
  onEdit,
}: AssignmentCardProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const isOwnAssignment = user?.id === assignment.teacher_id;

  const getDueStatus = () => {
    if (!assignment.due_date)
      return {
        status: "no-due-date",
        color: "bg-gray-100 text-gray-800",
        text: "No Due Date",
      };

    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // ✅ Fixed: Check if submission exists before accessing its properties
    if (assignment.submission && assignment.submission.status === "submitted") {
      return {
        status: "submitted",
        color: "bg-green-100 text-green-800",
        text: "Submitted",
      };
    }

    if (timeDiff < 0) {
      return {
        status: "overdue",
        color: "bg-red-100 text-red-800",
        text: "Overdue",
      };
    } else if (daysDiff <= 1) {
      return {
        status: "due-soon",
        color: "bg-orange-100 text-orange-800",
        text: "Due Soon",
      };
    } else if (daysDiff <= 7) {
      return {
        status: "due-this-week",
        color: "bg-yellow-100 text-yellow-800",
        text: "Due This Week",
      };
    } else {
      return {
        status: "upcoming",
        color: "bg-blue-100 text-blue-800",
        text: "Upcoming",
      };
    }
  };

  const getTypeColor = (type: string) => {
    const typeColors = {
      homework: "bg-blue-100 text-blue-800",
      quiz: "bg-purple-100 text-purple-800",
      exam: "bg-red-100 text-red-800",
      project: "bg-green-100 text-green-800",
      lab: "bg-orange-100 text-orange-800",
    };
    return (
      typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"
    );
  };

  const dueStatus = getDueStatus();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold leading-none">
              {assignment.title}
            </CardTitle>
            <div className="flex items-center flex-wrap gap-2">
              {assignment.course && (
                <Badge variant="outline" className="text-xs">
                  {assignment.course.code}
                </Badge>
              )}
              <Badge
                className={`text-xs ${getTypeColor(assignment.assignment_type)}`}
              >
                {assignment.assignment_type}
              </Badge>
              <Badge className={`text-xs ${dueStatus.color}`}>
                {dueStatus.text}
              </Badge>
            </div>
          </div>

          {/* ✅ Fixed: Check if submission exists and has a score before displaying */}
          {assignment.submission?.score !== null &&
            assignment.submission?.score !== undefined && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {assignment.submission.score}
                </div>
                <div className="text-xs text-muted-foreground">
                  / {assignment.max_score}
                </div>
              </div>
            )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Assignment Details */}
        <div className="space-y-2">
          {assignment.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {assignment.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>Max Score: {assignment.max_score}</span>
              </div>
              {assignment.due_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Due: {formatDate(assignment.due_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Fixed: Submission Status for Students */}
        {!isTeacher && (
          <div className="border-t pt-3">
            {assignment.submission ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Submitted{" "}
                    {formatDateTime(assignment.submission.submitted_at)}
                  </span>
                </div>
                {/* ✅ Fixed: Check if score exists before displaying badge */}
                {assignment.submission.score !== null &&
                  assignment.submission.score !== undefined && (
                    <Badge variant="secondary">
                      Graded: {assignment.submission.score}/
                      {assignment.max_score}
                    </Badge>
                  )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Not submitted
                </span>
                <Button
                  size="sm"
                  onClick={() => onSubmit?.(assignment.id)}
                  disabled={dueStatus.status === "overdue"}
                >
                  Submit Assignment
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Teacher Actions */}
        {isTeacher && isOwnAssignment && (
          <div className="border-t pt-3 flex space-x-2">
            <Link
              href={`/assignments/${assignment.id}/submissions`}
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                View Submissions
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit?.(assignment)}
            >
              Edit
            </Button>
          </div>
        )}

        {/* View Assignment Button */}
        <div className="border-t pt-3">
          <Link href={`/assignments/${assignment.id}`}>
            <Button variant="default" size="sm" className="w-full">
              View Assignment Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
