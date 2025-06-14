
-- Add case_code column to the cases table
ALTER TABLE public.cases 
ADD COLUMN case_code TEXT UNIQUE;

-- Create an index on case_code for better performance
CREATE INDEX idx_cases_case_code ON public.cases(case_code);
