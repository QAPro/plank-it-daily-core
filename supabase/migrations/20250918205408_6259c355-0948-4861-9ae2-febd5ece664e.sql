-- Enable RLS on user_assessments table and create policies
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own assessments" ON public.user_assessments;
DROP POLICY IF EXISTS "Admins can view all assessments" ON public.user_assessments;

CREATE POLICY "Users can manage own assessments" 
ON public.user_assessments 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all assessments" 
ON public.user_assessments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::public.app_role
  )
);

-- Enable RLS on user_exercise_performance table
ALTER TABLE public.user_exercise_performance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own exercise performance" ON public.user_exercise_performance;
DROP POLICY IF EXISTS "Admins can view all exercise performance" ON public.user_exercise_performance;

CREATE POLICY "Users can manage own exercise performance" 
ON public.user_exercise_performance 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all exercise performance" 
ON public.user_exercise_performance 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::public.app_role
  )
);

-- Enable RLS on user_sessions table
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;

CREATE POLICY "Users can manage own sessions" 
ON public.user_sessions 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" 
ON public.user_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::public.app_role
  )
);