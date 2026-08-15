import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { getStudentMentorshipRequests } from '../../services/mentorshipService';
import { getAlumniProfile } from '../../services/userService';
import { formatDate, timeAgo } from '../../utils/formatters';
import { MENTORSHIP_STATUS } from '../../utils/constants';

const statusConfig = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  accepted: { label: 'Active', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Declined', variant: 'danger', icon: XCircle },
  completed: { label: 'Completed', variant: 'default', icon: CheckCircle },
};

const StudentMentorship = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alumniProfiles, setAlumniProfiles] = useState({});
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const reqs = await getStudentMentorshipRequests(currentUser.uid);
        setRequests(reqs);

        const profiles = {};
        await Promise.all(
          reqs.map(async (r) => {
            if (!profiles[r.alumniId]) {
              const p = await getAlumniProfile(r.alumniId);
              if (p) profiles[r.alumniId] = p;
            }
          })
        );
        setAlumniProfiles(profiles);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const filtered = requests.filter((r) =>
    activeTab === 'all' ? true : r.status === activeTab
  );

  const tabs = [
    { id: 'all', label: 'All Requests' },
    { id: MENTORSHIP_STATUS.PENDING, label: 'Pending' },
    { id: MENTORSHIP_STATUS.ACCEPTED, label: 'Active' },
    { id: MENTORSHIP_STATUS.COMPLETED, label: 'Completed' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Mentorship</h1>
          <p className="text-text-secondary text-sm mt-1">Track your mentorship requests and active mentors.</p>
        </div>
        <Button onClick={() => navigate('/student/alumni')}>
          <Users size={16} />
          Find a Mentor
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
            {tab.id !== 'all' && (
              <span className="ml-1.5 text-xs text-text-muted">
                ({requests.filter((r) => r.status === tab.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={activeTab === 'all' ? "No mentorship requests yet" : `No ${activeTab} requests`}
          description="Connect with alumni and request mentorship to get started."
          action={() => navigate('/student/alumni')}
          actionLabel="Find a Mentor"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((request) => {
            const alumni = alumniProfiles[request.alumniId];
            const config = statusConfig[request.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <div key={request.id} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-start gap-4">
                  <Avatar src={alumni?.photoURL} name={alumni?.fullName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-text-primary">{alumni?.fullName || 'Unknown Alumni'}</h3>
                        <p className="text-sm text-text-secondary">{alumni?.jobRole} {alumni?.company && `• ${alumni.company}`}</p>
                      </div>
                      <Badge variant={config.variant}>
                        <StatusIcon size={11} />
                        {config.label}
                      </Badge>
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-text-secondary font-medium mb-1">Topic</p>
                      <p className="text-sm text-text-primary">{request.topic}</p>
                      {request.preferredArea && (
                        <p className="text-xs text-text-secondary mt-1">Area: {request.preferredArea}</p>
                      )}
                    </div>

                    {request.message && (
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2">{request.message}</p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-text-muted">{timeAgo(request.createdAt)}</p>
                      {request.status === MENTORSHIP_STATUS.ACCEPTED && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate('/student/messages')}
                        >
                          Send Message
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentMentorship;
