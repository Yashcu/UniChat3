-- Insert sample university
INSERT INTO public.universities (id, name, domain) VALUES
('00000000-0000-0000-0000-000000000001', 'Sample University', 'university.edu');

-- Insert sample departments
INSERT INTO public.departments (id, name, code, university_id) VALUES
('00000000-0000-0000-0000-000000000001', 'Computer Science', 'CS', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002', 'Mathematics', 'MATH', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000003', 'English Literature', 'ENG', '00000000-0000-0000-0000-000000000001');
