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

const StatCard = ({ icon: Icon, label, value, color = 'primary', onClick, sublabel }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-card hover:shadow-card-hover hover:border-gold-300 hover:-translate-y-0.5 relative overflow-hidden group ${
      onClick ? 'cursor-pointer' : ''
    }`}
  >
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
        color === 'primary' ? 'bg-primary-50 text-primary-800 border border-primary-100' :
        color === 'green' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
        color === 'purple' ? 'bg-purple-50 text-purple-800 border border-purple-100' :
        'bg-amber-50 text-amber-800 border border-amber-200'
      }`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
    <div>
      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">{label}</p>
      {sublabel && <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">{sublabel}</p>}
    </div>
  </div>
);

const COLORS = ['#0A1224', '#047857', '#C9A23E', '#6B21A8'];

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
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Welcome back, {userProfile?.fullName?.split(' ')[0] || 'Alumni'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Thank you for shaping future generations of collegiate scholars.
          </p>
        </div>
        <Button
          variant="gold"
          leftIcon={Plus}
          onClick={() => navigate('/alumni/opportunities')}
          className="shadow-gold-glow text-xs font-bold"
        >
          Post an Opportunity
        </Button>
      </div>

      {/* Verification Notice if Pending */}
      {userProfile?.verificationStatus === 'pending' && (
        <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-700 flex-shrink-0" />
            <div>
              <p className="text-sm font-serif font-bold text-amber-900">Institutional Verification in Progress</p>
              <p className="text-xs text-amber-700 mt-0.5 font-sans">
                Your credentials are being reviewed by the alumni administration office. You can continue to mentor scholars and post vacancies.
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
          label="Scholars Mentored"
          value={activeMentees.length}
          color="green"
          onClick={() => navigate('/alumni/mentorship')}
        />
        <StatCard
          icon={Clock}
          label="Pending Inquiries"
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900">
                  Recent Mentorship Inquiries
                </h2>
                <p className="text-xs text-slate-500">Students seeking your counsel and industry expertise</p>
              </div>
              <button
                onClick={() => navigate('/alumni/mentorship')}
                className="text-xs text-primary-900 font-bold flex items-center gap-1 hover:text-gold-700 transition-colors uppercase tracking-wider"
              >
                View all <ArrowRight size={13} />
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No pending requests"
                description="When students request your mentorship, their requests will appear here."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingRequests.slice(0, 3).map((req) => {
                  const student = studentProfiles[req.studentId];
                  return (
                    <div key={req.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3">
                          <Avatar src={student?.photoURL} name={student?.fullName} size="md" ring />
                          <div>
                            <h4 className="font-serif font-bold text-slate-900 text-sm">
                              {student?.fullName || 'Collegiate Scholar'}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                              {student?.department} • {student?.year}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(req.createdAt)}</p>
                          </div>
                        </div>
                        <Badge variant="gold">Pending Inquiry</Badge>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3.5 mb-3 text-xs border border-slate-100">
                        <span className="font-serif font-bold text-slate-900 block mb-1">
                          Objective: {req.topic}
                        </span>
                        <p className="text-slate-600 leading-relaxed line-clamp-2 italic font-sans">
                          "{req.message}"
                        </p>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          loading={actioningId === `decline_${req.id}`}
                          onClick={() => handleDecline(req)}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          variant="gold"
                          className="text-xs font-bold"
                          loading={actioningId === req.id}
                          onClick={() => handleAccept(req)}
                        >
                          Accept Advisory
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Impact Overview Chart */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card">
            <h2 className="text-lg font-serif font-bold text-slate-900 mb-1">
              Community Contributions
            </h2>
            <p className="text-xs text-slate-500 mb-4">Summary of your institutional engagement</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A1224',
                      borderColor: '#C9A23E',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#C9A23E" radius={[6, 6, 0, 0]} />
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
