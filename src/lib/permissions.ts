import { UserRole } from "@/types";

export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.Administrator]: [
    "read",
    "write",
    "delete",
    "manage_users",
    "view_analytics",
    "system_config",
  ],
  [UserRole.Teacher]: [
    "read",
    "write",
    "manage_courses",
    "grade_assignments",
    "view_student_progress",
  ],
  [UserRole.Student]: [
    "read",
    "submit_assignments",
    "join_courses",
    "view_grades"
  ],
};
