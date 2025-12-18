-- Create complaint categories enum
CREATE TYPE complaint_category AS ENUM (
  'infrastructure',
  'public_safety',
  'utilities',
  'sanitation',
  'transportation',
  'health',
  'education',
  'other'
);

-- Create urgency level enum
CREATE TYPE urgency_level AS ENUM ('critical', 'high', 'medium', 'low');

-- Create complaint status enum
CREATE TYPE complaint_status AS ENUM ('pending', 'in_progress', 'resolved');

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT UNIQUE NOT NULL DEFAULT 'GOV-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category complaint_category NOT NULL DEFAULT 'other',
  urgency urgency_level NOT NULL DEFAULT 'medium',
  status complaint_status NOT NULL DEFAULT 'pending',
  location TEXT,
  citizen_name TEXT NOT NULL,
  citizen_email TEXT NOT NULL,
  citizen_phone TEXT,
  predicted_resolution_days INTEGER DEFAULT 7,
  sentiment_score NUMERIC(3,2),
  ai_urgency_reason TEXT,
  ai_suggested_department TEXT,
  ai_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to insert complaints (public submission)
CREATE POLICY "Anyone can submit complaints"
ON public.complaints
FOR INSERT
WITH CHECK (true);

-- Create policy for anyone to view complaints by tracking_id (public tracking)
CREATE POLICY "Anyone can view complaints"
ON public.complaints
FOR SELECT
USING (true);

-- Create policy for updating complaints (admin only in future, for now allow all)
CREATE POLICY "Anyone can update complaints"
ON public.complaints
FOR UPDATE
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate tracking ID
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_id = 'GOV-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tracking ID generation
CREATE TRIGGER generate_complaint_tracking_id
BEFORE INSERT ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.generate_tracking_id();

-- Enable realtime for complaints
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;