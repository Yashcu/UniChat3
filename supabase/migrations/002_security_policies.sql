-- Users can read their own data and other users in their university
create policy "Users can view users in their university" on public.users
    for select using (
        university_id = (select university_id from public.users where id = auth.uid())
    );

create policy "Users can update their own profile" on public.users
    for update using (id = auth.uid());

-- Course access policies
create policy "Students can view enrolled courses" on public.courses
    for select using (
        id in (
            select course_id from public.course_enrollments
            where student_id = auth.uid()
        ) or
        teacher_id = auth.uid()
    );

create policy "Teachers can manage their courses" on public.courses
    for all using (teacher_id = auth.uid());

-- Assignment policies
create policy "Students can view assignments for their courses" on public.assignments
    for select using (
        course_id in (
            select course_id from public.course_enrollments
            where student_id = auth.uid()
        ) or
        teacher_id = auth.uid()
    );

-- Message policies for real-time chat
create policy "Users can view their messages" on public.messages
    for select using (
        sender_id = auth.uid() or recipient_id = auth.uid() or
        course_id in (
            select course_id from public.course_enrollments
            where student_id = auth.uid()
        )
    );

create policy "Users can send messages" on public.messages
    for insert with check (sender_id = auth.uid());
