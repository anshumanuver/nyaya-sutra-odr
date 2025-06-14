
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine user role from URL
  const userRole = location.pathname.split('/')[2] || 'user';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <DashboardSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <DashboardHeader 
          setSidebarOpen={setSidebarOpen}
          userRole={userRole}
        />

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
