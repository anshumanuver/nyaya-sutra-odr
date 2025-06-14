
-- Create sequence for case numbers first
CREATE SEQUENCE cases_sequence START 1;

-- Create user profiles table with role information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('claimant', 'respondent', 'mediator', 'arbitrator', 'admin')),
  organization TEXT,
  bar_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table for dispute management
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL DEFAULT ('CASE-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('cases_sequence')::TEXT, 6, '0')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  case_type TEXT NOT NULL CHECK (case_type IN ('civil', 'consumer', 'property', 'commercial', 'family', 'employment')),
  dispute_mode TEXT NOT NULL CHECK (dispute_mode IN ('mediation', 'arbitration')),
  amount_in_dispute DECIMAL(15,2),
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'filed' CHECK (status IN ('filed', 'accepted', 'rejected', 'in_progress', 'resolved', 'closed')),
  claimant_id UUID NOT NULL REFERENCES auth.users(id),
  respondent_id UUID REFERENCES auth.users(id),
  mediator_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_type TEXT CHECK (resolution_type IN ('settlement', 'award', 'withdrawn'))
);

-- Create case documents table
CREATE TABLE public.case_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  document_type TEXT NOT NULL CHECK (document_type IN ('evidence', 'pleading', 'agreement', 'award', 'other')),
  is_confidential BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case messages table for communication
CREATE TABLE public.case_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_ids UUID[] DEFAULT '{}',
  message_type TEXT NOT NULL CHECK (message_type IN ('general', 'private', 'system')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case sessions table for scheduling
CREATE TABLE public.case_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('mediation', 'arbitration', 'hearing')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  location TEXT,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for cases
CREATE POLICY "Users can view cases they are involved in" ON public.cases
  FOR SELECT USING (
    auth.uid() = claimant_id OR 
    auth.uid() = respondent_id OR 
    auth.uid() = mediator_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Claimants can create cases" ON public.cases
  FOR INSERT WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "Case parties and mediators can update cases" ON public.cases
  FOR UPDATE USING (
    auth.uid() = claimant_id OR 
    auth.uid() = respondent_id OR 
    auth.uid() = mediator_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for case documents
CREATE POLICY "Case parties can view documents" ON public.case_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE id = case_id AND (
        claimant_id = auth.uid() OR 
        respondent_id = auth.uid() OR 
        mediator_id = auth.uid()
      )
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Case parties can upload documents" ON public.case_documents
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE id = case_id AND (
        claimant_id = auth.uid() OR 
        respondent_id = auth.uid() OR 
        mediator_id = auth.uid()
      )
    )
  );

-- RLS Policies for case messages
CREATE POLICY "Case parties can view messages" ON public.case_messages
  FOR SELECT USING (
    sender_id = auth.uid() OR
    auth.uid() = ANY(recipient_ids) OR
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE id = case_id AND (
        claimant_id = auth.uid() OR 
        respondent_id = auth.uid() OR 
        mediator_id = auth.uid()
      )
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Case parties can send messages" ON public.case_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE id = case_id AND (
        claimant_id = auth.uid() OR 
        respondent_id = auth.uid() OR 
        mediator_id = auth.uid()
      )
    )
  );

-- RLS Policies for case sessions
CREATE POLICY "Case parties can view sessions" ON public.case_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE id = case_id AND (
        claimant_id = auth.uid() OR 
        respondent_id = auth.uid() OR 
        mediator_id = auth.uid()
      )
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Mediators and admins can manage sessions" ON public.case_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE id = case_id AND mediator_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'claimant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
