# Database Schema (Supabase/PostgreSQL)

## Overview

This document outlines the database schema for the Hohoe LMS system. The schema is designed for Supabase (PostgreSQL) with Row Level Security (RLS) for data protection.

## Tables

### users

Stores all system users (admins and teachers).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'class_teacher', 'subject_teacher')),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### classes

Stores class information (P1-P6, with streams).

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- e.g., "Primary 1A"
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 6),
  stream TEXT,                           -- A, B, C, etc.
  class_teacher_id UUID REFERENCES users(id),
  academic_year TEXT NOT NULL,           -- e.g., "2024/2025"
  term INTEGER NOT NULL CHECK (term IN (1, 2, 3)),
  capacity INTEGER DEFAULT 40,
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_level ON classes(level);
CREATE INDEX idx_classes_teacher ON classes(class_teacher_id);
CREATE INDEX idx_classes_academic_year ON classes(academic_year);
```

### students

Stores student information.

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL,       -- School-assigned ID
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  class_teacher_id UUID REFERENCES users(id),
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  enrollment_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'graduated')),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_status ON students(status);
```

### subjects

Stores subject information.

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- e.g., "Mathematics"
  code TEXT UNIQUE NOT NULL,             -- e.g., "MATH"
  category TEXT NOT NULL CHECK (category IN ('core', 'elective')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subjects_code ON subjects(code);
```

### subject_assignments

Links subjects to teachers and classes.

```sql
CREATE TABLE subject_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  term INTEGER NOT NULL CHECK (term IN (1, 2, 3)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, teacher_id, class_id, academic_year, term)
);

CREATE INDEX idx_subject_assignments_teacher ON subject_assignments(teacher_id);
CREATE INDEX idx_subject_assignments_class ON subject_assignments(class_id);
CREATE INDEX idx_subject_assignments_subject ON subject_assignments(subject_id);
```

### assessments

Stores assessment information (tests, exams, etc.).

```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id),
  name TEXT NOT NULL,                    -- e.g., "Mid-term Test"
  type TEXT NOT NULL CHECK (type IN ('project', 'test1', 'test2', 'group_work', 'exam', 'exercise', 'test', 'mid_term')),
  max_score NUMERIC(5,2) NOT NULL,
  weight NUMERIC(5,2) NOT NULL,          -- Percentage of total grade
  date DATE NOT NULL,
  term INTEGER NOT NULL CHECK (term IN (1, 2, 3)),
  academic_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_subject ON assessments(subject_id);
CREATE INDEX idx_assessments_class ON assessments(class_id);
CREATE INDEX idx_assessments_teacher ON assessments(teacher_id);
CREATE INDEX idx_assessments_term ON assessments(term, academic_year);
```

### grades

Stores individual student grades.

```sql
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL,
  max_score NUMERIC(5,2) NOT NULL,
  percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN max_score > 0 THEN (score / max_score * 100) ELSE 0 END
  ) STORED,
  grade TEXT NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'E', 'F')),
  remarks TEXT,
  teacher_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_assessment ON grades(assessment_id);
CREATE INDEX idx_grades_subject ON grades(subject_id);
CREATE INDEX idx_grades_synced ON grades(synced);
```

### grade_summaries

Stores calculated grade summaries per term.

```sql
CREATE TABLE grade_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  term INTEGER NOT NULL CHECK (term IN (1, 2, 3)),
  academic_year TEXT NOT NULL,
  total_score NUMERIC(10,2) NOT NULL,
  max_total_score NUMERIC(10,2) NOT NULL,
  average NUMERIC(5,2) NOT NULL,
  final_grade TEXT NOT NULL CHECK (final_grade IN ('A', 'B', 'C', 'D', 'E', 'F')),
  assessment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, term, academic_year)
);

