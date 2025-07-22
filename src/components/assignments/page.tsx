"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { assignmentService } from "@/lib/api";
import { Assignment } from "@/types";
import { Plus, Search, Filter, FileText } from "lucide-react";

function AssignmentsContent() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    loadAssignments();
  }, [user]);

  const loadAssignments = async () => {
    if (!user) return;

    try {
      let data: Assignment[] = [];
      if (user.role === "student") {
        data = await assignmentService.getStudentAssignments(user.id);
      } else if (user.role === "teacher") {
        data = await assignmentService.getTeacherAssignments(user.id);
      }
      setAssignments(data);
    } catch (error) {
      console.error("Error loading assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAssignments = () => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === "all" || assignment.assignment_type === filterType;

      let matchesStatus = true;
      if (filterStatus !== "all") {
        const now = new Date();
        const dueDate = assignment.due_date
          ? new Date(assignment.due_date)
          : null;

        switch (filterStatus) {
          case "upcoming":
            matchesStatus = dueDate ? dueDate > now : true;
            break;
          case "overdue":
            matchesStatus = dueDate ? dueDate < now : false;
            break;
          case "submitted":
            // This would need submission data
            matchesStatus = false; // Placeholder
            break;
        }
      }

      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const filteredAssignments = getFilteredAssignments();
  const assignmentTypes = [
    ...new Set(assignments.map((a) => a.assignment_type)),
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
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
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
              {user?.role === "student"
                ? "My Assignments"
                : "Created Assignments"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === "student"
                ? "Track and submit your course assignments"
                : "Manage assignments for your courses"}
            </p>
          </div>

          {user?.role === "teacher" && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
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

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
              <option value="submitted">Submitted</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No assignments found
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchTerm || filterStatus !== "all" || filterType !== "all"
                  ? "No assignments match your search criteria. Try adjusting your filters."
                  : user?.role === "student"
                    ? "You don't have any assignments yet. Check back later as your instructors add new assignments."
                    : "You haven't created any assignments yet. Click 'Create Assignment' to get started."}
              </p>
              {user?.role === "teacher" &&
                !searchTerm &&
                filterStatus === "all" &&
                filterType === "all" && (
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Assignment
                  </Button>
                )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onSubmit={(assignmentId) => {
                  console.log("Submit assignment:", assignmentId);
                  // Handle assignment submission
                }}
                onEdit={(assignment) => {
                  console.log("Edit assignment:", assignment);
                  // Handle assignment editing
                }}
              />
            ))}
          </div>
        )}

        {/* Assignment Statistics */}
        {filteredAssignments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {filteredAssignments.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Assignments
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {
                    filteredAssignments.filter((a) => {
                      // This would check submission status - placeholder for now
                      return false;
                    }).length
                  }
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {
                    filteredAssignments.filter((a) => {
                      const dueDate = a.due_date ? new Date(a.due_date) : null;
                      return dueDate && dueDate > new Date();
                    }).length
                  }
                </div>
                <div className="text-xs text-muted-foreground">Upcoming</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {
                    filteredAssignments.filter((a) => {
                      const dueDate = a.due_date ? new Date(a.due_date) : null;
                      return dueDate && dueDate < new Date();
                    }).length
                  }
                </div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </CardContent>
            </Card>
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
