import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, UserCheck, Calendar, Briefcase,
  Megaphone, ArrowRight, ShieldCheck, Activity, UserX
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { SkeletonDashboard } from '../../components/ui/Skeleton';
import { getAllStudents, getAllAlumni, getAllUsers } from '../../services/userService';
import { getEvents } from '../../services/eventService';
import { getOpportunities } from '../../services/opportunityService';
import { timeAgo } from '../../utils/formatters';

const StatCard = ({ icon: Icon, label, value, color = 'primary', onClick, sublabel }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col items-center text-center transition-all duration-200 shadow-card hover:shadow-card-hover hover:border-blue-300 hover:-translate-y-0.5 relative overflow-hidden group ${
      onClick ? 'cursor-pointer' : ''
    }`}
  >
    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 mb-3 ${
      color === 'primary' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
      color === 'green' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
      color === 'purple' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
      'bg-amber-50 text-amber-700 border border-amber-200'
    }`}>
      <Icon size={20} />
    </div>
    <p className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight mb-1">{value}</p>
    <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">{label}</p>
    {sublabel && <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">{sublabel}</p>}
  </div>
);


const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#9333EA'];

const userGrowthData = [
  { month: 'Jan', students: 40, alumni: 20 },
  { month: 'Feb', students: 65, alumni: 35 },
  { month: 'Mar', students: 90, alumni: 48 },
  { month: 'Apr', students: 130, alumni: 70 },
  { month: 'May', students: 180, alumni: 95 },
  { month: 'Jun', students: 240, alumni: 130 },
];

const engagementData = [
  { name: 'Mentorship', value: 45 },
  { name: 'Events', value: 30 },
  { name: 'Opportunities', value: 15 },
  { name: 'Connections', value: 10 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [events, setEvents] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [studs, alums, evts, opps] = await Promise.all([
          getAllStudents(),
          getAllAlumni(),
          getEvents(),
          getOpportunities(),
        ]);
        setStudents(studs);
        setAlumni(alums);
        setEvents(evts);
        setOpportunities(opps);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const pendingVerificationAlumni = alumni.filter(
    (a) => a.verificationStatus === 'pending'
  );

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
            College Administration Dashboard
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Overview of alumni networking, student mentorship, events, and platform activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('/admin/events')}>
            Manage Events
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/admin/announcements')}>
            Post Announcement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={GraduationCap}
          label="Total Students"
          value={students.length}
          color="primary"
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          icon={UserCheck}
          label="Total Alumni"
          value={alumni.length}
          color="green"
          onClick={() => navigate('/admin/alumni')}
        />
        <StatCard
          icon={Calendar}
          label="Events Organized"
          value={events.length}
          color="purple"
          onClick={() => navigate('/admin/events')}
        />
        <StatCard
          icon={Briefcase}
          label="Active Opportunities"
          value={opportunities.length}
          color="orange"
          onClick={() => navigate('/admin/opportunities')}
        />
      </div>

      {/* Pending Verifications Banner if any */}
      {pendingVerificationAlumni.length > 0 && (
        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold">
              {pendingVerificationAlumni.length}
            </div>
            <div>
              <p className="text-sm font-bold text-primary-900">
                Alumni Profiles Awaiting Verification
              </p>
              <p className="text-xs text-primary-700">
                Review graduation year and company credentials to award verified status.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate('/admin/alumni')}>
            Review Alumni
          </Button>
        </div>
      )}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* User Growth Line Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-heading font-bold text-text-primary">User Growth</h2>
              <p className="text-xs text-text-secondary">Students and alumni joined over time</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="#2563EB" strokeWidth={2.5} name="Students" />
                <Line type="monotone" dataKey="alumni" stroke="#16A34A" strokeWidth={2.5} name="Alumni" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alumni Engagement Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-heading font-bold text-text-primary mb-1">
              Alumni Engagement
            </h2>
            <p className="text-xs text-text-secondary mb-4">Breakdown of platform interactions</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Engaged Alumni & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Engaged Alumni */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-heading font-bold text-text-primary">
                Top Engaged Alumni
              </h2>
              <p className="text-xs text-text-secondary">Alumni most active in mentorship and opportunities</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/admin/alumni')}>
              View All
            </Button>
          </div>

          <div className="divide-y divide-border">
            {alumni.slice(0, 4).map((al) => (
              <div key={al.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={al.photoURL} name={al.fullName} size="md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-text-primary text-sm">{al.fullName}</p>
                      {al.verificationStatus === 'verified' && (
                        <Badge variant="success" className="text-[10px]">✓</Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">{al.jobRole} at {al.company}</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold text-text-primary">Class of {al.graduationYear}</p>
                  <p className="text-text-muted">{al.department?.split(' ')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-primary-600" />
            <h2 className="text-lg font-heading font-bold text-text-primary">Recent Activity</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-text-primary">New alumni registered</p>
                <p className="text-text-secondary">Priya Menon (Google) joined the network</p>
                <span className="text-[10px] text-text-muted">10 mins ago</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-text-primary">Mentorship request accepted</p>
                <p className="text-text-secondary">Arjun Sharma accepted Rahul's mentorship request</p>
                <span className="text-[10px] text-text-muted">1 hour ago</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-text-primary">New opportunity posted</p>
                <p className="text-text-secondary">Frontend Developer Intern at TCS</p>
                <span className="text-[10px] text-text-muted">3 hours ago</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-text-primary">Event registration milestone</p>
                <p className="text-text-secondary">50 students registered for Annual Alumni Meet</p>
                <span className="text-[10px] text-text-muted">5 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
