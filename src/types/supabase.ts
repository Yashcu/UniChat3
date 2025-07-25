export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string | null
          content: string
          course_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          priority: string | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content: string
          course_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string
          course_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string | null
          content: string | null
          feedback: string | null
          file_urls: string[] | null
          id: string
          score: number | null
          status: string | null
          student_id: string | null
          submitted_at: string
        }
        Insert: {
          assignment_id?: string | null
          content?: string | null
          feedback?: string | null
          file_urls?: string[] | null
          id?: string
          score?: number | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string
        }
        Update: {
          assignment_id?: string | null
          content?: string | null
          feedback?: string | null
          file_urls?: string[] | null
          id?: string
          score?: number | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          assignment_type: string | null
          course_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          instructions: string | null
          max_score: number | null
          teacher_id: string | null
          title: string
        }
        Insert: {
          assignment_type?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          max_score?: number | null
          teacher_id?: string | null
          title: string
        }
        Update: {
          assignment_type?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          max_score?: number | null
          teacher_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          course_id: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          end_time: string
          event_type: string | null
          id: string
          is_recurring: boolean | null
          location: string | null
          recurrence_pattern: string | null
          start_time: string
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          recurrence_pattern?: string | null
          start_time: string
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          recurrence_pattern?: string | null
          start_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          course_id: string | null
          enrolled_at: string
          id: string
          status: string | null
          student_id: string | null
        }
        Insert: {
          course_id?: string | null
          enrolled_at?: string
          id?: string
          status?: string | null
          student_id?: string | null
        }
        Update: {
          course_id?: string | null
          enrolled_at?: string
          id?: string
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          academic_year: string | null
          code: string
          created_at: string
          credits: number | null
          department_id: string | null
          description: string | null
          id: string
          max_students: number | null
          name: string
          semester: string | null
          teacher_id: string | null
        }
        Insert: {
          academic_year?: string | null
          code: string
          created_at?: string
          credits?: number | null
          department_id?: string | null
          description?: string | null
          id?: string
          max_students?: number | null
          name: string
          semester?: string | null
          teacher_id?: string | null
        }
        Update: {
          academic_year?: string | null
          code?: string
          created_at?: string
          credits?: number | null
          department_id?: string | null
          description?: string | null
          id?: string
          max_students?: number | null
          name?: string
          semester?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          head_teacher_id: string | null
          id: string
          name: string
          university_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          head_teacher_id?: string | null
          id?: string
          name: string
          university_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          head_teacher_id?: string | null
          id?: string
          name?: string
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_head_teacher_id_fkey"
            columns: ["head_teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          event_id: string | null
          id: string
          responded_at: string
          response: string | null
          user_id: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          responded_at?: string
          response?: string | null
          user_id?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          responded_at?: string
          response?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          file_urls: string[] | null
          id: string
          is_read: boolean | null
          message_type: string | null
          recipient_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          file_urls?: string[] | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          file_urls?: string[] | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          created_at: string
          domain: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          student_id: string | null
          university_id: string | null
          updated_at: string
          year_of_study: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          student_id?: string | null
          university_id?: string | null
          updated_at?: string
          year_of_study?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          student_id?: string | null
          university_id?: string | null
          updated_at?: string
          year_of_study?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_conversations: {
        Args: {
          current_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      user_role: "student" | "teacher" | "administrator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
