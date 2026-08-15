import { useState, useEffect } from 'react';
import { Megaphone, Calendar, Tag, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { getAnnouncementsForRole } from '../../services/announcementService';
import { formatDate, timeAgo } from '../../utils/formatters';

const Announcements = () => {
  const { userRole } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAnnouncementsForRole(userRole || 'student');
        setAnnouncements(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userRole]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text-primary">Announcements</h1>
        <p className="text-text-secondary text-sm mt-1">
          Official updates, news, and notifications from college administration.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements posted"
          description="You are all caught up! New updates from administration will be published here."
        />
      ) : (
        <div className="space-y-4 max-w-4xl">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={ann.category === 'Urgent' ? 'danger' : 'primary'}>
                    {ann.category || 'General'}
                  </Badge>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(ann.createdAt)}
                  </span>
                </div>
                <span className="text-xs text-text-muted">{timeAgo(ann.createdAt)}</span>
              </div>

              <h2 className="text-lg font-heading font-bold text-text-primary mb-3">
                {ann.title}
              </h2>

              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-1.5 text-primary-700 font-medium">
                  <ShieldCheck size={14} />
                  <span>College Administration</span>
                </div>
                <span>Audience: {ann.targetAudience === 'all' ? 'Everyone' : ann.targetAudience}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Announcements;