CREATE INDEX idx_grade_summaries_student ON grade_summaries(student_id);
CREATE INDEX idx_grade_summaries_subject ON grade_summaries(subject_id);
```

### attendance

**Note**: Daily attendance marking is not used. Attendance is entered as a summary in `class_teacher_evaluations`. This table is kept for potential future use or if daily tracking is needed later.

```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES users(id),
  remarks TEXT,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_class ON attendance(class_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_synced ON attendance(synced);
```

### class_teacher_rewards

Stores rewards given by class teachers to students.

```sql
CREATE TABLE class_teacher_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  term INTEGER NOT NULL CHECK (term IN (1, 2, 3)),
  academic_year TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('merit', 'achievement', 'participation', 'leadership', 'improvement', 'other')),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  awarded_by UUID REFERENCES users(id),
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rewards_student ON class_teacher_rewards(student_id);
CREATE INDEX idx_rewards_class ON class_teacher_rewards(class_id);
CREATE INDEX idx_rewards_term ON class_teacher_rewards(term, academic_year);
CREATE INDEX idx_rewards_synced ON class_teacher_rewards(synced);
```

### class_teacher_evaluations

Stores class teacher evaluations (conduct, interest, attendance summary) for each student per term.

```sql
CREATE TABLE class_teacher_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  class_teacher_id UUID REFERENCES users(id),
  term INTEGER NOT NULL CHECK (term IN (1, 2, 3)),
  academic_year TEXT NOT NULL,
  
  -- Attendance summary
  total_days INTEGER DEFAULT 0,
  present_days INTEGER DEFAULT 0,
  absent_days INTEGER DEFAULT 0,
  late_days INTEGER DEFAULT 0,
  excused_days INTEGER DEFAULT 0,
  attendance_percentage NUMERIC(5,2) DEFAULT 0,
  
  -- Conduct and interest
  conduct TEXT NOT NULL CHECK (conduct IN ('excellent', 'very_good', 'good', 'satisfactory', 'needs_improvement')),
  conduct_remarks TEXT,
  interest TEXT NOT NULL CHECK (interest IN ('very_high', 'high', 'moderate', 'low', 'very_low')),
  interest_remarks TEXT,
  
  -- General remarks
  remarks TEXT,
  
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, term, academic_year)
);

CREATE INDEX idx_evaluations_student ON class_teacher_evaluations(student_id);
CREATE INDEX idx_evaluations_class ON class_teacher_evaluations(class_id);
CREATE INDEX idx_evaluations_teacher ON class_teacher_evaluations(class_teacher_id);
CREATE INDEX idx_evaluations_term ON class_teacher_evaluations(term, academic_year);
```

### sync_queue

Stores pending sync operations for offline mode.

```sql
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete')),
  entity_type TEXT NOT NULL,             -- 'grade', 'attendance', 'student', etc.
  entity_id TEXT,                        -- ID of the entity (may be temp ID)
  entity_data JSONB NOT NULL,            -- Full entity data
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  retries INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_queue_user ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_timestamp ON sync_queue(timestamp);
```

### audit_logs

Stores system audit logs for important actions.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,                  -- 'create', 'update', 'delete', 'login', etc.
  entity_type TEXT NOT NULL,             -- 'student', 'grade', 'class', etc.
  entity_id TEXT,
  changes JSONB,                         -- Before/after changes
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

## Views

### student_grades_view

View for easy grade querying.

```sql
CREATE VIEW student_grades_view AS
SELECT 
  g.id,
  g.student_id,
  s.student_id as student_code,
  s.first_name || ' ' || s.last_name as student_name,
  g.subject_id,
  sub.name as subject_name,
  g.assessment_id,
  a.name as assessment_name,
  a.type as assessment_type,
  g.score,
  g.max_score,
  g.percentage,
  g.grade,
  g.date,
  a.term,
  a.academic_year
FROM grades g
JOIN students s ON g.student_id = s.id
JOIN subjects sub ON g.subject_id = sub.id
JOIN assessments a ON g.assessment_id = a.id;
```

### class_statistics_view

View for class-level statistics.

```sql
CREATE VIEW class_statistics_view AS
SELECT 
  c.id as class_id,
  c.name as class_name,
  c.level,
  COUNT(DISTINCT s.id) as student_count,
  COUNT(DISTINCT sa.subject_id) as subject_count,
  COUNT(DISTINCT a.id) as assessment_count,
  AVG(gs.average) as class_average
FROM classes c
LEFT JOIN students s ON c.id = s.class_id AND s.status = 'active'
LEFT JOIN subject_assignments sa ON c.id = sa.class_id
LEFT JOIN assessments a ON c.id = a.class_id
LEFT JOIN grade_summaries gs ON s.id = gs.student_id
GROUP BY c.id, c.name, c.level;
```

## Functions

### calculate_grade_letter

Function to calculate letter grade from percentage.

```sql
CREATE OR REPLACE FUNCTION calculate_grade_letter(percentage NUMERIC)
RETURNS TEXT AS $$
BEGIN
  CASE
    WHEN percentage >= 80 THEN RETURN 'A';
    WHEN percentage >= 70 THEN RETURN 'B';
    WHEN percentage >= 60 THEN RETURN 'C';
    WHEN percentage >= 50 THEN RETURN 'D';
    WHEN percentage >= 40 THEN RETURN 'E';
    ELSE RETURN 'F';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### update_grade_summary

Function to update grade summary when grades change.

