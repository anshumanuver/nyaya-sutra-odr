
import { useContext } from 'react';
import { AuthContext } from './context';

export const useAuthHook = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    const errMsg = [
      'useAuth must be used within an AuthProvider.',
      'Possible causes:',
      '- The AuthProvider is not wrapping your routes.',
      '- There are duplicate useAuth files (e.g., both .ts and .tsx).',
      '- The import path for useAuth/AuthProvider is inconsistent (e.g., @/hooks/useAuth vs ./hooks/useAuth).',
      '- Your build has not fully reloaded (try restarting dev server).'
    ].join('\n');
    console.error(errMsg);
    throw new Error(errMsg);
  }
  return context;
};
