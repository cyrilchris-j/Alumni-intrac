import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, Calendar,
  Briefcase, Megaphone, BarChart2, Settings, LogOut, Link2
} from 'lucide-react';
import { signOutUser } from '../../firebase/auth';
import Avatar from '../ui/Avatar';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'All Users' },
  { to: '/admin/students', icon: GraduationCap, label: 'Students' },
  { to: '/admin/alumni', icon: UserCheck, label: 'Alumni' },
  { to: '/admin/events', icon: Calendar, label: 'Events' },
  { to: '/admin/opportunities', icon: Briefcase, label: 'Opportunities' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Reports & Analytics' },
];

const AdminSidebar = ({ onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Link2 size={18} className="text-white" />
          </div>
          <span className="text-xl font-heading font-bold text-text-primary">AlumLink</span>
        </div>
      </div>

      {/* Admin badge */}
      <div className="px-4 py-4 border-b border-border flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">A</span>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">College Admin</p>
          <p className="text-xs text-primary-600 font-medium">Administrator</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-border space-y-0.5 flex-shrink-0">
        <NavLink
          to="/admin/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
