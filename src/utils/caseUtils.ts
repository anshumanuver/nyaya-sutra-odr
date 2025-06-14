
/**
 * Generates a unique case code for new cases
 * Format: CASE2025XXXX where XXXX is a random alphanumeric string
 */
export const generateCaseCode = (): string => {
  const year = new Date().getFullYear();
  const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
  const additionalChars = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `CASE${year}${randomString}${additionalChars}`;
};

/**
 * Validates case code format
 * Accepts formats like: CASE2025ABCD, CASE2024XYZ123, etc.
 */
export const isValidCaseCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') return false;
  
  // Case code should start with CASE followed by year and alphanumeric characters
  const caseCodeRegex = /^CASE\d{4}[A-Z0-9]{4,}$/i;
  return caseCodeRegex.test(code.toUpperCase());
};

/**
 * Formats case code to uppercase for consistency
 */
export const formatCaseCode = (code: string): string => {
  return code.toUpperCase().trim();
};
