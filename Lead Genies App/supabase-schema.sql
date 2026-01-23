-- Lead Genies App - Supabase Database Schema
-- This file creates all necessary tables for the application

-- ==========================================
-- CUSTOMERS TABLE
-- ==========================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  requires_tech_expertise BOOLEAN DEFAULT false,
  min_appointments_per_week INTEGER DEFAULT 2,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON customers
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON customers
  FOR DELETE USING (true);

-- ==========================================
-- EMPLOYEES TABLE
-- ==========================================
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Minijob', 'Teilzeit', 'Springer')),
  has_tech_skills BOOLEAN DEFAULT false,
  max_customers INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON employees
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON employees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON employees
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON employees
  FOR DELETE USING (true);

-- ==========================================
-- CUSTOMER ASSIGNMENTS TABLE
-- ==========================================
CREATE TABLE customer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, employee_id)
);

ALTER TABLE customer_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON customer_assignments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON customer_assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON customer_assignments
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON customer_assignments
  FOR DELETE USING (true);

-- ==========================================
-- WEEKLY REPORTS TABLE
-- ==========================================
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  week_number INTEGER,
  year INTEGER,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON weekly_reports
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON weekly_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON weekly_reports
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON weekly_reports
  FOR DELETE USING (true);

-- ==========================================
-- COURSES TABLE
-- ==========================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON courses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON courses
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON courses
  FOR DELETE USING (true);

-- ==========================================
-- MODULES TABLE
-- ==========================================
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON modules
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON modules
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON modules
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON modules
  FOR DELETE USING (true);

-- ==========================================
-- LESSONS TABLE
-- ==========================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON lessons
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON lessons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON lessons
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON lessons
  FOR DELETE USING (true);

-- ==========================================
-- QUIZZES TABLE
-- ==========================================
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON quizzes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON quizzes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON quizzes
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON quizzes
  FOR DELETE USING (true);

-- ==========================================
-- USER PROGRESS TABLE
-- ==========================================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON user_progress
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON user_progress
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON user_progress
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON user_progress
  FOR DELETE USING (true);

-- ==========================================
-- QUIZ RESULTS TABLE
-- ==========================================
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON quiz_results
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON quiz_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON quiz_results
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON quiz_results
  FOR DELETE USING (true);
