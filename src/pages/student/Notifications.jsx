import { useState, useEffect } from 'react';
import {
  Bell, Check, CheckCheck, Link2, BookOpen,
  MessageSquare, Briefcase, Calendar, Megaphone, Trash2
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
} from '../../services/notificationService';
import { timeAgo } from '../../utils/formatters';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'connection_request':
    case 'connection_accepted':
      return <Link2 size={18} className="text-primary-600" />;
    case 'mentorship_request':
    case 'mentorship_accepted':
    case 'mentorship_rejected':
      return <BookOpen size={18} className="text-green-600" />;
    case 'new_message':
      return <MessageSquare size={18} className="text-blue-600" />;
    case 'new_opportunity':
      return <Briefcase size={18} className="text-orange-600" />;
    case 'new_event':
      return <Calendar size={18} className="text-purple-600" />;
    case 'announcement':
      return <Megaphone size={18} className="text-red-600" />;
    default:
      return <Bell size={18} className="text-gray-600" />;
  }
};

const Notifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getUserNotifications(currentUser.uid);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentUser]);

  const handleMarkRead = async (notifId) => {
    try {
      await markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead(currentUser.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Notifications</h1>
          <p className="text-text-secondary text-sm mt-1">
            Stay updated with requests, messages, events, and platform activity.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={CheckCheck}
            loading={markingAll}
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="We'll notify you when someone connects with you or an event is posted."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden w-full shadow-sm">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && handleMarkRead(notif.id)}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                notif.read ? 'bg-white hover:bg-gray-50' : 'bg-primary-50/40 hover:bg-primary-50/70'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                {getNotificationIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className={`text-sm font-medium ${notif.read ? 'text-text-primary' : 'text-primary-900 font-semibold'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-xs text-text-muted flex-shrink-0">
                    {timeAgo(notif.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary-600 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Notifications;
