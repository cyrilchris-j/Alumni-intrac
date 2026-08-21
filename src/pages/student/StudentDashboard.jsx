import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Briefcase, ArrowRight, Send,
  MapPin, Building2, Sparkles, GraduationCap, CheckCircle,
  Award, ShieldCheck, ChevronRight, Video, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { SkeletonDashboard } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
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
  cancelEventRegistration,
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
    className={`bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-card hover:shadow-card-hover hover:border-blue-300 hover:-translate-y-0.5 relative overflow-hidden group ${
      onClick ? 'cursor-pointer' : ''
    }`}
  >
    <div className="flex items-center justify-between gap-3 mb-3">
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
          color === 'primary'
            ? 'bg-blue-50 text-blue-700 border border-blue-100'
            : color === 'green'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : color === 'purple'
            ? 'bg-purple-50 text-purple-700 border border-purple-100'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
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

  // Event modal states
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [confirmModalEvent, setConfirmModalEvent] = useState(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [actioningId, setActioningId] = useState(null);

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

  const handleOpenConfirmModal = (event) => {
    setConfirmModalEvent(event);
    setConfirmInput('');
    setConfirmError('');
  };

  const handleConfirmRegistration = async (e) => {
    if (e) e.preventDefault();
    if (!confirmModalEvent || !currentUser) return;

    if (confirmInput.trim().toLowerCase() !== 'confirm') {
      setConfirmError("Please type 'confirm' to verify your registration.");
      return;
    }

    setConfirming(true);
    try {
      await registerForEvent(confirmModalEvent.id, currentUser.uid, userProfile?.fullName || 'Student');
      setRegisteredEventIds((prev) => new Set(prev).add(confirmModalEvent.id));

      const extLink = confirmModalEvent.registrationLink || confirmModalEvent.externalLink;
      if (extLink) {
        window.open(extLink, '_blank', 'noopener,noreferrer');
      }

      setConfirmModalEvent(null);
      if (selectedEventModal?.id === confirmModalEvent.id) {
        setSelectedEventModal(null);
      }
    } catch (e) {
      alert('Failed to register for event');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelRegistration = async (event) => {
    if (!currentUser) return;
    setActioningId(event.id);
    try {
      await cancelEventRegistration(event.id, currentUser.uid);
      setRegisteredEventIds((prev) => {
        const next = new Set(prev);
        next.delete(event.id);
        return next;
      });
      if (selectedEventModal?.id === event.id) {
        setSelectedEventModal(null);
      }
    } catch (err) {
      alert('Failed to cancel registration.');
    } finally {
      setActioningId(null);
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
            </div>

            {/* Recommended Alumni Grid */}
            {recommendedAlumni.length === 0 ? (
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
                        {(opp.externalLink || opp.registrationLink) && (
                          <a
                            href={opp.externalLink || opp.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary btn-sm text-xs p-2 rounded-lg text-blue-700 flex items-center gap-1 font-semibold"
                            title="Open Application Form / Website Link"
                          >
                            Form Link →
                          </a>
                        )}
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
                            onClick={() => handleOpenConfirmModal(event)}
                          >
                            Register
                          </Button>
                        )}
                        <button
                          onClick={() => setSelectedEventModal(event)}
                          className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold whitespace-nowrap flex-shrink-0"
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


        </div>
      </div>

      {/* Event Details / View Info Modal */}
      <Modal
        isOpen={!!selectedEventModal}
        onClose={() => setSelectedEventModal(null)}
        title={selectedEventModal?.title}
        size="lg"
      >
        {selectedEventModal && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-100">
              <Badge variant="primary">{selectedEventModal.type || 'Colloquium'}</Badge>
              {registeredEventIds.has(selectedEventModal.id) && (
                <Badge variant="emerald" dot>Registered</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl text-xs border border-slate-200">
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Date & Time</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary-600" />
                  {formatDate(selectedEventModal.date)} {selectedEventModal.time && `• ${selectedEventModal.time}`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Venue / Platform</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                  {selectedEventModal.meetingLink ? (
                    <>
                      <Video size={13} className="text-primary-600" />
                      Online Meeting
                    </>
                  ) : (
                    <>
                      <MapPin size={13} className="text-primary-600" />
                      {selectedEventModal.location || 'College Campus'}
                    </>
                  )}
                </span>
              </div>
              {selectedEventModal.organizer && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block mb-0.5 font-medium">Host / Organizer</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Users size={13} className="text-primary-600" />
                    {selectedEventModal.organizer}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Event Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {selectedEventModal.description}
              </p>
            </div>

            {/* Google Form / External Registration Link Banner */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                  <ExternalLink size={15} className="text-blue-600 flex-shrink-0" />
                  Official Google Form / Registration Link
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  Click below to open the official registration form or event portal website.
                </p>
              </div>
              <a
                href={selectedEventModal.registrationLink || selectedEventModal.externalLink || 'https://forms.google.com/demo-event-registration'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-sm text-xs px-3.5 py-2 flex items-center gap-1.5 flex-shrink-0 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
              >
                Open Link <ExternalLink size={13} />
              </a>
            </div>

            {selectedEventModal.meetingLink && registeredEventIds.has(selectedEventModal.id) && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-emerald-900">Online Meeting Link</p>
                  <p className="text-emerald-700 text-[11px] mt-0.5">Use this link to join the live virtual session.</p>
                </div>
                <a
                  href={selectedEventModal.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-emerald btn-sm text-xs px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Join Meeting <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Registration Confirmation Modal */}
      <Modal
        isOpen={!!confirmModalEvent}
        onClose={() => setConfirmModalEvent(null)}
        title="Confirm Event Registration"
        size="md"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setConfirmModalEvent(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              loading={confirming}
              disabled={confirmInput.trim().toLowerCase() !== 'confirm' || confirming}
              onClick={handleConfirmRegistration}
            >
              Confirm Registration
            </Button>
          </div>
        }
      >
        <form onSubmit={handleConfirmRegistration} className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Please confirm your registration for{' '}
            <strong className="text-slate-900">{confirmModalEvent?.title}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              To confirm registration, please type <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">confirm</code> below:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => {
                setConfirmInput(e.target.value);
                if (confirmError) setConfirmError('');
              }}
              placeholder="Type 'confirm' to verify"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              autoFocus
            />
            {confirmError && (
              <p className="text-xs text-red-600 font-medium mt-1">{confirmError}</p>
            )}
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default StudentDashboard;
