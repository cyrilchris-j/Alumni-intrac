import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Link2, MessageSquare,
  Briefcase, Calendar, Settings, LogOut,
  Megaphone
} from 'lucide-react';
import { signOutUser } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const navItems = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/alumni', icon: Users, label: 'Alumni Directory' },
  { to: '/student/mentorship', icon: BookOpen, label: 'Mentorship' },
  { to: '/student/connections', icon: Link2, label: 'Connections' },
  { to: '/student/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/student/opportunities', icon: Briefcase, label: 'Opportunities' },
  { to: '/student/events', icon: Calendar, label: 'Events' },
  { to: '/student/announcements', icon: Megaphone, label: 'Announcements' },
];

const bottomItems = [
  { to: '/student/settings', icon: Settings, label: 'Settings' },
];

const StudentSidebar = ({ onClose }) => {
  const { currentUser, userProfile } = useAuth();
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

      {/* User info */}
      <Link
        to="/student/profile"
        onClick={onClose}
        className="px-4 py-4 border-b border-border flex items-center gap-3 flex-shrink-0 hover:bg-gray-50 transition-colors"
      >
        <Avatar src={userProfile?.photoURL} name={userProfile?.fullName || currentUser?.displayName} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {userProfile?.fullName || currentUser?.displayName || 'Student'}
          </p>
          <p className="text-xs text-text-secondary truncate">{userProfile?.department}</p>
        </div>
      </Link>

      {/* Nav items */}
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

      {/* Bottom section */}
      <div className="px-3 py-3 border-t border-border space-y-0.5 flex-shrink-0">
        {bottomItems.map(({ to, icon: Icon, label }) => (
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

export default StudentSidebar;
