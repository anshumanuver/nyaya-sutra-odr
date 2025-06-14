
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scale, LogOut, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getNavigationForRole } from './NavigationItems';

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: string;
}

const DashboardSidebar = ({ sidebarOpen, setSidebarOpen, userRole }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const currentNav = getNavigationForRole(userRole);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b">
        <div className="flex items-center space-x-2">
          <Scale className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">LexODR</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {currentNav.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
