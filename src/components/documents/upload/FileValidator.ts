
export const validateFile = (file: File) => {
  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  if (!allowedFileTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Please upload PDF, Word documents, images, or text files only."
    };
  }

  if (file.size > maxFileSize) {
    return {
      isValid: false,
      error: "Please upload files smaller than 10MB."
    };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
