
// Re-export everything from the refactored auth modules
export { AuthProvider } from './auth/AuthProvider';
export { useAuthHook as useAuth } from './auth/useAuthHook';
export type { AuthContextType, Profile } from './auth/types';
