import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Link2, BookOpen, MessageSquare,
  Briefcase, Calendar, FileText, Settings, LogOut
} from 'lucide-react';
import { signOutUser } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

const navItems = [
  { to: '/alumni/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alumni/connections', icon: Link2, label: 'Connections' },
  { to: '/alumni/mentorship', icon: BookOpen, label: 'Mentorship' },
  { to: '/alumni/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/alumni/opportunities', icon: Briefcase, label: 'Opportunities' },
  { to: '/alumni/events', icon: Calendar, label: 'Events' },
];

const AlumniSidebar = ({ onClose }) => {
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

  const isVerified = userProfile?.verificationStatus === 'verified';

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
              Alumni Portal
            </span>
          </div>
        </div>
      </div>

      {/* User Info Profile Pill */}
      <div className="p-3.5 flex-shrink-0">
        <Link
          to="/alumni/profile"
          onClick={onClose}
          className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 block transition-all duration-200 group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <Avatar 
              src={userProfile?.photoURL} 
              name={userProfile?.fullName || currentUser?.displayName} 
              size="sm" 
              ring 
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {userProfile?.fullName || currentUser?.displayName || 'Alumni Member'}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {userProfile?.jobRole || userProfile?.company || 'Alumni Member'}
              </p>
            </div>
          </div>
          {isVerified && (
            <div className="mt-2.5">
              <Badge variant="emerald" dot className="text-[10px] py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                Verified Alumni
              </Badge>
            </div>
          )}
          {userProfile?.verificationStatus === 'pending' && (
            <div className="mt-2.5">
              <Badge variant="warning" dot className="text-[10px] py-0.5 bg-amber-50 text-amber-700 border-amber-200">
                Verification Pending
              </Badge>
            </div>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1 scrollbar-none">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Main Navigation
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
          to="/alumni/settings"
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

export default AlumniSidebar;
