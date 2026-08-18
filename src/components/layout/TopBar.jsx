import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, MessageSquare, Search, Menu, X, Link2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { listenToNotifications } from '../../services/notificationService';

const TopBar = ({ onMenuToggle, isSidebarOpen }) => {
  const { currentUser, userProfile, userRole } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const role = userRole || 'student';
  const basePath = `/${role}`;

  useEffect(() => {
    if (!currentUser) return;
    const unsub = listenToNotifications(currentUser.uid, (notifications) => {
      setUnreadCount(notifications.filter((n) => !n.read).length);
    });
    return () => unsub();
  }, [currentUser]);

  const getNotificationPath = () => `${basePath}/notifications`;
  const getMessagePath = () => `${basePath}/messages`;
  const getProfilePath = () => `${basePath}/profile`;

  return (
    <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 gap-4 flex-shrink-0 z-30 sticky top-0 shadow-xs">
      {/* Left side: Mobile menu toggle & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo (mobile only) */}
        <Link to={`${basePath}/dashboard`} className="lg:hidden font-heading font-bold text-slate-900 text-lg flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white">
            <Link2 size={16} />
          </div>
          AlumLink
        </Link>
      </div>

      {/* Search bar */}
      <div className="hidden md:flex flex-1 max-w-lg">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search alumni mentors, research opportunities, campus events..."
            className="w-full pl-10 pr-12 py-2 text-xs font-medium border border-slate-200/90 rounded-xl bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 focus:bg-white transition-all shadow-xs"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd className="text-[10px] font-bold bg-white text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded shadow-xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Actions (Notifications & Profile) - Right aligned */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <Link
          to={getNotificationPath()}
          className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-primary-900 transition-all border border-transparent hover:border-slate-200/60"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile avatar & role chip */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200/80 transition-all"
          >
            <Avatar
              src={userProfile?.photoURL}
              name={userProfile?.fullName || currentUser?.displayName}
              size="xs"
              ring
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {userProfile?.fullName?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 capitalize font-medium">
                {userRole || 'Member'}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200/90 shadow-modal z-50 animate-fade-in overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-blue-50/50 to-white">
                <p className="text-xs font-bold text-slate-900 truncate font-heading">
                  {userProfile?.fullName || currentUser?.displayName}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{currentUser?.email}</p>
                <span className="mt-2 inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {userRole?.toUpperCase() || 'MEMBER'}
                </span>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => { navigate(getProfilePath()); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-50/60 hover:text-blue-600 transition-colors"
                >
                  My Profile & Credentials
                </button>
                <button
                  onClick={() => { navigate(`${basePath}/settings`); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-50/60 hover:text-blue-600 transition-colors"
                >
                  Account Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
