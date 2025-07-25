"use client";

import { useCallback, useEffect, useMemo, useState, ChangeEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { assignmentService } from "@/lib/api";
import { Assignment, UserRole } from "@/types";
import { Plus, Search, Filter, FileText, AlertCircle } from "lucide-react";

const FILTER_STATUSES = ["all", "upcoming", "overdue", "submitted"] as const;

function AssignmentsContent() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<(typeof FILTER_STATUSES)[number]>("all");
  const [filterType, setFilterType] = useState("all");

  const isTeacher = user?.role === UserRole.Teacher;
  const isStudent = user?.role === UserRole.Student;

  const loadAssignments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = isStudent
        ? await assignmentService.getStudentAssignmentsWithError(user.id)
        : await assignmentService.getTeacherAssignmentsWithError(user.id);
      if (result.error) throw new Error(result.error.message);
      setAssignments(result.data ?? []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to load assignments.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [user, isStudent]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const assignmentTypes = useMemo(() => {
    const types = assignments
      .map((a) => a.assignment_type)
      .filter((type): type is string => !!type);
    return [...new Set(types)];
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    const now = new Date();
    return assignments.filter((assignment: Assignment) => {
      const matchesSearch = assignment.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === "all" || assignment.assignment_type === filterType;

      // Status filter only applies to students
      if (!isStudent) {
        return matchesSearch && matchesType;
      }

      // Assuming assignment has `due_date` and `submission_date` properties.
      const dueDate = assignment.due_date
        ? new Date(assignment.due_date)
        : null;
      const isSubmitted = !!assignment.submission_date;

      switch (filterStatus) {
        case "upcoming":
          return (
            matchesSearch &&
            matchesType &&
            !isSubmitted &&
            dueDate &&
            dueDate >= now
          );
        case "overdue":
          return (
            matchesSearch &&
            matchesType &&
            !isSubmitted &&
            dueDate &&
            dueDate < now
          );
        case "submitted":
          return matchesSearch && matchesType && isSubmitted;
        default: // 'all'
          return matchesSearch && matchesType;
      }
    });
  }, [assignments, searchTerm, filterType, filterStatus, isStudent]);

  if (loading) {
    return (
      <MainLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  const pageContent = {
    title: isStudent ? "My Assignments" : "Created Assignments",
    description: isStudent
      ? "Track and submit your course assignments"
      : "Manage assignments for your courses",
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{pageContent.title}</h1>
            <p className="text-muted-foreground mt-2">
              {pageContent.description}
            </p>
          </div>
          {isTeacher && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          )}
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="flex items-center space-x-2 p-4">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-destructive font-medium">
                  Error loading assignments
                </p>
                <p className="text-destructive/80 text-sm">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadAssignments}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              type="search"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center">
              <Filter className="absolute left-3 w-4 h-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFilterStatus(e.target.value as typeof filterStatus)
                }
                className="h-10 rounded-md border border-input bg-background pl-9 pr-8 text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isStudent}
              >
                {FILTER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
            >
              <option value="all">All Types</option>
              {assignmentTypes.map((type) => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!error && filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-8 h-8 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No assignments found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                No assignments match your search criteria. Try adjusting your
                filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function AssignmentsPage() {
  return (
    <ProtectedRoute>
      <AssignmentsContent />
    </ProtectedRoute>
  );
}
