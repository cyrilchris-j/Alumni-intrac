import { useState, useEffect } from 'react';
import TopBar from './TopBar';
import StudentSidebar from './StudentSidebar';
import AlumniSidebar from './AlumniSidebar';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userRole } = useAuth();

  // Close sidebar on route change or large screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SidebarComponent = {
    student: StudentSidebar,
    alumni: AlumniSidebar,
    admin: AdminSidebar,
  }[userRole];

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        {SidebarComponent && <SidebarComponent />}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="relative flex-shrink-0 w-64 z-50">
            {SidebarComponent && (
              <SidebarComponent onClose={() => setSidebarOpen(false)} />
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          isSidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
