-- Insert some sample messages for testing
-- First, we need to create some sample users
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'teacher@university.edu', NOW(), NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'student1@university.edu', NOW(), NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', 'student2@university.edu', NOW(), NOW(), NOW());

-- Create corresponding user profiles
INSERT INTO public.users (id, email, role, first_name, last_name, university_id) VALUES
('00000000-0000-0000-0000-000000000001', 'teacher@university.edu', 'teacher', 'Dr. Sarah', 'Johnson', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002', 'student1@university.edu', 'student', 'John', 'Smith', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000003', 'student2@university.edu', 'student', 'Emma', 'Wilson', '00000000-0000-0000-0000-000000000001');

-- Insert sample messages
INSERT INTO public.messages (sender_id, recipient_id, content, created_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Hi John, how are you doing with the assignment?', NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Hello Dr. Johnson! I''m making good progress. I should have it completed by tomorrow.', NOW() - INTERVAL '1 hour'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'That sounds great! Let me know if you need any help.', NOW() - INTERVAL '30 minutes'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Hey Emma, are you planning to attend the study group tonight?', NOW() - INTERVAL '45 minutes'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Yes! I''ll be there. Should we meet in the library?', NOW() - INTERVAL '15 minutes');
