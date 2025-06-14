
import { 
  Home, 
  FileText, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings,
  UserPlus
} from 'lucide-react';

export interface NavigationItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
}

export interface NavigationItems {
  claimant: NavigationItem[];
  mediator: NavigationItem[];
  respondent: NavigationItem[];
  admin: NavigationItem[];
}

export const navigationItems: NavigationItems = {
  claimant: [
    { icon: Home, label: 'Dashboard', path: '/dashboard/claimant' },
    { icon: FileText, label: 'My Cases', path: '/dashboard/claimant/cases' },
    { icon: Calendar, label: 'Sessions', path: '/dashboard/claimant/sessions' },
    { icon: MessageSquare, label: 'Messages', path: '/dashboard/claimant/messages' },
    { icon: UserPlus, label: 'Join Case', path: '/join-case' },
  ],
  mediator: [
    { icon: Home, label: 'Dashboard', path: '/dashboard/mediator' },
    { icon: FileText, label: 'Assignments', path: '/dashboard/mediator/assignments' },
    { icon: Calendar, label: 'Calendar', path: '/dashboard/mediator/calendar' },
    { icon: Users, label: 'Parties', path: '/dashboard/mediator/parties' },
  ],
  respondent: [
    { icon: Home, label: 'Dashboard', path: '/dashboard/respondent' },
    { icon: FileText, label: 'My Cases', path: '/dashboard/respondent/cases' },
    { icon: Calendar, label: 'Sessions', path: '/dashboard/respondent/sessions' },
    { icon: MessageSquare, label: 'Messages', path: '/dashboard/respondent/messages' },
    { icon: UserPlus, label: 'Join Case', path: '/join-case' },
  ],
  admin: [
    { icon: Home, label: 'Dashboard', path: '/dashboard/admin' },
    { icon: FileText, label: 'Cases', path: '/dashboard/admin/cases' },
    { icon: Users, label: 'Neutrals', path: '/dashboard/admin/neutrals' },
    { icon: Settings, label: 'System', path: '/dashboard/admin/system' },
  ],
};

export const getNavigationForRole = (userRole: string): NavigationItem[] => {
  const validRoles = ['claimant', 'mediator', 'admin', 'respondent'];
  const role = validRoles.includes(userRole) ? userRole : 'claimant';
  return navigationItems[role as keyof NavigationItems] || navigationItems.claimant;
};
