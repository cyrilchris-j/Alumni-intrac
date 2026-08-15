import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, CheckCircle, XCircle, Users, MessageSquare,
  Building2, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  getAlumniMentorshipRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
  completeMentorship,
} from '../../services/mentorshipService';
import { getStudentProfile } from '../../services/userService';
import { getOrCreateConversation } from '../../services/messageService';
import { timeAgo } from '../../utils/formatters';
import { MENTORSHIP_STATUS } from '../../utils/constants';

const AlumniMentorship = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentProfiles, setStudentProfiles] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [actioningId, setActioningId] = useState(null);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getAlumniMentorshipRequests(currentUser.uid);
      setRequests(data);

      const profiles = {};
      await Promise.all(
        data.map(async (r) => {
          if (!profiles[r.studentId]) {
            const p = await getStudentProfile(r.studentId);
            if (p) profiles[r.studentId] = p;
          }
        })
      );
      setStudentProfiles(profiles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleAccept = async (req) => {
    setActioningId(req.id);
    try {
      await acceptMentorshipRequest(req.id, userProfile?.fullName || 'Alumni', req.studentId);
      await loadData();
    } catch (e) {
      alert(e.message || 'Failed to accept');
    } finally {
      setActioningId(null);
    }
  };

  const handleDecline = async (req) => {
    setActioningId(`decline_${req.id}`);
    try {
      await rejectMentorshipRequest(req.id, userProfile?.fullName || 'Alumni', req.studentId);
      await loadData();
    } catch (e) {
      alert(e.message || 'Failed to decline');
    } finally {
      setActioningId(null);
    }
  };

  const handleMessage = async (studentId, studentName) => {
    try {
      await getOrCreateConversation(currentUser.uid, studentId, {
        [currentUser.uid]: userProfile?.fullName || 'Alumni',
        [studentId]: studentName,
      });
      navigate('/alumni/messages', { state: { conversationWith: studentId } });
    } catch (e) {
      alert('Failed to open chat');
    }
  };

  const pendingList = requests.filter((r) => r.status === MENTORSHIP_STATUS.PENDING);
  const activeList = requests.filter((r) => r.status === MENTORSHIP_STATUS.ACCEPTED);
  const completedList = requests.filter((r) => r.status === MENTORSHIP_STATUS.COMPLETED);

  const tabs = [
    { id: 'pending', label: 'Pending Requests', count: pendingList.length },
    { id: 'active', label: 'Active Mentees', count: activeList.length },
    { id: 'completed', label: 'Completed', count: completedList.length },
  ];

  const currentList =
    activeTab === 'pending'
      ? pendingList
      : activeTab === 'active'
      ? activeList
      : completedList;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text-primary">Student Mentorship</h1>
        <p className="text-text-secondary text-sm mt-1">
          Guide students with 1-on-1 career advice, resume insights, and technical advice.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={`No ${activeTab} mentorship items`}
          description={
            activeTab === 'pending'
              ? 'New requests from students will show up here.'
              : 'You do not have any active mentees in this tab.'
          }
        />
      ) : (
        <div className="space-y-4 max-w-4xl">
          {currentList.map((req) => {
            const student = studentProfiles[req.studentId];
            return (
              <div key={req.id} className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <Avatar src={student?.photoURL} name={student?.fullName} size="md" />
                    <div>
                      <h3 className="font-heading font-bold text-text-primary text-base">
                        {student?.fullName || 'Student'}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {student?.department} • {student?.year}
                      </p>
                      <p className="text-xs text-text-muted mt-1">{timeAgo(req.createdAt)}</p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      req.status === 'accepted' ? 'success' :
                      req.status === 'pending' ? 'warning' : 'default'
                    }
                  >
                    {req.status === 'accepted' ? 'Active Mentee' : req.status}
                  </Badge>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-text-secondary uppercase">Topic:</span>
                    <p className="font-medium text-text-primary">{req.topic}</p>
                  </div>
                  {req.preferredArea && (
                    <div>
                      <span className="text-xs font-semibold text-text-secondary uppercase">Focus Area:</span>
                      <p className="text-text-primary">{req.preferredArea}</p>
                    </div>
                  )}
                  {req.message && (
                    <div>
                      <span className="text-xs font-semibold text-text-secondary uppercase">Message:</span>
                      <p className="text-text-secondary leading-relaxed whitespace-pre-line mt-0.5">
                        "{req.message}"
                      </p>
                    </div>
                  )}
                  {req.availability && (
                    <div>
                      <span className="text-xs font-semibold text-text-secondary uppercase">Availability:</span>
                      <p className="text-text-secondary">{req.availability}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                  {req.status === MENTORSHIP_STATUS.PENDING && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={actioningId === `decline_${req.id}`}
                        onClick={() => handleDecline(req)}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        loading={actioningId === req.id}
                        onClick={() => handleAccept(req)}
                      >
                        Accept Request
                      </Button>
                    </>
                  )}

                  {req.status === MENTORSHIP_STATUS.ACCEPTED && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={MessageSquare}
                        onClick={() => handleMessage(req.studentId, student?.fullName)}
                      >
                        Message Student
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await completeMentorship(req.id);
                          await loadData();
                        }}
                      >
                        Mark as Completed
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AlumniMentorship;
