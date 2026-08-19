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
    <aside className="w-64 h-full bg-white text-slate-700 border-r border-slate-200/80 flex flex-col shadow-xs">
      {/* Light Blue Logo Header */}
      <div className="h-18 flex items-center px-6 border-b border-slate-200/80 flex-shrink-0 bg-blue-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-sm flex-shrink-0">
            <Link2 size={20} className="text-white stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-heading font-bold text-slate-900 tracking-wide block leading-none">
              AlumLink
            </span>
            <span className="text-[10px] font-mono font-semibold tracking-widest text-blue-600 uppercase block mt-1">
              Admin Portal
            </span>
          </div>
        </div>
      </div>



      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1 scrollbar-none">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Administration
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-slate-200/80 space-y-1 bg-slate-50/50 flex-shrink-0">
        <NavLink
          to="/admin/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
            }`
          }
        >
          <Settings size={16} />
          Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
