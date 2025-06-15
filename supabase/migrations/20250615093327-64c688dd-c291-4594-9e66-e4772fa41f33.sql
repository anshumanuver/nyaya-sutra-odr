
-- Enable replication for real-time on case_messages table
ALTER TABLE public.case_messages REPLICA IDENTITY FULL;

-- Add case_messages table to the supabase_realtime publication to activate real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_messages;
