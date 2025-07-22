import { supabase } from './supabase'
import { User, Course, Assignment, Message, CalendarEvent } from '@/types'

// User Services
export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data as User
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data as User
  },

  async getUsersByUniversity(universityId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('university_id', universityId)
      .order('first_name')

    if (error) throw error
    return data as User[]
  }
}

// Course Services
export const courseService = {
  async getEnrolledCourses(userId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        course:courses(*)
      `)
      .eq('student_id', userId)

    if (error) throw error
    return data.map(item => item.course as Course)
  },

  async getTeacherCourses(teacherId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('name')

    if (error) throw error
    return data as Course[]
  },

  async enrollInCourse(studentId: string, courseId: string) {
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        student_id: studentId,
        course_id: courseId
      })
      .select()

    if (error) throw error
    return data[0]
  }
}

// Assignment Services
export const assignmentService = {
  async getStudentAssignments(studentId: string): Promise<Assignment[]> {
    // First get the enrolled course IDs
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('student_id', studentId)

    if (enrollmentError) throw enrollmentError

    const courseIds = enrollments.map(enrollment => enrollment.course_id).filter(id => id !== null) as string[]

    if (courseIds.length === 0) return []

    // Then get assignments for those courses
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        course:courses(name, code)
      `)
      .in('course_id', courseIds)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data as Assignment[]
  },

  async getTeacherAssignments(teacherId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Assignment[]
  },

  async createAssignment(assignmentData: {
    title: string
    description?: string
    course_id: string
    teacher_id: string
    due_date?: string
    max_score?: number
    assignment_type?: string
    instructions?: string
  }): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignmentData)
      .select()
      .single()

    if (error) throw error
    return data as Assignment
  }
}

// Message Services
export const messageService = {
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(first_name, last_name, avatar_url),
        recipient:users!recipient_id(first_name, last_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async sendMessage(messageData: {
    sender_id: string
    recipient_id?: string
    course_id?: string
    content: string
    message_type?: string
    file_urls?: string[]
  }): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select(`
        *,
        sender:users!sender_id(first_name, last_name, avatar_url)
      `)
      .single()

    if (error) throw error
    return data as Message
  }
}

// Calendar Services
export const calendarService = {
  async getUserEvents(userId: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .or(`creator_id.eq.${userId}`)
      .order('start_time', { ascending: true })

    if (error) throw error
    return data as CalendarEvent[]
  },

  async createEvent(eventData: {
    title: string
    description?: string
    event_type?: string
    start_time: string
    end_time: string
    location?: string
    creator_id: string
    course_id?: string
    is_recurring?: boolean
  }): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single()

    if (error) throw error
    return data as CalendarEvent
  },

  async getUserCourseIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('student_id', userId)

    if (error) return []
    return data.map(item => item.course_id).filter(id => id !== null) as string[]
  }
}

// Dashboard Services
export const dashboardService = {
  async getStudentDashboardData(userId: string) {
    // Get enrolled courses count
    const { count: coursesCount } = await supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', userId)

    // Get pending assignments
    const enrollments = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('student_id', userId)

    const courseIds = enrollments.data?.map(e => e.course_id).filter(id => id !== null) as string[] || []

    let pendingAssignments = 0
    if (courseIds.length > 0) {
      const { count } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .in('course_id', courseIds)
        .gte('due_date', new Date().toISOString())

      pendingAssignments = count || 0
    }

    // Get today's events
    const today = new Date().toISOString().split('T')[0]
    const { count: todayEvents } = await supabase
      .from('calendar_events')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', `${today}T00:00:00`)
      .lt('start_time', `${today}T23:59:59`)

    return {
      totalCourses: coursesCount || 0,
      pendingAssignments,
      todayEvents: todayEvents || 0,
      totalStudents: 0 // Not applicable for student dashboard
    }
  },

  async getTeacherDashboardData(userId: string) {
    // Get courses taught
    const { count: coursesCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', userId)

    // Get assignments created
    const { count: assignmentsCount } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', userId)

    // Get total students across all courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('teacher_id', userId)

    const courseIds = courses?.map(c => c.id).filter(id => id !== null) as string[] || []
    let totalStudents = 0

    if (courseIds.length > 0) {
      const { count } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .in('course_id', courseIds)

      totalStudents = count || 0
    }

    return {
      totalCourses: coursesCount || 0,
      totalStudents,
      pendingAssignments: assignmentsCount || 0,
      todayEvents: 0
    }
  }
}