```sql
CREATE OR REPLACE FUNCTION update_grade_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO grade_summaries (
    student_id, subject_id, term, academic_year,
    total_score, max_total_score, average, final_grade, assessment_count
  )
  SELECT 
    g.student_id,
    g.subject_id,
    a.term,
    a.academic_year,
    SUM(g.score * a.weight / 100) as total_score,
    SUM(g.max_score * a.weight / 100) as max_total_score,
    CASE 
      WHEN SUM(g.max_score * a.weight / 100) > 0 
      THEN (SUM(g.score * a.weight / 100) / SUM(g.max_score * a.weight / 100) * 100)
      ELSE 0 
    END as average,
    calculate_grade_letter(
      CASE 
        WHEN SUM(g.max_score * a.weight / 100) > 0 
        THEN (SUM(g.score * a.weight / 100) / SUM(g.max_score * a.weight / 100) * 100)
        ELSE 0 
      END
    ) as final_grade,
    COUNT(DISTINCT g.assessment_id) as assessment_count
  FROM grades g
  JOIN assessments a ON g.assessment_id = a.id
  WHERE g.student_id = NEW.student_id 
    AND g.subject_id = NEW.subject_id
    AND a.term = (SELECT term FROM assessments WHERE id = NEW.assessment_id)
    AND a.academic_year = (SELECT academic_year FROM assessments WHERE id = NEW.assessment_id)
  GROUP BY g.student_id, g.subject_id, a.term, a.academic_year
  ON CONFLICT (student_id, subject_id, term, academic_year)
  DO UPDATE SET
    total_score = EXCLUDED.total_score,
    max_total_score = EXCLUDED.max_total_score,
    average = EXCLUDED.average,
    final_grade = EXCLUDED.final_grade,
    assessment_count = EXCLUDED.assessment_count,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Triggers

```sql
-- Update grade summary when grade is inserted/updated
CREATE TRIGGER trigger_update_grade_summary
AFTER INSERT OR UPDATE ON grades
FOR EACH ROW
EXECUTE FUNCTION update_grade_summary();

-- Update student count when student is added/removed
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE classes SET student_count = student_count + 1 WHERE id = NEW.class_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE classes SET student_count = student_count - 1 WHERE id = OLD.class_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.class_id != NEW.class_id THEN
      UPDATE classes SET student_count = student_count - 1 WHERE id = OLD.class_id;
      UPDATE classes SET student_count = student_count + 1 WHERE id = NEW.class_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_class_student_count
AFTER INSERT OR UPDATE OR DELETE ON students
FOR EACH ROW
EXECUTE FUNCTION update_class_student_count();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add more as needed...
```

## Row Level Security (RLS)

### Enable RLS on all tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

#### Users
```sql
-- Admins can see all users
CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (id = auth.uid());

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON users
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
```

#### Students
```sql
-- Admins can see all students
CREATE POLICY "Admins can view all students" ON students
FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Class teachers can see their class students
CREATE POLICY "Class teachers can view their students" ON students
FOR SELECT USING (
  class_teacher_id = auth.uid() OR
  class_id IN (SELECT id FROM classes WHERE class_teacher_id = auth.uid())
);

-- Subject teachers can see students in their assigned classes
CREATE POLICY "Subject teachers can view assigned students" ON students
FOR SELECT USING (
  class_id IN (
    SELECT class_id FROM subject_assignments WHERE teacher_id = auth.uid()
  )
);
```

#### Grades
```sql
-- Teachers can view grades for their assigned subjects
CREATE POLICY "Teachers can view assigned grades" ON grades
FOR SELECT USING (
  teacher_id = auth.uid() OR
  subject_id IN (
    SELECT subject_id FROM subject_assignments WHERE teacher_id = auth.uid()
  )
);

-- Teachers can insert/update grades for their subjects
CREATE POLICY "Teachers can manage assigned grades" ON grades
FOR ALL USING (
  subject_id IN (
    SELECT subject_id FROM subject_assignments WHERE teacher_id = auth.uid()
  )
);
```

## Storage Buckets (Supabase Storage)

### avatars
- Public bucket for user avatars
- Path: `avatars/{user_id}.{ext}`

### student-photos
- Public bucket for student photos
- Path: `students/{student_id}.{ext}`

### documents
- Private bucket for school documents
- Path: `documents/{year}/{month}/{filename}`

## Indexes Summary

All foreign keys and frequently queried columns should have indexes:
- Foreign keys (automatic in some cases)
- Email addresses
- Student IDs
- Dates (for filtering)
- Status fields
- Sync status fields

## Data Migration

### Initial Data

1. **Subjects** (Ghanaian curriculum):
   - Mathematics
   - English Language
   - Science
   - Social Studies
   - Religious and Moral Education
   - Ghanaian Language
   - Creative Arts
   - Physical Education

2. **Default Admin User**:
   - Created via Supabase Auth
   - Role set to 'admin'

3. **Academic Year**:
   - Current year: 2024/2025
   - Terms: 1, 2, 3

