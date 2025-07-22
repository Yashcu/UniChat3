import { Database } from './supabase'

export type Tables = Database['public']['Tables']
export type UserRole = 'student' | 'teacher' | 'administrator'

export interface User {
  id: string
  email: string
  role: UserRole
  university_id: string
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
  teacher_id: string
  department_id: string
  semester: string | null
  academic_year: string | null
  credits: number
  max_students: number
  created_at: string
}

export interface Assignment {
  id: string
  title: string
  description: string | null
  course_id: string
  teacher_id: string
  due_date: string | null
  max_score: number
  assignment_type: string
  instructions: string | null
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string | null
  course_id: string | null
  content: string
  message_type: string
  file_urls: string[] | null
  is_read: boolean
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
  event_type: string
  start_time: string
  end_time: string
  location: string | null
  creator_id: string
  course_id: string | null
  is_recurring: boolean
  created_at: string
}

export interface DashboardStats {
  totalStudents: number
  totalCourses: number
  pendingAssignments: number
  todayEvents: number
}
