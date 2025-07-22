-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create universities table
create table public.universities (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    domain text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create users table with role-based access
create type user_role as enum ('student', 'teacher', 'administrator');

create table public.users (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    role user_role not null default 'student',
    university_id uuid references public.universities(id),
    first_name text,
    last_name text,
    avatar_url text,
    student_id text,
    department text,
    year_of_study integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create departments table
create table public.departments (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    code text unique not null,
    university_id uuid references public.universities(id),
    head_teacher_id uuid references public.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create courses table
create table public.courses (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    code text not null,
    description text,
    teacher_id uuid references public.users(id),
    department_id uuid references public.departments(id),
    semester text,
    academic_year text,
    credits integer default 3,
    max_students integer default 50,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create course enrollments
create table public.course_enrollments (
    id uuid default gen_random_uuid() primary key,
    student_id uuid references public.users(id),
    course_id uuid references public.courses(id),
    enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text default 'active',
    unique(student_id, course_id)
);

-- Create assignments table
create table public.assignments (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    course_id uuid references public.courses(id),
    teacher_id uuid references public.users(id),
    due_date timestamp with time zone,
    max_score integer default 100,
    assignment_type text default 'homework',
    instructions text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create assignment submissions
create table public.assignment_submissions (
    id uuid default gen_random_uuid() primary key,
    assignment_id uuid references public.assignments(id),
    student_id uuid references public.users(id),
    content text,
    file_urls text[],
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
    score integer,
    feedback text,
    status text default 'submitted',
    unique(assignment_id, student_id)
);

-- Create messages table for real-time chat
create table public.messages (
    id uuid default gen_random_uuid() primary key,
    sender_id uuid references public.users(id),
    recipient_id uuid references public.users(id),
    course_id uuid references public.courses(id),
    content text not null,
    message_type text default 'text',
    file_urls text[],
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create calendar events
create table public.calendar_events (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    event_type text default 'general',
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null,
    location text,
    creator_id uuid references public.users(id),
    course_id uuid references public.courses(id),
    is_recurring boolean default false,
    recurrence_pattern text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create event RSVPs
create table public.event_rsvps (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references public.calendar_events(id),
    user_id uuid references public.users(id),
    response text check (response in ('attending', 'not_attending', 'maybe')),
    responded_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(event_id, user_id)
);

-- Create announcements
create table public.announcements (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    content text not null,
    author_id uuid references public.users(id),
    course_id uuid references public.courses(id),
    priority text default 'normal',
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.universities enable row level security;
alter table public.users enable row level security;
alter table public.departments enable row level security;
alter table public.courses enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.messages enable row level security;
alter table public.calendar_events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.announcements enable row level security;
