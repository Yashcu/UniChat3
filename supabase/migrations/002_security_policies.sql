-- Users can read their own data and other users in their university
create policy "Users can view users in their university" on public.users
    for select using (
        university_id = (select university_id from public.users where id = auth.uid())
    );

create policy "Users can update their own profile" on public.users
    for update using (id = auth.uid());

-- Course access policies (no changes needed here)
-- ...

-- Message policies for real-time chat
create policy "Users can view their own messages" on public.messages
    for select using (sender_id = auth.uid() or recipient_id = auth.uid());

-- SECURITY ENHANCEMENT: Users can only send messages to others in the same university.
create policy "Users can send messages to others in the same university" on public.messages
    for insert with check (
        sender_id = auth.uid() AND
        (
            SELECT university_id FROM public.users WHERE id = sender_id
        ) = (
            SELECT university_id FROM public.users WHERE id = recipient_id
        )
    );
