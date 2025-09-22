
-- Create custom types only if they don't exist
DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_method AS ENUM ('qr_code', 'face_recognition', 'gps', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update existing profiles table structure if needed
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS face_encoding JSONB,
ADD COLUMN IF NOT EXISTS year_of_study INTEGER;

-- Update existing courses table structure if needed  
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS faculty TEXT,
ADD COLUMN IF NOT EXISTS semester TEXT,
ADD COLUMN IF NOT EXISTS academic_year TEXT;

-- Update existing class_sessions table structure if needed
ALTER TABLE public.class_sessions
ADD COLUMN IF NOT EXISTS status session_status DEFAULT 'scheduled';

-- Update existing attendance_records table structure if needed
ALTER TABLE public.attendance_records
ADD COLUMN IF NOT EXISTS fraud_score DECIMAL(5, 4) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS device_info JSONB;

-- Create security definer function to get user role (replace if exists)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Lecturers can create courses" ON public.courses;
DROP POLICY IF EXISTS "Lecturers can update their courses" ON public.courses;
DROP POLICY IF EXISTS "Students can view sessions for enrolled courses" ON public.class_sessions;
DROP POLICY IF EXISTS "Lecturers can manage sessions for their courses" ON public.class_sessions;
DROP POLICY IF EXISTS "Students can view their enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can enroll themselves" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can view their attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Students can mark their attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their activities" ON public.user_activities;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for courses
CREATE POLICY "Everyone can view courses" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Lecturers can create courses" ON public.courses
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'lecturer' OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Lecturers can update their courses" ON public.courses
  FOR UPDATE USING (lecturer_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for class_sessions
CREATE POLICY "Students can view sessions for enrolled courses" ON public.class_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE course_id = class_sessions.course_id 
      AND student_id = auth.uid()
    ) OR 
    public.get_user_role(auth.uid()) IN ('lecturer', 'admin')
  );

CREATE POLICY "Lecturers can manage sessions for their courses" ON public.class_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = class_sessions.course_id 
      AND lecturer_id = auth.uid()
    ) OR 
    public.get_user_role(auth.uid()) = 'admin'
  );

-- RLS Policies for course_enrollments
CREATE POLICY "Students can view their enrollments" ON public.course_enrollments
  FOR SELECT USING (student_id = auth.uid() OR public.get_user_role(auth.uid()) IN ('lecturer', 'admin'));

CREATE POLICY "Students can enroll themselves" ON public.course_enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- RLS Policies for attendance_records
CREATE POLICY "Students can view their attendance" ON public.attendance_records
  FOR SELECT USING (student_id = auth.uid() OR public.get_user_role(auth.uid()) IN ('lecturer', 'admin'));

CREATE POLICY "Students can mark their attendance" ON public.attendance_records
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for user_activities
CREATE POLICY "Users can view their activities" ON public.user_activities
  FOR SELECT USING (user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');

-- Create function to handle new user registration (replace if exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN new;
END;
$$;

-- Drop existing trigger and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_courses_lecturer ON public.courses(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_course ON public.class_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_date ON public.class_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON public.user_activities(user_id);
