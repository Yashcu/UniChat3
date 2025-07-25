import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { UserRole } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getInitials(firstName: string | null, lastName: string | null): string {
  if (!firstName && !lastName) return 'UN'
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export function getAssignmentStatus(dueDate: string | null, submissionStatus?: string) {
    if (submissionStatus === 'submitted') {
        return { text: 'Submitted', color: 'bg-green-100 text-green-800' };
    }
    if (!dueDate) {
        return { text: 'No Due Date', color: 'bg-gray-100 text-gray-800' };
    }
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) {
        return { text: 'Overdue', color: 'bg-red-100 text-red-800' };
    }
    return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
}

export function getRoleColor(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    [UserRole.Student]: 'bg-blue-100 text-blue-800',
    [UserRole.Teacher]: 'bg-green-100 text-green-800',
    [UserRole.Administrator]: 'bg-purple-100 text-purple-800',
  }
  return roleColors[role] || 'bg-gray-100 text-gray-800'
}

export function calculateTotalUnread(conversations: { unread_count?: number }[]): number {
  return conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0)
}
