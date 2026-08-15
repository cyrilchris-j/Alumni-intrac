import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, Clock, Briefcase, Plus,
  CheckCircle, XCircle, ArrowRight, TrendingUp, Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonDashboard } from '../../components/ui/Skeleton';
import { getUserConnections } from '../../services/connectionService';
import {
  getAlumniMentorshipRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
} from '../../services/mentorshipService';
import { getAlumniOpportunities } from '../../services/opportunityService';
import { getStudentProfile } from '../../services/userService';
import { MENTORSHIP_STATUS } from '../../utils/constants';
import { timeAgo } from '../../utils/formatters';

const StatCard = ({ icon: Icon, label, value, color = 'primary', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-border p-5 flex items-center gap-4 ${
      onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''
    }`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
      color === 'primary' ? 'bg-primary-50' :
      color === 'green' ? 'bg-green-50' :
      color === 'purple' ? 'bg-purple-50' :
      'bg-orange-50'
    }`}>
      <Icon size={22} className={`${
        color === 'primary' ? 'text-primary-600' :
        color === 'green' ? 'text-green-600' :
        color === 'purple' ? 'text-purple-600' :
        'text-orange-600'
      }`} />
    </div>
    <div>
      <p className="text-2xl font-heading font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  </div>
);

const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#9333EA'];

const AlumniDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [studentProfiles, setStudentProfiles] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [actioningId, setActioningId] = useState(null);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [conns, ments, opps] = await Promise.all([
        getUserConnections(currentUser.uid),
        getAlumniMentorshipRequests(currentUser.uid),
        getAlumniOpportunities(currentUser.uid),
      ]);
      setConnections(conns);
      setMentorshipRequests(ments);
      setOpportunities(opps);

      // Load students who requested mentorship
      const studentMap = {};
      await Promise.all(
        ments.map(async (m) => {
          if (!studentMap[m.studentId]) {
            const sp = await getStudentProfile(m.studentId);
            if (sp) studentMap[m.studentId] = sp;
          }
        })
      );
      setStudentProfiles(studentMap);
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
      alert(e.message || 'Failed to accept request');
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
      alert(e.message || 'Failed to decline request');
    } finally {
      setActioningId(null);
    }
  };

  const pendingRequests = mentorshipRequests.filter(
    (m) => m.status === MENTORSHIP_STATUS.PENDING
  );
  const activeMentees = mentorshipRequests.filter(
    (m) => m.status === MENTORSHIP_STATUS.ACCEPTED
  );

  const impactData = [
    { name: 'Connections', count: connections.length },
    { name: 'Mentees', count: activeMentees.length },
    { name: 'Opportunities', count: opportunities.length },
    { name: 'Events', count: 2 },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonDashboard />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Welcome back, {userProfile?.fullName?.split(' ')[0] || 'Alumni'} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Thank you for giving back to the college community.
          </p>
        </div>
        <Button
          leftIcon={Plus}
          onClick={() => navigate('/alumni/opportunities')}
        >
          Post an Opportunity
        </Button>
      </div>

      {/* Verification Notice if Pending */}
      {userProfile?.verificationStatus === 'pending' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-yellow-700 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">Alumni Verification Pending</p>
              <p className="text-xs text-yellow-700">
                Your profile is being reviewed by the college administration. You can still mentor students and post opportunities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Connections"
          value={connections.length}
          color="primary"
          onClick={() => navigate('/alumni/connections')}
        />
        <StatCard
          icon={BookOpen}
          label="Students Mentored"
          value={activeMentees.length}
          color="green"
          onClick={() => navigate('/alumni/mentorship')}
        />
        <StatCard
          icon={Clock}
          label="Pending Requests"
          value={pendingRequests.length}
          color="purple"
          onClick={() => navigate('/alumni/mentorship')}
        />
        <StatCard
          icon={Briefcase}
          label="Opportunities Posted"
          value={opportunities.length}
          color="orange"
          onClick={() => navigate('/alumni/opportunities')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Mentorship Requests - 2/3 */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-heading font-semibold text-text-primary">
                  Recent Mentorship Requests
                </h2>
                <p className="text-xs text-text-secondary">Students asking for your guidance</p>
              </div>
              <button
                onClick={() => navigate('/alumni/mentorship')}
                className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No pending requests"
                description="When students request your mentorship, their requests will appear here."
              />
            ) : (
              <div className="divide-y divide-border">
                {pendingRequests.slice(0, 3).map((req) => {
                  const student = studentProfiles[req.studentId];
                  return (
                    <div key={req.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3">
                          <Avatar src={student?.photoURL} name={student?.fullName} size="md" />
                          <div>
                            <h4 className="font-semibold text-text-primary text-sm">
                              {student?.fullName || 'Student'}
                            </h4>
                            <p className="text-xs text-text-secondary">
                              {student?.department} • {student?.year}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">{timeAgo(req.createdAt)}</p>
                          </div>
                        </div>
                        <Badge variant="warning">Pending</Badge>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 mb-3 text-xs">
                        <span className="font-semibold text-text-primary block mb-1">
                          Topic: {req.topic}
                        </span>
                        <p className="text-text-secondary leading-relaxed line-clamp-2">
                          "{req.message}"
                        </p>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={actioningId === `decline_${req.id}`}
                          onClick={() => handleDecline(req)}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          loading={actioningId === req.id}
                          onClick={() => handleAccept(req)}
                        >
                          Accept Mentorship
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Share Opportunity CTA Banner */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-lg font-heading font-bold mb-1">
                Have an internship or job opening?
              </h3>
              <p className="text-primary-100 text-sm max-w-lg">
                Help talented students from your alma mater launch their careers. Post internships, full-time roles, or referral links.
              </p>
            </div>
            <Button
              variant="secondary"
              className="bg-white text-primary-800 hover:bg-gray-50 flex-shrink-0"
              onClick={() => navigate('/alumni/opportunities')}
            >
              Post an Opportunity
            </Button>
          </div>
        </div>

        {/* Right Side: Impact Overview Chart */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <h2 className="text-lg font-heading font-semibold text-text-primary mb-1">
              Your Community Impact
            </h2>
            <p className="text-xs text-text-secondary mb-4">Summary of your contributions</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlumniDashboard;
