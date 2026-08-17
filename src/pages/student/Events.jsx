import { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Clock, Users, Video, CheckCircle,
  ExternalLink, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  getEvents,
  registerForEvent,
  cancelEventRegistration,
  getUserEventRegistrations,
} from '../../services/eventService';
import { formatDate } from '../../utils/formatters';

const Events = () => {
  const { currentUser, userProfile } = useAuth();
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'registered'

  const loadEventsData = async () => {
    setLoading(true);
    try {
      const [allEvents, userRegs] = await Promise.all([
        getEvents(),
        currentUser ? getUserEventRegistrations(currentUser.uid) : Promise.resolve([]),
      ]);
      setEvents(allEvents);
      setRegisteredEventIds(new Set(userRegs));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventsData();
  }, [currentUser]);

  const handleToggleRegistration = async (event) => {
    if (!currentUser) return;
    setActioningId(event.id);
    const isRegistered = registeredEventIds.has(event.id);

    try {
      if (isRegistered) {
        await cancelEventRegistration(event.id, currentUser.uid);
        setRegisteredEventIds((prev) => {
          const next = new Set(prev);
          next.delete(event.id);
          return next;
        });
      } else {
        await registerForEvent(event.id, currentUser.uid, userProfile?.fullName || 'Student');
        setRegisteredEventIds((prev) => new Set(prev).add(event.id));
      }
    } catch (err) {
      alert(err.message || 'Failed to update registration.');
    } finally {
      setActioningId(null);
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (activeFilter === 'registered') {
      return registeredEventIds.has(ev.id);
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Campus & Alumni Events
          </span>
          <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight mt-1.5">
            Colloquiums, Meets & Workshops
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Participate in webinars, networking meets, and skill workshops hosted by industry leaders.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeFilter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveFilter('all')}
            className="text-xs font-semibold"
          >
            All Events
          </Button>
          <Button
            variant={activeFilter === 'registered' ? 'gold' : 'secondary'}
            size="sm"
            leftIcon={CheckCircle}
            onClick={() => setActiveFilter('registered')}
            className="text-xs font-semibold"
          >
            My Registrations ({registeredEventIds.size})
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={activeFilter === 'registered' ? "No active registrations" : "No scheduled events"}
          description={activeFilter === 'registered' ? "You haven't reserved seating for any upcoming gatherings." : "New colloquiums and keynote sessions will be published here."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isRegistered = registeredEventIds.has(event.id);
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-card-hover hover:border-blue-200 transition-all duration-200 flex flex-col group shadow-card"
              >
                <div className="h-2.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 w-full" />
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="primary">{event.type || 'Colloquium'}</Badge>
                      {isRegistered && (
                        <Badge variant="emerald" dot>Registered</Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-heading font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed font-sans">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-600 mb-6 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary-600" />
                        <span>{formatDate(event.date)}</span>
                        {event.time && <span>• {event.time}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {event.meetingLink ? (
                          <>
                            <Video size={14} className="text-primary-600" />
                            <span className="truncate">Online Meeting</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={14} className="text-primary-600" />
                            <span className="truncate">{event.location || 'College Campus'}</span>
                          </>
                        )}
                      </div>
                      {event.organizer && (
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-primary-600" />
                          <span>Organized by: {event.organizer}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      fullWidth
                      size="sm"
                      variant={isRegistered ? 'danger' : 'primary'}
                      loading={actioningId === event.id}
                      onClick={() => handleToggleRegistration(event)}
                    >
                      {isRegistered ? 'Cancel Registration' : 'Register for Event'}
                    </Button>
                    {isRegistered && event.meetingLink && (
                      <a
                        href={event.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary btn-sm p-2 rounded-lg"
                        title="Join Link"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
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

export default Events;
