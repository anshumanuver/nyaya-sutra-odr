
/**
 * Generates a unique case code for new cases
 * Format: CASE2025XXXX where XXXX is a random alphanumeric string
 */
export const generateCaseCode = (): string => {
  const year = new Date().getFullYear();
  const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
  const additionalChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CASE${year}${randomString}${additionalChars}`.substring(0, 12);
};

/**
 * Validates case code format
 */
export const isValidCaseCode = (code: string): boolean => {
  const caseCodeRegex = /^CASE\d{4}[A-Z0-9]{4,8}$/;
  return caseCodeRegex.test(code);
};
