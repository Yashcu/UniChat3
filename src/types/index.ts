import { Database } from './supabase'

export type Tables = Database['public']['Tables']

export enum UserRole {
  Student = 'student',
  Teacher = 'teacher',
  Administrator = 'administrator',
}

export interface User {
  id: string
  email: string
  role: UserRole
  university_id: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  student_id: string | null
  department: string | null
  year_of_study: number | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  name: string
  code: string
  description: string | null
  teacher_id: string | null
  department_id: string | null
  semester: string | null
  academic_year: string | null
  credits: number | null
  max_students: number | null
  created_at: string
}

export interface Assignment {
  id: string
  title: string
  description: string | null
  course_id: string | null
  teacher_id: string | null
  due_date: string | null
  max_score: number | null
  assignment_type: string | null
  instructions: string | null
  created_at: string
  submission_date?: string | null
}

export interface Message {
  id: string
  sender_id: string | null
  recipient_id: string | null
  course_id: string | null
  content: string
  message_type: string | null
  file_urls: string[] | null
  is_read: boolean | null
  created_at: string
  sender?: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
}

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  event_type: string | null
  start_time: string
  end_time: string
  location: string | null
  creator_id: string | null
  course_id: string | null
  is_recurring: boolean | null
  created_at: string
}

export interface DashboardStats {
  totalStudents: number
  totalCourses: number
  pendingAssignments: number
  todayEvents: number
}

export interface Activity {
  id: string
  description: string
  timestamp: string
  link?: string
}
