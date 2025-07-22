-- Enable realtime for messages table
ALTER publication supabase_realtime ADD table public.messages;

-- Enable realtime for other tables you need
ALTER publication supabase_realtime ADD table public.users;
ALTER publication supabase_realtime ADD table public.courses;
ALTER publication supabase_realtime ADD table public.assignments;
ALTER publication supabase_realtime ADD table public.calendar_events;
