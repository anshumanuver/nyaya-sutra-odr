
import { Profile } from './types';

export const getRoleDashboardPath = (profile: Profile | null): string => {
  console.log('🗺️ Getting dashboard path for profile:', profile);
  if (!profile) {
    console.log('⚠️ No profile found, defaulting to claimant dashboard');
    return '/dashboard/claimant';
  }

  const path = (() => {
    switch (profile.role) {
      case 'mediator': return '/dashboard/mediator';
      case 'admin': return '/dashboard/admin';
      case 'respondent': return '/dashboard/respondent';
      default: return '/dashboard/claimant';
    }
  })();

  console.log('🎯 Dashboard path determined:', path, 'for role:', profile.role);
  return path;
};
