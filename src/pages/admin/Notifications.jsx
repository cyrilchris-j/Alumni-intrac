import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Check, UserCheck, GraduationCap, Calendar,
  ShieldCheck, Megaphone, Trash2, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../services/notificationService';
import { timeAgo } from '../../utils/formatters';

const getAdminNotificationIcon = (type) => {
  switch (type) {
    case 'alumni_verification':
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
          <UserCheck size={19} />
        </div>
      );
    case 'new_registration':
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
          <GraduationCap size={19} />
        </div>
      );
    case 'event_alert':
    case 'new_event':
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
          <Calendar size={19} />
        </div>
      );
    case 'system_alert':
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
          <ShieldCheck size={19} />
        </div>
      );
    case 'announcement':
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
          <Megaphone size={19} />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
          <Bell size={19} />
        </div>
      );
  }
};

const AdminNotifications = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, unread, verification, system

  const loadNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getUserNotifications(currentUser.uid);
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load admin notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentUser]);

  const handleMarkRead = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead(currentUser.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'verification') return notif.type === 'alumni_verification';
    if (activeTab === 'system') return notif.type === 'system_alert' || notif.type === 'event_alert';
    return true;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-heading font-bold text-slate-900">
              Admin Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Track verification requests, institutional alerts, and campus activities.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={Check}
            loading={markingAll}
            onClick={handleMarkAllRead}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 pb-2 mb-6 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'unread'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'verification'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Verifications ({notifications.filter((n) => n.type === 'alumni_verification').length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'system'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          System & Events ({notifications.filter((n) => n.type === 'system_alert' || n.type === 'event_alert').length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications found"
          description={
            activeTab === 'unread'
              ? 'You are all caught up! No unread notifications right now.'
              : 'No notifications in this category yet.'
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && handleMarkRead(notif.id)}
              className={`p-5 flex items-start gap-4 transition-all duration-150 group cursor-pointer ${
                notif.read
                  ? 'bg-white hover:bg-slate-50/80'
                  : 'bg-blue-50/35 hover:bg-blue-50/60'
              }`}
            >
              {/* Type Icon */}
              {getAdminNotificationIcon(notif.type)}

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm ${
                        notif.read
                          ? 'font-medium text-slate-800'
                          : 'font-bold text-slate-900'
                      }`}
                    >
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium flex-shrink-0">
                    {timeAgo(notif.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {notif.message}
                </p>

                {/* Action Link & Dismiss Controls */}
                <div className="mt-3 flex items-center gap-3 pt-1">
                  {notif.link && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!notif.read) handleMarkRead(notif.id);
                        navigate(notif.link);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg transition-colors border border-blue-200/50"
                    >
                      Take Action
                      <ArrowRight size={13} />
                    </button>
                  )}

                  {!notif.read && (
                    <button
                      onClick={(e) => handleMarkRead(notif.id, e)}
                      className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDelete(notif.id, e)}
                    className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1"
                    title="Dismiss"
                  >
                    <Trash2 size={13} />
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminNotifications;
