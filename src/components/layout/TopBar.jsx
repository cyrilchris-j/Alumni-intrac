import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, MessageSquare, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { listenToNotifications } from '../../services/notificationService';

const TopBar = ({ onMenuToggle, isSidebarOpen }) => {
  const { currentUser, userProfile, userRole } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const basePath = `/${userRole}`;

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
    <header className="h-16 bg-white border-b border-border flex items-center px-4 gap-4 flex-shrink-0 z-30">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Logo (mobile only) */}
      <Link to={`${basePath}/dashboard`} className="lg:hidden font-heading font-bold text-text-primary text-lg">
        AlumLink
      </Link>

      {/* Search bar */}
      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search alumni, opportunities, events..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 hidden md:block" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Messages */}
        <Link
          to={getMessagePath()}
          className="relative p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
          aria-label="Messages"
        >
          <MessageSquare size={20} />
        </Link>

        {/* Notifications */}
        <Link
          to={getNotificationPath()}
          className="relative p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile avatar */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Avatar
              src={userProfile?.photoURL}
              name={userProfile?.fullName || currentUser?.displayName}
              size="sm"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-border shadow-modal z-50 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-text-primary truncate">
                  {userProfile?.fullName || currentUser?.displayName}
                </p>
                <p className="text-xs text-text-secondary truncate">{currentUser?.email}</p>
              </div>
              <button
                onClick={() => { navigate(getProfilePath()); setShowUserMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={() => { navigate(`${basePath}/settings`); setShowUserMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 transition-colors"
              >
                Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
