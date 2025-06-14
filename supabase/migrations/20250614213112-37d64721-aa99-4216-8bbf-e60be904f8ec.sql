
-- Create storage bucket for case documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('case-documents', 'case-documents', false);

-- Create RLS policies for the case-documents bucket
CREATE POLICY "Users can view case documents they have access to" ON storage.objects
FOR SELECT USING (
  bucket_id = 'case-documents' AND (
    -- Users can access documents from cases they are part of
    auth.uid() IN (
      SELECT claimant_id FROM cases WHERE id::text = (storage.foldername(name))[1]
      UNION
      SELECT respondent_id FROM cases WHERE id::text = (storage.foldername(name))[1]
      UNION
      SELECT mediator_id FROM cases WHERE id::text = (storage.foldername(name))[1]
    )
    -- Or if they are admin/mediator role
    OR auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'mediator')
    )
  )
);

CREATE POLICY "Users can upload documents to their cases" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'case-documents' AND (
    -- Users can upload to cases they are claimant of
    auth.uid() IN (
      SELECT claimant_id FROM cases WHERE id::text = (storage.foldername(name))[1]
    )
    -- Or respondent
    OR auth.uid() IN (
      SELECT respondent_id FROM cases WHERE id::text = (storage.foldername(name))[1]
    )
    -- Or assigned mediator
    OR auth.uid() IN (
      SELECT mediator_id FROM cases WHERE id::text = (storage.foldername(name))[1]
    )
  )
);

CREATE POLICY "Users can delete their own uploaded documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'case-documents' AND owner = auth.uid()
);

-- Add RLS policies for case_documents table
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents from their cases" ON case_documents
FOR SELECT USING (
  auth.uid() IN (
    SELECT claimant_id FROM cases WHERE id = case_documents.case_id
    UNION
    SELECT respondent_id FROM cases WHERE id = case_documents.case_id
    UNION
    SELECT mediator_id FROM cases WHERE id = case_documents.case_id
  )
  OR auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'mediator')
  )
);

CREATE POLICY "Users can upload documents to their cases" ON case_documents
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT claimant_id FROM cases WHERE id = case_documents.case_id
    UNION
    SELECT respondent_id FROM cases WHERE id = case_documents.case_id
    UNION
    SELECT mediator_id FROM cases WHERE id = case_documents.case_id
  )
);

CREATE POLICY "Users can update their own documents" ON case_documents
FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own documents" ON case_documents
FOR DELETE USING (uploaded_by = auth.uid());
