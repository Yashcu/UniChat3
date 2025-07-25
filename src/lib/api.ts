import { supabase } from './supabase'
import {
  User,
  Course,
  Assignment,
  Message,
  DashboardStats,
} from '@/types'
import { InputValidator } from './validation'

interface ApiError {
  message: string
  details?: string
  code?: string
}

interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
}

const handleApiResponse = async <T>(
  operation: () => Promise<{ data: T | null; error: unknown }>
): Promise<ApiResponse<T>> => {
  try {
    const { data, error } = await operation()
    if (error) throw error
    return { data, error: null }
  } catch (error: unknown) {
    let message = 'An unexpected error occurred.'
    if (error instanceof Error) {
        message = error.message;
    }
    return {
      data: null,
      error: { message },
    }
  }
}

export const userService = {
  getCurrentUserWithError(): Promise<ApiResponse<User>> {
    return handleApiResponse(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user found.')
      return supabase.from('users').select('*').eq('id', user.id).single()
    })
  },
  getUsersByUniversity(universityId: string): Promise<ApiResponse<User[]>> {
    return handleApiResponse(async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('university_id', universityId)
        return { data: data as User[], error };
    });
  }
}

export const courseService = {
  getEnrolledCourses(userId: string): Promise<ApiResponse<Course[]>> {
    return handleApiResponse(async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('course:courses(*)')
        .eq('student_id', userId)

      if (error) throw error;

      // FIX: Filter out any null courses before mapping to ensure type safety.
      const validCourses = data
        .filter((enrollment): enrollment is { course: Course } => enrollment.course !== null)
        .map((enrollment) => enrollment.course);

      return { data: validCourses, error: null };
    });
  },
  getTeacherCourses(teacherId: string): Promise<ApiResponse<Course[]>> {
    return handleApiResponse(async () =>
      supabase.from("courses").select("*").eq("teacher_id", teacherId)
    );
  },
}

export const assignmentService = {
  getStudentAssignmentsWithError(studentId: string): Promise<ApiResponse<Assignment[]>> {
    return handleApiResponse(async () => {
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', studentId)

      if (error) throw error;
      const courseIds = enrollments?.map((e: { course_id: string | null }) => e.course_id).filter(Boolean) as string[] ?? [];
      if (courseIds.length === 0) return { data: [], error: null };

      return supabase
        .from('assignments')
        .select('*, course:courses(name, code)')
        .in('course_id', courseIds)
        .order('due_date', { ascending: true })
    })
  },

  getTeacherAssignmentsWithError(teacherId: string): Promise<ApiResponse<Assignment[]>> {
    return handleApiResponse(async () =>
      supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
    )
  },
}

export const messageService = {
  sendMessageWithError(messageData: {
    sender_id: string;
    recipient_id?: string;
    course_id?: string;
    content: string;
  }): Promise<ApiResponse<Message>> {
    return handleApiResponse(async () => {
      const validationError = InputValidator.validateMessage(messageData.content);
      if (validationError) throw new Error(validationError.message);

      const sanitizedContent = InputValidator.sanitizeInput(messageData.content);
      return supabase
        .from('messages')
        .insert({ ...messageData, content: sanitizedContent })
        .select('*, sender:users!sender_id(first_name, last_name, avatar_url)')
        .single();
    });
  },
};

export const dashboardService = {
  getStudentDashboardData(userId: string): Promise<ApiResponse<DashboardStats>> {
    return handleApiResponse(async () =>
      supabase.from("users").select("*").eq("id", userId).single()
    );
  },
  getTeacherDashboardData(userId: string): Promise<ApiResponse<DashboardStats>> {
    return handleApiResponse(async () =>
      supabase.from("users").select("*").eq("id", userId).single()
    );
  },
  getRecentActivity:(userId: string) =>{
    return handleApiResponse(async () =>
      supabase
        .from('users') // Assumes an 'activities' table
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(5)
    )
  }
};
