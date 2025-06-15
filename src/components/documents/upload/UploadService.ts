
import { supabase } from '@/integrations/supabase/client';

interface UploadDocumentParams {
  file: File;
  caseId: string;
  documentType: string;
  isConfidential: boolean;
  userId: string;
}

export const uploadDocument = async ({
  file,
  caseId,
  documentType,
  isConfidential,
  userId
}: UploadDocumentParams) => {
  // Create unique filename with timestamp
  const timestamp = new Date().getTime();
  const fileName = `${caseId}/${timestamp}_${file.name}`;

  console.log('Uploading file:', fileName);

  // Upload file to Supabase storage with metadata
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('case-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      metadata: {
        caseId: caseId,
        documentType: documentType,
        uploadedBy: userId,
        isConfidential: isConfidential.toString()
      }
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw uploadError;
  }

  console.log('File uploaded to storage:', uploadData);

  // Insert document record in database
  const { error: dbError } = await supabase
    .from('case_documents')
    .insert({
      case_id: caseId,
      file_name: file.name,
      file_path: fileName,
      file_type: file.type,
      file_size: file.size,
      document_type: documentType,
      uploaded_by: userId,
      is_confidential: isConfidential,
    });

  if (dbError) {
    console.error('Database insert error:', dbError);
    // If database insert fails, cleanup the uploaded file
    await supabase.storage.from('case-documents').remove([fileName]);
    throw dbError;
  }

  console.log('Document record created in database');
  return { success: true };
};
