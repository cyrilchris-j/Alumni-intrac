import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, Calendar, Briefcase, ArrowRight,
  TrendingUp, Search, MapPin, Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { SkeletonDashboard, SkeletonCard } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { getUserConnections } from '../../services/connectionService';
import { getStudentMentorshipRequests } from '../../services/mentorshipService';
import { getUpcomingEvents } from '../../services/eventService';
import { getOpportunities } from '../../services/opportunityService';
import { searchAlumni } from '../../services/userService';
import { sendConnectionRequest } from '../../services/connectionService';
import { formatDate, formatFirebaseError, truncate } from '../../utils/formatters';
import { MENTORSHIP_STATUS } from '../../utils/constants';

const StatCard = ({ icon: Icon, label, value, color = 'primary', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-border p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''}`}
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

const StudentDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [events, setEvents] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [recommendedAlumni, setRecommendedAlumni] = useState([]);
  const [connectingId, setConnectingId] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const load = async () => {
      try {
        const [conns, ments, evts, opps, alumni] = await Promise.all([
          getUserConnections(currentUser.uid),
          getStudentMentorshipRequests(currentUser.uid),
          getUpcomingEvents(3),
          getOpportunities({}),
          searchAlumni('', {}),
        ]);
        setConnections(conns);
        setMentorships(ments);
        setEvents(evts);
        setOpportunities(opps.slice(0, 3));
        setRecommendedAlumni(alumni.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser]);

  const handleConnect = async (alumni) => {
    if (!currentUser) return;
    setConnectingId(alumni.id);
    try {
      await sendConnectionRequest(
        currentUser.uid,
        alumni.id,
        userProfile?.fullName || 'Student'
      );
      alert(`Connection request sent to ${alumni.fullName}!`);
    } catch (e) {
      alert(formatFirebaseError(e));
    } finally {
      setConnectingId(null);
    }
  };

  const pendingMentorships = mentorships.filter((m) => m.status === MENTORSHIP_STATUS.PENDING);

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonDashboard />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Welcome back, {userProfile?.fullName?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Here's what's happening in your network today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Connections"
          value={connections.length}
          color="primary"
          onClick={() => navigate('/student/connections')}
        />
        <StatCard
          icon={BookOpen}
          label="Mentorship Requests"
          value={pendingMentorships.length}
          color="purple"
          onClick={() => navigate('/student/mentorship')}
        />
        <StatCard
          icon={Calendar}
          label="Events Joined"
          value={events.length}
          color="green"
          onClick={() => navigate('/student/events')}
        />
        <StatCard
          icon={Briefcase}
          label="Opportunities"
          value={opportunities.length}
          color="orange"
          onClick={() => navigate('/student/opportunities')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recommended Alumni - 2/3 width */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-text-primary">Recommended Alumni</h2>
              <button
                onClick={() => navigate('/student/alumni')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>

            {recommendedAlumni.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No alumni found"
                description="Check back later as more alumni join the platform."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedAlumni.map((alumni) => (
                  <div
                    key={alumni.id}
                    className="border border-border rounded-xl p-4 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar src={alumni.photoURL} name={alumni.fullName} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-text-primary text-sm truncate">{alumni.fullName}</h4>
                          {alumni.verificationStatus === 'verified' && (
                            <Badge variant="success" className="text-[10px] px-1.5 py-0.5 flex-shrink-0">✓</Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate">{alumni.jobRole}</p>
                        {alumni.company && (
                          <p className="text-xs text-primary-600 font-medium truncate flex items-center gap-1">
                            <Building2 size={10} />
                            {alumni.company}
                          </p>
                        )}
                      </div>
                    </div>

                    {alumni.location && (
                      <p className="text-xs text-text-muted flex items-center gap-1 mb-2">
                        <MapPin size={11} />
                        {alumni.location}
                      </p>
                    )}

                    {alumni.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {alumni.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="tag">{skill}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        loading={connectingId === alumni.id}
                        onClick={() => handleConnect(alumni)}
                        className="flex-1"
                      >
                        Connect
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/student/alumni/${alumni.id}`)}
                        className="flex-1"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opportunities */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-text-primary">Recent Opportunities</h2>
              <button
                onClick={() => navigate('/student/opportunities')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>

            {opportunities.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No opportunities yet"
                description="Check back soon for internships and jobs posted by alumni."
              />
            ) : (
              <div className="divide-y divide-border">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-medium text-text-primary text-sm truncate">{opp.title}</h4>
                        <Badge variant="primary" className="flex-shrink-0">{opp.type}</Badge>
                      </div>
                      <p className="text-xs text-text-secondary flex items-center gap-3">
                        <span className="flex items-center gap-1"><Building2 size={11} />{opp.company}</span>
                        {opp.location && <span className="flex items-center gap-1"><MapPin size={11} />{opp.location}</span>}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate('/student/opportunities')}
                      className="flex-shrink-0"
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-text-primary">Upcoming Events</h2>
              <button
                onClick={() => navigate('/student/events')}
                className="text-sm text-primary-600 font-medium flex items-center gap-1"
              >
                All <ArrowRight size={14} />
              </button>
            </div>

            {events.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming events"
                description="Stay tuned for upcoming events and webinars."
              />
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="primary" className="text-[10px]">{event.type}</Badge>
                      <span className="text-xs text-text-secondary">{formatDate(event.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Career Guidance CTA */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-6 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={22} className="text-white" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">Looking for career guidance?</h3>
            <p className="text-primary-100 text-sm mb-4 leading-relaxed">
              Connect with alumni who can help you navigate your next step.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white text-primary-700 hover:bg-primary-50 w-full"
              onClick={() => navigate('/student/mentorship')}
            >
              Find a Mentor
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
