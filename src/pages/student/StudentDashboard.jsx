import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Briefcase, ArrowRight, Send,
  MapPin, Building2, Sparkles, GraduationCap, CheckCircle,
  Award, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { SkeletonDashboard } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import {
  getUserConnections,
  getSentRequests,
  sendConnectionRequest,
  getConnectionStatus,
} from '../../services/connectionService';
import {
  getUpcomingEvents,
  getUserEventRegistrations,
  registerForEvent,
} from '../../services/eventService';
import {
  getOpportunities,
  getAppliedOpportunities,
} from '../../services/opportunityService';
import {
  getRecommendedAlumni,
  getRecommendedStudents,
} from '../../services/userService';
import { formatDate, formatFirebaseError } from '../../utils/formatters';

const StatCard = ({ icon: Icon, label, value, color = 'primary', onClick, sublabel }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-200/90 p-5 flex items-center gap-4 transition-all duration-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 relative overflow-hidden group ${
      onClick ? 'cursor-pointer' : ''
    }`}
  >
    <div
      className={`w-13 h-13 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
        color === 'primary'
          ? 'bg-primary-50 text-primary-800 border border-primary-100'
          : color === 'green'
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
          : color === 'purple'
          ? 'bg-purple-50 text-purple-800 border border-purple-100'
          : 'bg-gold-50 text-gold-800 border border-gold-200'
      }`}
    >
      <Icon size={24} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-3xl font-serif font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-slate-700 truncate mt-0.5 uppercase tracking-wider">{label}</p>
      {sublabel && <p className="text-[11px] text-slate-400 truncate font-medium">{sublabel}</p>}
    </div>
  </div>
);

const StudentDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [opportunities, setOpportunities] = useState([]);
  const [appliedOppIds, setAppliedOppIds] = useState(new Set());

  // Recommendation state
  const [recommendationTab, setRecommendationTab] = useState('alumni'); // 'alumni' | 'students'
  const [recommendedAlumni, setRecommendedAlumni] = useState([]);
  const [recommendedStudents, setRecommendedStudents] = useState([]);
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [connectingId, setConnectingId] = useState(null);
  const [registeringEventId, setRegisteringEventId] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const loadDashboardData = async () => {
      try {
        const userSkills = userProfile?.skills || [];
        const userInterests = userProfile?.interests || [];

        const [conns, sentReqs, userRegs, appliedOpps, opps, recAlumni, recStudents, upcomingEvts] =
          await Promise.all([
            getUserConnections(currentUser.uid),
            getSentRequests(currentUser.uid),
            getUserEventRegistrations(currentUser.uid),
            getAppliedOpportunities(currentUser.uid),
            getOpportunities({}),
            getRecommendedAlumni(userSkills, userInterests, 4),
            getRecommendedStudents(currentUser.uid, userSkills, userInterests, 4),
            getUpcomingEvents(4),
          ]);

        setConnections(conns);
        setSentRequests(sentReqs);
        setRegisteredEventIds(new Set(userRegs));
        setAppliedOppIds(new Set(appliedOpps));
        setOpportunities(opps.slice(0, 4));
        setRecommendedAlumni(recAlumni);
        setRecommendedStudents(recStudents);
        setEvents(upcomingEvts);

        // Fetch connection status for recommended persons
        const allRecommended = [...recAlumni, ...recStudents];
        const statusMap = {};
        await Promise.all(
          allRecommended.map(async (person) => {
            const targetId = person.id || person.uid;
            const status = await getConnectionStatus(currentUser.uid, targetId);
            if (status) {
              statusMap[targetId] = status;
            }
          })
        );
        setConnectionStatuses(statusMap);
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser, userProfile]);

  const handleConnect = async (person) => {
    if (!currentUser) return;
    const targetId = person.id || person.uid;
    setConnectingId(targetId);
    try {
      await sendConnectionRequest(
        currentUser.uid,
        targetId,
        userProfile?.fullName || 'Student'
      );
      setConnectionStatuses((prev) => ({
        ...prev,
        [targetId]: { status: 'pending', senderId: currentUser.uid },
      }));
      setSentRequests((prev) => [...prev, { id: `req_${Date.now()}`, receiverId: targetId }]);
    } catch (e) {
      alert(formatFirebaseError(e));
    } finally {
      setConnectingId(null);
    }
  };

  const handleEventRegister = async (event) => {
    if (!currentUser) return;
    setRegisteringEventId(event.id);
    try {
      await registerForEvent(event.id, currentUser.uid, userProfile?.fullName || 'Student');
      setRegisteredEventIds((prev) => new Set(prev).add(event.id));
    } catch (e) {
      alert('Failed to register for event');
    } finally {
      setRegisteringEventId(null);
    }
  };

  const getConnectionBtn = (targetId) => {
    const conn = connectionStatuses[targetId];
    if (!conn) return { label: 'Connect', disabled: false, variant: 'primary' };
    if (conn.status === 'pending') {
      return {
        label: conn.senderId === currentUser?.uid ? 'Pending' : 'Accept',
        disabled: conn.senderId === currentUser?.uid,
        variant: conn.senderId === currentUser?.uid ? 'outline' : 'success',
      };
    }
    if (conn.status === 'accepted') return { label: 'Connected', disabled: true, variant: 'secondary' };
    return { label: 'Connect', disabled: false, variant: 'primary' };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonDashboard />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Light Blue Welcome Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Collegiate Portal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 tracking-tight">
            Welcome back, {userProfile?.fullName?.split(' ')[0] || 'Scholar'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Engage with distinguished alumni, discover executive opportunities, and build your professional legacy.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button size="sm" variant="secondary" onClick={() => navigate('/student/alumni')}>
            <Users size={15} />
            Explore Directory
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/student/opportunities')}>
            <Briefcase size={15} />
            Find Opportunities
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Send}
          label="Requests Sent"
          value={sentRequests.length}
          sublabel="Pending connections"
          color="purple"
          onClick={() => navigate('/student/connections')}
        />
        <StatCard
          icon={Calendar}
          label="Events Joined"
          value={registeredEventIds.size}
          sublabel="Webinars & meets"
          color="green"
          onClick={() => navigate('/student/events')}
        />
        <StatCard
          icon={Briefcase}
          label="Opportunities Applied"
          value={appliedOppIds.size}
          sublabel="Jobs & fellowships"
          color="orange"
          onClick={() => navigate('/student/opportunities')}
        />
        <StatCard
          icon={Users}
          label="My Connections"
          value={connections.length}
          sublabel="Alumni & student network"
          color="primary"
          onClick={() => navigate('/student/connections')}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Columns: Smart Matches & Opportunities */}
        <div className="xl:col-span-2 space-y-6">
          {/* Smart Match Recommendations Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
                    <Sparkles size={16} />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-slate-900">
                    Smart Match Recommendations
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Curated matches aligned with your fields: {userProfile?.skills?.slice(0, 3).join(', ') || 'Technology & Engineering'}
                </p>
              </div>

              {/* Toggle Tab */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/60">
                <button
                  onClick={() => setRecommendationTab('alumni')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    recommendationTab === 'alumni'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Distinguished Alumni ({recommendedAlumni.length})
                </button>
                <button
                  onClick={() => setRecommendationTab('students')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    recommendationTab === 'students'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Fellow Scholars ({recommendedStudents.length})
                </button>
              </div>
            </div>

            {/* Recommended Alumni Grid */}
            {recommendationTab === 'alumni' && (
              recommendedAlumni.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No alumni matches found yet"
                  description="Check the alumni directory to discover mentors across all departments."
                  action={() => navigate('/student/alumni')}
                  actionLabel="Explore Alumni Directory"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedAlumni.map((alumni) => {
                    const targetId = alumni.id || alumni.uid;
                    const btnProps = getConnectionBtn(targetId);
                    return (
                      <div
                        key={targetId}
                        className="border border-slate-200/90 rounded-2xl p-4.5 hover:shadow-card-hover hover:border-blue-300 transition-all duration-200 bg-gradient-to-b from-white to-slate-50/40 flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <Avatar src={alumni.photoURL} name={alumni.fullName} size="md" ring />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-heading font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                                    {alumni.fullName}
                                  </h4>
                                  {alumni.verificationStatus === 'verified' && (
                                    <span title="Verified Alumni" className="text-emerald-600 flex-shrink-0">
                                      <ShieldCheck size={14} className="fill-emerald-100 text-emerald-700" />
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                                  {alumni.jobRole}
                                </p>
                                {alumni.company && (
                                  <p className="text-xs text-blue-700 font-semibold truncate flex items-center gap-1 mt-0.5">
                                    <Building2 size={11} className="text-blue-600" />
                                    {alumni.company}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 border border-blue-200 shadow-xs">
                              {alumni.matchPercentage || 92}% Match
                            </span>
                          </div>

                          {alumni.location && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-2.5 font-medium">
                              <MapPin size={11} />
                              {alumni.location}
                            </p>
                          )}

                          {alumni.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3.5">
                              {alumni.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className={`tag text-[10px] py-0.5 px-2 ${
                                    userProfile?.skills?.includes(skill)
                                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                                      : ''
                                  }`}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2.5 border-t border-slate-100">
                          <Button
                            size="sm"
                            variant={btnProps.variant}
                            disabled={btnProps.disabled}
                            loading={connectingId === targetId}
                            onClick={() => handleConnect(alumni)}
                            className="flex-1 text-xs"
                          >
                            {btnProps.label}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/student/alumni/${targetId}`)}
                            className="flex-1 text-xs"
                          >
                            Profile
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Recommended Fellow Students Grid */}
            {recommendationTab === 'students' && (
              recommendedStudents.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No student peers found"
                  description="Check back as more classmates update their profiles with skills."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedStudents.map((student) => {
                    const targetId = student.id || student.uid;
                    const btnProps = getConnectionBtn(targetId);
                    return (
                      <div
                        key={targetId}
                        className="border border-slate-200/90 rounded-2xl p-4.5 hover:shadow-card-hover transition-all duration-200 bg-gradient-to-b from-white to-slate-50/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <Avatar src={student.photoURL} name={student.fullName} size="md" />
                              <div className="min-w-0">
                                <h4 className="font-serif font-bold text-slate-900 text-sm truncate">
                                  {student.fullName}
                                </h4>
                                <p className="text-xs text-slate-600 truncate mt-0.5">
                                  {student.department}
                                </p>
                                <p className="text-xs text-purple-700 font-semibold truncate flex items-center gap-1 mt-0.5">
                                  <GraduationCap size={11} />
                                  {student.year || 'Student Scholar'}
                                </p>
                              </div>
                            </div>
                            <span className="bg-purple-50 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 border border-purple-200">
                              {student.matchPercentage || 88}% Match
                            </span>
                          </div>

                          {student.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3.5">
                              {student.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className={`tag text-[10px] py-0.5 px-2 ${
                                    userProfile?.skills?.includes(skill)
                                      ? 'bg-purple-50 text-purple-800 border-purple-200 font-semibold'
                                      : ''
                                  }`}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2.5 border-t border-slate-100">
                          <Button
                            size="sm"
                            variant={btnProps.variant}
                            disabled={btnProps.disabled}
                            loading={connectingId === targetId}
                            onClick={() => handleConnect(student)}
                            className="flex-1 text-xs"
                          >
                            {btnProps.label}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate('/student/connections')}
                            className="flex-1 text-xs"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* Latest Opportunities & Vacancies */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  Latest Opportunities & Vacancies
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exclusive fellowships, internships, and vacancies posted by alumni & corporate partners
                </p>
              </div>
              <button
                onClick={() => navigate('/student/opportunities')}
                className="text-xs font-bold text-primary-800 hover:text-gold-700 flex items-center gap-1 transition-colors"
              >
                View all ({opportunities.length}+) <ArrowRight size={13} />
              </button>
            </div>

            {opportunities.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No opportunities found"
                description="Check back soon as alumni post new vacancies and hackathons."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {opportunities.map((opp) => {
                  const isApplied = appliedOppIds.has(opp.id);
                  const isHackathon = opp.type?.toLowerCase().includes('hackathon');
                  const isVacancy = opp.type?.toLowerCase().includes('vacancy') || opp.type?.toLowerCase().includes('full-time');
                  return (
                    <div
                      key={opp.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 group hover:bg-slate-50/50 rounded-xl px-2 -mx-2 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-serif font-bold text-slate-900 text-sm group-hover:text-primary-800 transition-colors">
                            {opp.title}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isHackathon
                                ? 'bg-gold-50 text-gold-900 border-gold-300'
                                : isVacancy
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-primary-50 text-primary-800 border-primary-200'
                            }`}
                          >
                            {opp.type}
                          </span>
                          {isApplied && (
                            <Badge variant="success" className="text-[10px] px-1.5 py-0.5">
                              ✓ Applied
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Building2 size={12} className="text-gold-600" />
                            {opp.company}
                          </span>
                          {opp.location && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <MapPin size={11} />
                              {opp.location}
                            </span>
                          )}
                          <span className="text-slate-400">• {opp.workMode || 'Remote'}</span>
                          {opp.deadline && (
                            <span className="text-slate-400">
                              • Deadline: {formatDate(opp.deadline)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate('/student/opportunities')}
                          className="text-xs"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Events & Quick Mentorship */}
        <div className="space-y-6">
          {/* Upcoming Events Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-100">
                  <Calendar size={16} />
                </div>
                <h2 className="text-lg font-serif font-bold text-slate-900">
                  Upcoming Events
                </h2>
              </div>
              <button
                onClick={() => navigate('/student/events')}
                className="text-xs font-bold text-primary-800 hover:text-gold-700 flex items-center gap-1 transition-colors"
              >
                All <ArrowRight size={12} />
              </button>
            </div>

            {events.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming events"
                description="Campus webinars and alumni meets will appear here."
              />
            ) : (
              <div className="space-y-3">
                {events.map((event) => {
                  const isRegistered = registeredEventIds.has(event.id);
                  return (
                    <div
                      key={event.id}
                      className="p-3.5 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/80 hover:border-gold-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <Badge variant="primary" className="text-[10px]">
                          {event.type}
                        </Badge>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      <p className="text-sm font-serif font-bold text-slate-900 line-clamp-1">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                        <MapPin size={11} />
                        {event.meetingLink ? 'Online Colloquium' : event.location || 'Campus'}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        {isRegistered ? (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle size={13} /> Registered
                          </span>
                        ) : (
                          <Button
                            size="xs"
                            variant="primary"
                            loading={registeringEventId === event.id}
                            onClick={() => handleEventRegister(event)}
                          >
                            Register
                          </Button>
                        )}
                        <button
                          onClick={() => navigate('/student/events')}
                          className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold"
                        >
                          View Info →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Mentorship & Career Guidance Banner */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-blue-400/30">
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-3.5 shadow-xs">
              <Award size={24} className="text-white" />
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-200 uppercase tracking-widest block mb-1">
              Executive Guidance
            </span>
            <h3 className="font-heading font-bold text-xl mb-1.5 text-white">
              1-on-1 Alumni Mentorship
            </h3>
            <p className="text-blue-50 text-xs mb-5 leading-relaxed font-sans">
              Schedule personalized advisory sessions with distinguished alumni leaders at Google, Microsoft, Goldman Sachs, and top institutions.
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/student/mentorship')}
              className="w-full text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 border-0 shadow-sm"
            >
              Book Advisory Session
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
